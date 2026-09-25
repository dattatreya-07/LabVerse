import { NextRequest, NextResponse } from 'next/server';
import { TutorRequest, TutorResponse, SourceReference } from '@/types';
import { retrieveRelevantChunks } from '@/lib/ai/rag';
import { getExperiment } from '@/lib/experiments/registry';
import { checkRateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { validateAndSanitizePrompt, scrubPII } from '@/lib/security/input-sanitizer';
import { applySecurityHeaders } from '@/lib/security/security-headers';

export async function POST(req: NextRequest) {
  // 1. Rate limiting check (20 requests per minute per IP)
  const clientIP = getClientIP(req.headers);
  const rateLimit = checkRateLimit(`tutor_${clientIP}`, 20, 60000);

  if (!rateLimit.isAllowed) {
    const errorResp = NextResponse.json(
      { error: `Too many AI tutor requests. Please wait ${rateLimit.resetSeconds} seconds before retrying.` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.resetSeconds) } }
    );
    return applySecurityHeaders(errorResp);
  }

  try {
    // 2. Request body payload size check (max 100 KB)
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    if (contentLength > 102400) {
      const resp = NextResponse.json(
        { error: 'Payload size exceeds maximum allowable limit of 100 KB.' },
        { status: 413 }
      );
      return applySecurityHeaders(resp);
    }

    const body: TutorRequest = await req.json();
    const { question, experimentId, components, connections, parameters, latestResult, activeFaults } = body;

    // 3. Server-side validation of input question
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      const resp = NextResponse.json(
        { error: 'A valid non-empty question string is required.' },
        { status: 400 }
      );
      return applySecurityHeaders(resp);
    }

    if (question.length > 1000) {
      const resp = NextResponse.json(
        { error: 'Question exceeds maximum limit of 1000 characters.' },
        { status: 400 }
      );
      return applySecurityHeaders(resp);
    }

    // 4. Prompt injection detection and PII scrubbing
    const promptCheck = validateAndSanitizePrompt(question);
    if (promptCheck.isFlagged) {
      console.warn(`[Security Alert] Flagged prompt injection from IP ${clientIP}: ${promptCheck.flagReason}`);
    }

    const sanitizedQuestion = promptCheck.sanitized;
    const expDef = getExperiment(experimentId || 'ohms-law');
    
    // Retrieve grounded knowledge chunks
    const retrievalResult = retrieveRelevantChunks(sanitizedQuestion, expDef.id, 3);
    const sources: SourceReference[] = retrievalResult.sources;

    // Summarize live workspace state for LLM context (strictly scrubbed of any PII)
    const compSummary = components && components.length > 0 
      ? components.map(c => `${c.title} (${c.type})`).join(', ') 
      : 'Default Apparatus Setup';
    
    const connCount = connections ? connections.length : 0;
    const measSummary = latestResult?.measurements
      ? latestResult.measurements.map(m => `${m.label}: Theo=${m.theoreticalValue} ${m.unit}, Obs=${m.observedValue} ${m.unit}`).join('; ')
      : 'No measurements recorded yet';

    const stateContext = scrubPII(`[Experiment: ${expDef.title}]
[Domain: ${expDef.domain}]
[Apparatus Components: ${compSummary}]
[Connections count: ${connCount}]
[Parameters: ${JSON.stringify(parameters || {})}]
[Active Faults: ${activeFaults?.join(', ') || 'None'}]
[Latest Simulation Measurements: ${measSummary}]
[Circuit Topology: ${latestResult?.topology?.circuitTopology || 'N/A'}]
[Topology Status: ${latestResult?.topology?.message || 'N/A'}]`);

    const groqApiKey = process.env.GROQ_API_KEY;
    const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (groqApiKey) {
      try {
        const ragContextText = retrievalResult.chunks.map((c, idx) => `[Source ${idx + 1}: ${c.title}]\n${c.content}`).join('\n\n');
        
        const systemPrompt = `You are LabVerse AI Science & Diagnostic Tutor, an expert academic assistant for ${expDef.title}.
Analyze the student's query against the live virtual laboratory state and verified knowledge base below.
Explain scientific principles, diagnose hardware/fault anomalies, and guide the student step-by-step.
Always refer to actual simulated readings from the live state. Never fabricate measurements or fake parameters.

Live Laboratory State:
${stateContext}

Retrieved Grounded Knowledge Corpus:
${ragContextText}

${!retrievalResult.hasRelevantEvidence ? '[Note: Low retrieval match. Explain using general physics/electronics principles.]' : ''}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: groqModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: sanitizedQuestion }
            ],
            temperature: 0.3,
            max_tokens: 650,
          }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const aiAnswer = data.choices?.[0]?.message?.content;
          if (aiAnswer) {
            const tutorResp: TutorResponse = {
              answer: aiAnswer,
              sources,
              isCuratedFallback: false,
              grounded: retrievalResult.hasRelevantEvidence,
              timestamp: new Date().toLocaleTimeString(),
            };
            const jsonResp = NextResponse.json(tutorResp);
            return applySecurityHeaders(jsonResp);
          }
        }
      } catch (groqErr) {
        console.warn('Groq API call failed or timed out; utilizing fallback engine:', groqErr);
      }
    }

    // Fallback: Generate curated response from RAG index & current lab state
    const fallbackAnswer = generateCuratedResponse(sanitizedQuestion, expDef, latestResult, activeFaults);

    const tutorResp: TutorResponse = {
      answer: fallbackAnswer,
      sources,
      isCuratedFallback: true,
      grounded: retrievalResult.hasRelevantEvidence,
      timestamp: new Date().toLocaleTimeString(),
    };

    const jsonResp = NextResponse.json(tutorResp);
    return applySecurityHeaders(jsonResp);

  } catch (error) {
    console.error('Tutor API Route Error:', error);
    const errResp = NextResponse.json(
      { error: 'Internal server error processing tutor request.' },
      { status: 500 }
    );
    return applySecurityHeaders(errResp);
  }
}

function generateCuratedResponse(
  q: string,
  expDef: import('@/types').ExperimentDefinition,
  latestResult?: import('@/types').SimulationResult | null,
  activeFaults?: string[]
): string {
  const lower = q.toLowerCase();

  // Fault 1: Open circuit
  if (activeFaults?.includes('FAULT_OPEN_CIRCUIT') || latestResult?.topology?.circuitTopology === 'OPEN' || lower.includes('zero') || lower.includes('open')) {
    return `### 🔍 Open Circuit Discontinuity Diagnosis
Currently, the circuit has an **Open Circuit Discontinuity**.

- **Theoretical Current ($V/R$):** ${latestResult?.measurements.find(m => m.id === 'current_meas')?.theoreticalValue ?? '0.30'} A
- **Observed Ammeter Reading:** **0.00 A**

**Why is current zero?**
An open circuit means the conductive pathway is broken or a switch is open. Air has effectively infinite resistance ($R \\approx \\infty$), so no electrons can flow through the loop.

**Actionable Fix:** Close the knife switch or verify that all wires form an unbroken loop from Battery (+) to Resistor to Ammeter back to Battery (-).`;
  }

  // Fault 2: Meter calibration error
  if (activeFaults?.includes('FAULT_METER_CALIBRATION')) {
    const theoI = latestResult?.measurements.find(m => m.id === 'current_meas')?.theoreticalValue ?? 0.30;
    const obsI = latestResult?.measurements.find(m => m.id === 'current_meas')?.observedValue ?? 0.75;
    return `### ⚠️ Ammeter Calibration Drift Diagnosis
The ammeter is exhibiting an **Instrumental Systematic Calibration Error**.

- **Physical Circuit Current ($I = V/R$):** ${theoI} A
- **Ammeter Display Reading:** **${obsI} A**

**Diagnosis:**
The physical current in the wire is actually **${theoI} A**, but the instrument's internal amplifier gain is offset by **+150% (2.5× multiplier)**. This represents an instrumental error, not a failure of physical law.

**Key Takeaway:** Always cross-reference instrument readings against theoretical physics models ($I = V/R$).`;
  }

  // General Theory & Formula Explanation
  return `### 💡 ${expDef.title} Guidance

${expDef.theory.corePrinciple}

**Governing Formula:**
$$\n${expDef.report.governingFormulaLatex}\n$$

${latestResult ? `**Active Measurements:**\n` + latestResult.measurements.map(m => `- **${m.label}:** ${m.observedValue} ${m.unit} (Theoretical: ${m.theoreticalValue} ${m.unit})`).join('\n') : '*Tip: Click Run Experiment to record your first measurement.*'}

*Note: Server is operating in offline curated grounded knowledge mode. Set \`GROQ_API_KEY\` in environment settings for live LLM reasoning.*`;
}
