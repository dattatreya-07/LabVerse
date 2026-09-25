import { NextRequest, NextResponse } from 'next/server';
import { TutorRequest, TutorResponse, SourceReference } from '@/types';
import { retrieveRelevantChunks } from '@/lib/ai/rag';
import { getExperiment } from '@/lib/experiments/registry';

export async function POST(req: NextRequest) {
  try {
    const body: TutorRequest = await req.json();
    const { question, experimentId, components, connections, parameters, latestResult, activeFaults } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'A valid question string is required.' },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();
    const expDef = getExperiment(experimentId || 'ohms-law');
    const chunks = retrieveRelevantChunks(trimmedQuestion, expDef.id, 3);
    
    const sources: SourceReference[] = chunks.map(c => ({
      id: c.id,
      title: c.title,
      section: c.category,
      sourceType: 'Reviewed Lab Manual',
      excerpt: c.content.slice(0, 160) + '...',
    }));

    // Build context string from active laboratory workspace state
    const compSummary = components ? components.map(c => `${c.title} (pos: ${c.position.x},${c.position.y})`).join(', ') : 'Default Setup';
    const connCount = connections ? connections.length : 0;
    const measSummary = latestResult?.measurements
      ? latestResult.measurements.map(m => `${m.label}: Theo=${m.theoreticalValue} ${m.unit}, Obs=${m.observedValue} ${m.unit}`).join('; ')
      : 'No measurements yet';

    const stateContext = `[Experiment: ${expDef.title}]
[Domain: ${expDef.domain}]
[Workspace Components: ${compSummary}]
[Connections count: ${connCount}]
[Parameters: ${JSON.stringify(parameters || {})}]
[Active Faults: ${activeFaults?.join(', ') || 'None'}]
[Latest Simulation Measurements: ${measSummary}]
[Circuit Topology: ${latestResult?.topology?.circuitTopology || 'N/A'}]
[Topology Message: ${latestResult?.topology?.message || 'N/A'}]`;

    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey) {
      try {
        const ragContextText = chunks.map((c, idx) => `[Source ${idx + 1}: ${c.title}]\n${c.content}`).join('\n\n');
        
        const systemPrompt = `You are LabVerse AI Diagnostic Tutor, an expert laboratory assistant for ${expDef.title}.
Analyze the student's question against the live virtual laboratory state and verified knowledge base below.
Encourage scientific reasoning, explain discrepancies between theoretical and observed measurements, diagnose faults, and offer actionable laboratory hints.
Never invent or fabricate measurements; always refer to the actual simulated values.

Live Laboratory State:
${stateContext}

Retrieved Grounded Knowledge:
${ragContextText}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: trimmedQuestion }
            ],
            temperature: 0.3,
            max_tokens: 600,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiAnswer = data.choices?.[0]?.message?.content;
          if (aiAnswer) {
            const tutorResp: TutorResponse = {
              answer: aiAnswer,
              sources,
              isCuratedFallback: false,
              grounded: true,
              timestamp: new Date().toLocaleTimeString(),
            };
            return NextResponse.json(tutorResp);
          }
        }
      } catch (groqErr) {
        console.warn('Groq API call failed or timed out, falling back to curated RAG base:', groqErr);
      }
    }

    // Fallback: Generate curated response from RAG index & current lab state
    const fallbackAnswer = generateCuratedResponse(trimmedQuestion, expDef, latestResult, activeFaults);

    const tutorResp: TutorResponse = {
      answer: fallbackAnswer,
      sources,
      isCuratedFallback: true,
      grounded: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    return NextResponse.json(tutorResp);

  } catch (error) {
    console.error('Tutor API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing tutor request.' },
      { status: 500 }
    );
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
  if (activeFaults?.includes('FAULT_OPEN_CIRCUIT') || latestResult?.topology?.circuitTopology === 'OPEN') {
    return `### 🔍 Open Circuit Discontinuity Diagnosis
Currently, the circuit has an **Open Circuit Discontinuity**.

- **Theoretical Current:** ${latestResult?.measurements.find(m => m.id === 'current_meas')?.theoreticalValue ?? '0.30'} A
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
