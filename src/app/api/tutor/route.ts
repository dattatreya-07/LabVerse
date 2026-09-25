import { NextRequest, NextResponse } from 'next/server';
import { TutorRequest, TutorResponse, TutorSource } from '@/types';
import { retrieveRelevantChunks } from '@/lib/ai/rag';

export async function POST(req: NextRequest) {
  try {
    const body: TutorRequest = await req.json();
    const { question, circuitInput, lastResult } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'A valid question string is required.' },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();
    const chunks = retrieveRelevantChunks(trimmedQuestion, 3);
    const sources: TutorSource[] = chunks.map(c => ({
      title: c.title,
      source: c.source,
      excerpt: c.content.slice(0, 160) + '...',
    }));

    const groqApiKey = process.env.GROQ_API_KEY;

    // Build context string from current circuit state
    const stateContext = lastResult
      ? `[Current Circuit State: Voltage=${lastResult.voltage}V, Resistance=${lastResult.resistance}Ω, Theoretical Current=${lastResult.theoreticalCurrent}A, Measured Current=${lastResult.measuredCurrent}A, Active Fault=${lastResult.faultType}${lastResult.faultExplanation ? ` (${lastResult.faultExplanation})` : ''}]`
      : circuitInput
      ? `[Input Parameters: Voltage=${circuitInput.voltage}V, Resistance=${circuitInput.resistance}Ω, Fault=${circuitInput.faultType}]`
      : '[No active experiment data run yet]';

    if (groqApiKey) {
      try {
        const ragContextText = chunks.map((c, idx) => `[Source ${idx + 1}: ${c.title}]\n${c.content}`).join('\n\n');
        
        const systemPrompt = `You are LabVerse AI Tutor, an expert physics & electrical engineering laboratory assistant.
You answer student questions about Ohm's Law (V = IR), circuit behavior, and fault troubleshooting.
Base your response on the provided live circuit state and retrieved lab knowledge sources below.
Be concise, clear, encouraging, and mathematically accurate.

Live Circuit State:
${stateContext}

Retrieved Knowledge Base Context:
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
    const fallbackAnswer = generateCuratedResponse(trimmedQuestion, stateContext, chunks, lastResult);

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
  stateCtx: string,
  chunks: Array<{ title: string; content: string }>,
  lastResult?: import('@/types').SimulationResult | null
): string {
  const lower = q.toLowerCase();

  if (lastResult?.faultType === 'OPEN_CIRCUIT' && (lower.includes('zero') || lower.includes('0a') || lower.includes('why') || lower.includes('fault') || lower.includes('current'))) {
    return `### 🔍 Open Circuit Fault Analysis
Currently, your circuit has an **Open Circuit Fault** active.

- **Applied Voltage:** ${lastResult.voltage} V
- **Set Resistance:** ${lastResult.resistance} Ω
- **Theoretical Current ($I = V/R$):** ${lastResult.theoreticalCurrent} A
- **Actual Measured Current:** **0.00 A**

**Why is the current zero?**
An open circuit means the conductive copper pathway is physically broken or disconnected (like a switch left open). Air has an extremely high electrical resistance ($R \\approx \\infty$), preventing electron movement across the gap.

**How to repair:** Switch the fault mode back to **Normal Circuit** or reconnect the wire junction in the controls panel.`;
  }

  if (lastResult?.faultType === 'METER_FAULT' && (lower.includes('wrong') || lower.includes('meter') || lower.includes('incorrect') || lower.includes('fault') || lower.includes('calibration') || lower.includes('different'))) {
    return `### ⚠️ Ammeter Calibration Fault Analysis
Your ammeter is currently reporting an erroneous value due to an **Ammeter Calibration Fault**.

- **Applied Voltage:** ${lastResult.voltage} V
- **Set Resistance:** ${lastResult.resistance} Ω
- **Theoretical Physical Current ($I = V/R$):** ${lastResult.theoreticalCurrent} A
- **Meter Display Reading:** **${lastResult.measuredCurrent} A**

**Diagnosis:**
The physical current flowing through the resistor is actually **${lastResult.theoreticalCurrent} A**. However, the instrument's internal gain amplifier is miscalibrated by **2.5×** (+150% gain offset). This represents an **instrumental systematic error**.

**Key Takeaway:** Always verify meter readings against theoretical expectations ($I = V/R$) when troubleshooting hardware!`;
  }

  if (lower.includes('v=ir') || lower.includes('formula') || lower.includes('equation') || lower.includes('calculate') || lower.includes('theory')) {
    const v = lastResult ? lastResult.voltage : 6;
    const r = lastResult ? lastResult.resistance : 20;
    const i = (v / r).toFixed(3);
    return `### 📘 Ohm's Law Mathematical Formula
Ohm's Law expresses the fundamental relationship between Voltage ($V$), Current ($I$), and Resistance ($R$):

$$\\text{Current } (I) = \\frac{\\text{Voltage } (V)}{\\text{Resistance } (R)}$$

**With your active laboratory inputs:**
- $V = ${v}\\text{ V}$
- $R = ${r}\\ \\Omega$
- $I = \\frac{${v}\\text{ V}}{${r}\\ \\Omega} = ${i}\\text{ A}$ (${(parseFloat(i) * 1000).toFixed(1)}\\text{ mA})$

Increase voltage or decrease resistance to see the current rise proportionally!`;
  }

  // General answer based on top retrieved knowledge chunk
  const topChunk = chunks[0];
  return `### 💡 ${topChunk ? topChunk.title : "Ohm's Law Virtual Lab Guidance"}

${topChunk ? topChunk.content : "In an electrical circuit obeying Ohm's Law, current increases linearly with applied voltage ($I \\propto V$) and decreases inversely with resistance ($I \\propto 1/R$)."}

${stateCtx}

*Note: Server is currently operating in offline curated knowledge mode. For full custom LLM reasoning, configure \`GROQ_API_KEY\` in environment settings.*`;
}
