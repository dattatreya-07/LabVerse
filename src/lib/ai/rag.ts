import { RAGChunk, SourceReference } from '@/types';

export const REVIEWED_KNOWLEDGE_CORPUS: RAGChunk[] = [
  // OHM'S LAW
  {
    id: 'kb-ohms-01',
    experimentId: 'ohms-law',
    title: "Ohm's Law Core Principle & Governing Equations",
    category: 'THEORY',
    source: "Physics Lab Manual: Fundamental Electrodynamics Section 2.1",
    keywords: ['ohms law', 'equation', 'v=ir', 'formula', 'voltage', 'current', 'resistance', 'proportionality'],
    content: "Ohm's Law states that the current (I) through an ohmic conductor is directly proportional to the applied voltage (V) and inversely proportional to resistance (R): V = I × R. In SI units: Voltage in Volts (V), Current in Amperes (A), and Resistance in Ohms (Ω). Power dissipation is P = V × I = I² × R."
  },
  {
    id: 'kb-ohms-02',
    experimentId: 'ohms-law',
    title: 'Open Circuit Discontinuity Diagnosis',
    category: 'TROUBLESHOOTING',
    source: "Lab Diagnostics Handbook: Circuit Continuity & Fault Patterns",
    keywords: ['open circuit', 'zero current', 'broken wire', '0a', 'discontinuity', 'gap', 'switch open'],
    content: "An open circuit occurs when there is a physical discontinuity in the conductive path (broken lead, open switch, disconnected terminal). Air has effectively infinite resistance (R → ∞), so current drops to exactly 0.00 A regardless of applied voltage."
  },
  {
    id: 'kb-ohms-03',
    experimentId: 'ohms-law',
    title: 'Ammeter Calibration Systematic Gain Error',
    category: 'FAULTS',
    source: "Instrument Standards Bulletin: Calibration Drift & Gain Multipliers",
    keywords: ['meter fault', 'calibration', 'ammeter error', 'measured vs theoretical', 'gain multiplier'],
    content: "A meter fault occurs when the ammeter's internal gain amplifier or shunt drifts. Physical circuit current remains normal (I_circuit = V / R), but the digital display scales erroneously by a gain multiplier (e.g. 2.5× actual current)."
  },
  {
    id: 'kb-ohms-04',
    experimentId: 'ohms-law',
    title: 'High Contact Resistance & Oxide Layer Faults',
    category: 'FAULTS',
    source: "Electrical Contact Reliability Guide: Terminal Contact Resistance",
    keywords: ['contact resistance', 'loose connection', 'high resistance', 'oxide layer', 'terminal voltage drop'],
    content: "Oxidized or loose terminal clips introduce unintended series resistance (e.g. +100 Ω) to the circuit loop. This reduces total current below expected theoretical calculations for the nominal resistor value."
  },

  // PENDULUM
  {
    id: 'kb-pend-01',
    experimentId: 'pendulum',
    title: 'Simple Pendulum Harmonic Period Model',
    category: 'THEORY',
    source: "Classical Mechanics Manual: Simple Harmonic Oscillations",
    keywords: ['pendulum', 'period', 'gravity', 'length', 'harmonic', 't=2pi*sqrt(l/g)'],
    content: "For small oscillation amplitudes (θ < 15°), a simple pendulum's period is T = 2π√(L/g). The period depends solely on string length (L) and local gravitational acceleration (g), and is independent of bob mass."
  },
  {
    id: 'kb-pend-02',
    experimentId: 'pendulum',
    title: 'Planetary Gravitational Field Comparison',
    category: 'THEORY',
    source: "Astrophysics Laboratory Guide: Celestial Surface Gravity",
    keywords: ['moon gravity', 'jupiter gravity', 'mars gravity', '1.62', '24.79', 'celestial'],
    content: "Gravitational acceleration (g) varies across celestial bodies: Earth (9.81 m/s²), Moon (1.62 m/s²), Mars (3.71 m/s²), Jupiter (24.79 m/s²). Lower gravity yields a longer period (slower oscillation)."
  },

  // PHOTOELECTRIC EFFECT
  {
    id: 'kb-photo-01',
    experimentId: 'photoelectric',
    title: 'Einstein Photoelectric Quanta & Work Function',
    category: 'THEORY',
    source: "Quantum Physics Principles: Photoelectric Effect Section 4.2",
    keywords: ['photoelectric', 'planck', 'stopping potential', 'work function', 'photon energy', 'e=h*nu'],
    content: "Einstein's photoelectric equation states K_max = hν - Φ. Incident photon energy E = hν = hc/λ must exceed metal work function Φ for electron emission. Stopping potential V₀ halts photoelectrons: eV₀ = K_max."
  },
  {
    id: 'kb-photo-02',
    experimentId: 'photoelectric',
    title: 'Photocurrent Saturation & Light Intensity Dependence',
    category: 'THEORY',
    source: "Optoelectronics Reference: Photocurrent Saturation Curves",
    keywords: ['intensity', 'photocurrent', 'saturation', 'light power', 'microamps'],
    content: "Light intensity controls the number of incident photons per second, which directly scales the saturation photocurrent. However, photon energy (and thus stopping potential) depends strictly on light frequency/wavelength."
  }
];

