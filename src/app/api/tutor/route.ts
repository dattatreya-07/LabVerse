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

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;
    const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const ragContextText = retrievalResult.chunks.map((c, idx) => `[Source ${idx + 1}: ${c.title}]\n${c.content}`).join('\n\n');
    
    const systemPrompt = `You are LabVerse AI Expert Science & Diagnostic Tutor for ${expDef.title} (${expDef.domain} Domain).
Analyze the student's question against the live virtual laboratory state and verified knowledge base below.
Encourage scientific reasoning, explain 3D physical principles, equations, and diagnose hardware/fault anomalies.
Always refer to actual simulated readings from the live state. Never fabricate measurements or fake parameters.

Live Laboratory State:
${stateContext}

Retrieved Grounded Knowledge Corpus:
${ragContextText}

${!retrievalResult.hasRelevantEvidence ? '[Note: Low retrieval match. Explain using general principles.]' : ''}`;

    // 1. Try Gemini API first if configured
    if (geminiApiKey) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nStudent Question:\n${sanitizedQuestion}` }]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 600,
            }
          })
        });

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const aiAnswer = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiAnswer) {
            const tutorResp: TutorResponse = {
              answer: aiAnswer,
              sources,
              isCuratedFallback: false,
              grounded: true,
              timestamp: new Date().toLocaleTimeString(),
            };
            return applySecurityHeaders(NextResponse.json(tutorResp));
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back:', geminiErr);
      }
    }

    // 2. Try Groq API if configured
    if (groqApiKey) {
      try {
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
            return applySecurityHeaders(NextResponse.json(tutorResp));
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

  // Antenna specific queries
  if (expDef.id === 'antenna-radiation' || expDef.domain === 'ECE') {
    const eField = latestResult?.measurements.find(m => m.id === 'e_field')?.observedValue ?? '3.50';
    const fspl = latestResult?.measurements.find(m => m.id === 'path_loss')?.observedValue ?? '51.5';
    const s = latestResult?.measurements.find(m => m.id === 'power_density')?.observedValue ?? '32.5';
    const wave = latestResult?.measurements.find(m => m.id === 'wavelength')?.observedValue ?? '20.0';

    if (lower.includes('dish') || lower.includes('focus') || lower.includes('beam')) {
      return `### 📡 Parabolic Dish Directivity & Beam Focus
A **Parabolic Dish** uses a metallic reflector surface to focus spherical wavefronts into a highly collimated **pencil beam lobe**.

- **Antenna Gain ($G_t$):** ~28.2 (14.5 dBi) vs Dipole (2.15 dBi).
- **Beamwidth (HPBW):** Extremely narrow (~18° Half Power Beam Width).
- **Physics Principle:** By focusing RF transmit energy in a single direction $\\theta = 0^\\circ$, peak Electric Field strength ($E$) and Poynting power density ($S$) increase dramatically along the main axis compared to isotropic radiation.`;
    }

    if (lower.includes('field') || lower.includes('formula') || lower.includes('equation') || lower.includes('e-field')) {
      return `### ⚡ Electric Field Intensity $E(r)$ Derivation
The far-field Peak Electric Field strength at radial probe distance $r$ from the transmitter is given by:

$$
E(r) = \\frac{\\sqrt{30 \\cdot P_t \\cdot G_t}}{r} \\quad \\text{[V/m]}
$$

**Current Simulation Parameters:**
- **Electric Field Strength $E$:** **${eField} V/m**
- **Poynting Power Density $S$:** **${s} mW/m²** ($S = \\frac{|E|^2}{\\eta_0}$, where $\\eta_0 = 377\\,\\Omega$)
- **Wave Attenuation:** $E \\propto \\frac{1}{r}$ (Inverse-Square Law for power density $S \\propto \\frac{1}{r^2}$).`;
    }

    if (lower.includes('loss') || lower.includes('fspl') || lower.includes('frequency') || lower.includes('path')) {
      return `### 📉 Free Space Path Loss (FSPL) & Frequency Scaling
Free Space Path Loss measures how much signal attenuates as electromagnetic waves expand spherically over distance:

$$
\\text{FSPL (dB)} = 20 \\log_{10}(r) + 20 \\log_{10}(f_{\\text{MHz}}) - 27.55
$$

**Active Lab Metrics:**
- **Current FSPL:** **${fspl} dB**
- **Wavelength ($\\lambda = \\frac{c}{f}$):** **${wave} cm**

**Key Concept:** Higher carrier frequencies ($f$) have shorter wavelengths ($\\lambda$), resulting in smaller effective aperture capture areas at the receiver probe and higher free space path loss in dB over distance.`;
    }

    if (lower.includes('dipole') || lower.includes('yagi') || lower.includes('difference')) {
      return `### 🔄 Omni Dipole vs Yagi-Uda Array Comparison
1. **Omni-Directional Dipole:** Radiates energy uniformly in 360° horizontally, creating a characteristic **3D Torus (Donut) radiation pattern**.
2. **Yagi-Uda Array:** Employs passive reflector and director rods to create an asymmetrical **end-fire beam lobe** with back/side lobes (~10.5 gain).
3. **Parabolic Dish:** Maximizes long-range directional gain for satellite communication links.`;
    }
  }

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
$$
${expDef.report.governingFormulaLatex}
$$

${latestResult ? `**Active Measurements:**\n` + latestResult.measurements.map(m => `- **${m.label}:** ${m.observedValue} ${m.unit} (Theoretical: ${m.theoreticalValue} ${m.unit})`).join('\n') : '*Tip: Change frequency or antenna type to observe live wave dynamics.*'}`;
}
