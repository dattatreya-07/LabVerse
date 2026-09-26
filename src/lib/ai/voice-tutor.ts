/**
 * Voice-Guided AI Tutor & Mystery Fault Diagnosis Engine for LabVerse
 * Implements customizable personality modes ("Strict Professor" vs "Encouraging Guide"),
 * Web Speech API voice synthesis, and Socratic diagnostic examiner logic.
 */

import { SimulationResult, ExperimentDefinition, LabComponent, WireConnection } from '@/types';

export type TutorPersonality = 'STRICT_PROFESSOR' | 'ENCOURAGING_GUIDE';
export type TutorMode = 'STANDARD_TUTOR' | 'FAILURE_EXPLANATION' | 'MYSTERY_DIAGNOSIS';

export interface VoiceTutorConfig {
  personality: TutorPersonality;
  mode: TutorMode;
  voiceSpeechEnabled: boolean;
  activeMysteryFaultId: string | null;
  mysteryFaultRevealed: boolean;
}

export interface DiagnosticProbeResponse {
  symptom: string;
  physicalProperty: string;
  hintPrompt: string;
  isSolved: boolean;
}

/**
 * System prompts calibrated for LLM generation
 */
export function buildVoiceTutorSystemPrompt(
  config: VoiceTutorConfig,
  experiment: ExperimentDefinition
): string {
  const personalityStyle =
    config.personality === 'STRICT_PROFESSOR'
      ? 'You are a Strict University Physics & Engineering Professor. You demand scientific rigor, precise mathematical derivations, and correct SI units. You do not tolerate hand-wavy explanations.'
      : 'You are an Encouraging Lab Guide & Mentor. You provide warm, intuitive scaffolding, praise curiosity, and use relatable everyday analogies to explain complex scientific phenomena.';

  return `
${personalityStyle}

EXPERIMENT CONTEXT:
Title: ${experiment.title}
Domain: ${experiment.domain}
Core Principle: ${experiment.theory?.corePrinciple || ''}
Governing Equations: ${(experiment.theory?.equations || []).join(', ')}

OPERATIONAL MODES:
1. INTERACTIVE FAILURE & FAULT EXPLANATIONS:
When the student causes a circuit short, open circuit, polarity reversal, or parameter violation:
- Immediately explain the scientific root cause of the physical failure.
- Speak clearly and guide them towards the corrective procedure without handing them the trivial answer.

2. MYSTERY FAULT DIAGNOSIS MODE:
When testing the student in Mystery Diagnosis:
- You know the broken component or hidden parameter deviation.
- When the student asks diagnostic questions (e.g., "What is the voltage across node A?", "What color is the chemical?", "Is current flowing?"), answer strictly with measurable physical properties.
- NEVER reveal the identity of the broken component until the student submits their formal deduction.
`.trim();
}

/**
 * Speaks text aloud using the browser Web Speech API
 */
export function speakTutorAudio(text: string, personality: TutorPersonality = 'ENCOURAGING_GUIDE'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = personality === 'STRICT_PROFESSOR' ? 0.95 : 1.05;
  utterance.pitch = personality === 'STRICT_PROFESSOR' ? 0.9 : 1.1;

  // Select suitable voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Evaluates simulation state payload to detect failures and generates voice explanations
 */
export function analyzeSimulationFailure(
  result: SimulationResult | null,
  experiment: ExperimentDefinition,
  personality: TutorPersonality = 'ENCOURAGING_GUIDE'
): { shouldTriggerSpeech: boolean; message: string } | null {
  if (!result) return null;

  // 1. Short Circuit / Excessive current check
  if (result.errors?.some(e => e.code === 'ERR_SHORT_CIRCUIT' || e.code === 'ERR_ZERO_RESISTANCE')) {
    const msg = personality === 'STRICT_PROFESSOR'
      ? 'Critical Fault: Direct short circuit detected. With impedance approaching zero, current diverges asymptotically toward infinity according to I = V/R, tripping circuit protection. Insert a series load immediately.'
      : 'Careful there! We have a short circuit in the loop. The electrical current has no resistance to slow it down, which can overheat real components. Try adding a resistor to protect the circuit!';
    return { shouldTriggerSpeech: true, message: msg };
  }

  // 2. Discontinuity / Open Loop check
  if (!result.topology.isValid || result.errors?.some(e => e.code === 'ERR_OPEN_CIRCUIT')) {
    const msg = personality === 'STRICT_PROFESSOR'
      ? 'Topological Error: Discontinuous circuit graph. Kirchhoff Current Law requires a closed conservation loop for charge migration. Complete the conductor path.'
      : 'Looks like we have an open circuit! The electrons need a complete continuous path to flow from the power supply back to ground. Check your wire connections!';
    return { shouldTriggerSpeech: true, message: msg };
  }

  // 3. Reverse Polarity in Biology/Electrophoresis
  if (result.warnings?.some(w => w.code === 'WARN_REVERSE_POLARITY')) {
    const msg = personality === 'STRICT_PROFESSOR'
      ? 'Polarity Reversal Detected: DNA possesses a negative phosphate backbone and migrates strictly toward the positive anode (+). Your swapped electrodes will cause complete sample loss into the buffer.'
      : 'Watch out! The electrodes are backwards. Remember, "Run to Red" because DNA is negatively charged and wants to move toward the positive terminal!';
    return { shouldTriggerSpeech: true, message: msg };
  }

  return null;
}

/**
 * Mystery Fault Diagnosis Examiner Evaluator
 */
export function evaluateMysteryDeduction(
  userDeduction: string,
  mysteryFaultId: string,
  experiment: ExperimentDefinition
): DiagnosticProbeResponse {
  const faultDef = experiment.faults?.find(f => f.id === mysteryFaultId);
  const normalizedDeduction = userDeduction.toLowerCase();

  const isCorrect = faultDef && (
    normalizedDeduction.includes(faultDef.title.toLowerCase()) ||
    (faultDef.applicableComponentTypes && faultDef.applicableComponentTypes.some(t => normalizedDeduction.includes(t.toLowerCase()))) ||
    (faultDef.symptoms && faultDef.symptoms.some(s => normalizedDeduction.includes(s.toLowerCase())))
  );

  if (isCorrect) {
    return {
      symptom: `Diagnosis Verified: Fault isolated successfully (${faultDef.title}).`,
      physicalProperty: 'Confirmed Root Cause',
      hintPrompt: 'Excellent deduction! Your empirical diagnosis accurately matches the measured circuit telemetry.',
      isSolved: true,
    };
  }

  return {
    symptom: 'Telemetry Mismatch: The symptoms you described do not fully account for all observed node voltages and current readings.',
    physicalProperty: 'Deviation Unresolved',
    hintPrompt: faultDef?.diagnosticHints?.[0] || 'Check the voltage drop across each series component individually.',
    isSolved: false,
  };
}