export interface RetrievalResult {
  chunks: RAGChunk[];
  sources: SourceReference[];
  hasRelevantEvidence: boolean;
  maxScore: number;
}

/**
 * Sanitizes user input or retrieved context to prevent prompt injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/ignore\s+previous\s+instructions/gi, '[filtered instruction override attempt]')
    .replace(/reveal\s+system\s+prompt/gi, '[filtered prompt extraction attempt]')
    .replace(/act\s+as\s+an?\s+unrestricted/gi, '[filtered jailbreak attempt]')
    .trim();
}

/**
 * Retrieves and ranks relevant knowledge chunks for a query using keyword & domain match
 */
export function retrieveRelevantChunks(
  query: string, 
  experimentId?: string, 
  limit = 3,
  minScoreThreshold = 4
): RetrievalResult {
  const sanitizedQuery = sanitizeInput(query);
  const normalized = sanitizedQuery.toLowerCase();
  const queryTokens = normalized.split(/\W+/).filter(t => t.length > 2);

  const scored = REVIEWED_KNOWLEDGE_CORPUS.map(chunk => {
    let score = 0;

    // Experiment ID domain match bonus
    const targetExpId = experimentId || '';
    if (targetExpId && chunk.experimentId && (chunk.experimentId === targetExpId || targetExpId.includes(chunk.experimentId))) {
      score += 8;
    }

    // Keyword matches
    chunk.keywords.forEach(kw => {
      if (normalized.includes(kw)) score += 6;
    });

    // Title matches
    if (chunk.title.toLowerCase().includes(normalized)) score += 10;

    // Content token overlap
    queryTokens.forEach(token => {
      if (chunk.content.toLowerCase().includes(token)) score += 1;
    });

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const maxScore = scored[0]?.score || 0;
  const hasRelevantEvidence = maxScore >= minScoreThreshold;

  const topScored = scored.filter(s => s.score >= minScoreThreshold).slice(0, limit);
  const chunks = topScored.length > 0 
    ? topScored.map(s => s.chunk) 
    : REVIEWED_KNOWLEDGE_CORPUS.filter(c => c.experimentId === (experimentId || 'ohms-law')).slice(0, limit);

  const sources: SourceReference[] = chunks.map(c => ({
    id: c.id,
    title: c.title,
    section: c.category,
    sourceType: 'Reviewed Science Corpus',
    excerpt: c.content.slice(0, 150) + '...',
  }));

  return {
    chunks,
    sources,
    hasRelevantEvidence,
    maxScore,
  };
}
