import { RAGChunk } from '@/types';

export const COMPREHENSIVE_KNOWLEDGE_BASE: RAGChunk[] = [
  // OHM'S LAW
  {
    id: 'kb-ohms-01',
    experimentId: 'ohms-law',
    title: "Ohm's Law Core Principle & Proportionality",
    category: 'THEORY',
    source: "Physics Lab Manual: Fundamental Electrodynamics Section 2.1",
    keywords: ['ohms law', 'equation', 'v=ir', 'formula', 'voltage', 'current', 'resistance', 'proportionality'],
    content: "Ohm's Law states that current (I) is directly proportional to applied voltage (V) and inversely proportional to resistance (R), expressed as V = I × R or I = V / R. In SI units: Voltage in Volts (V), Current in Amperes (A), and Resistance in Ohms (Ω)."
  },
  {
    id: 'kb-ohms-02',
    experimentId: 'ohms-law',
    title: 'Open Circuit Discontinuity Diagnosis',
    category: 'TROUBLESHOOTING',
    source: "Lab Diagnostics Handbook: Circuit Continuity & Fault Patterns",
    keywords: ['open circuit', 'zero current', 'broken wire', '0a', 'discontinuity', 'gap', 'switch open'],
    content: "An open circuit occurs when there is a physical discontinuity in the conductive path (broken lead, open switch, disconnected terminal). Air has effectively infinite resistance, so current drops to exactly 0.00 A regardless of applied voltage."
  },
  {
    id: 'kb-ohms-03',
    experimentId: 'ohms-law',
    title: 'Ammeter Calibration Systematic Error',
    category: 'FAULTS',
    source: "Instrument Standards Bulletin: Calibration Drift",
    keywords: ['meter fault', 'calibration', 'ammeter error', 'measured vs theoretical', 'gain multiplier'],
    content: "A meter fault occurs when the ammeter's internal gain amplifier or shunt drifts. Circuit physics remains normal (I_circuit = V/R), but the display scales erroneously (e.g. 2.5× actual current)."
  },

  // PENDULUM
  {
    id: 'kb-pend-01',
    experimentId: 'gravity-pendulum',
    title: 'Simple Pendulum Harmonic Period Model',
    category: 'THEORY',
    source: "Mechanics Manual: Simple Harmonic Oscillations",
    keywords: ['pendulum', 'period', 'gravity', 'length', 'harmonic', 't=2pi*sqrt(l/g)'],
    content: "For small oscillations (theta < 15 deg), a simple pendulum's period is T = 2*pi*sqrt(L/g). Period is independent of bob mass and amplitude. Plotting T^2 vs L yields slope = 4*pi^2 / g."
  },
  {
    id: 'kb-pend-02',
    experimentId: 'gravity-pendulum',
    title: 'Planetary Gravitational Field Comparison',
    category: 'THEORY',
    source: "Astrophysics Guide: Planetary Surface Gravity",
    keywords: ['moon gravity', 'jupiter gravity', 'mars gravity', '1.62', '24.79'],
    content: "Gravitational acceleration g varies across celestial bodies: Earth (9.81 m/s²), Moon (1.62 m/s²), Mars (3.71 m/s²), Jupiter (24.79 m/s²). Lower gravity (Moon) causes slower oscillations (longer period)."
  },

  // PHOTOELECTRIC EFFECT
  {
    id: 'kb-photo-01',
    experimentId: 'photoelectric-effect',
    title: 'Einstein Photoelectric Equation & Stopping Potential',
    category: 'THEORY',
    source: "Quantum Physics Text: Photoelectric Quanta Section 4.2",
    keywords: ['photoelectric', 'planck', 'stopping potential', 'work function', 'photon energy', 'e=h*nu'],
    content: "Einstein photoelectric law states K_max = h*nu - Phi. Photon energy E = h*nu = hc/lambda must exceed metal work function Phi for emission. Stopping potential V0 halts photoelectrons: e*V0 = K_max."
  }
];

export function retrieveRelevantChunks(query: string, experimentId?: string, limit = 3): RAGChunk[] {
  const normalized = query.toLowerCase();
  const queryTokens = normalized.split(/\W+/).filter(t => t.length > 2);

  const scored = COMPREHENSIVE_KNOWLEDGE_BASE.map(chunk => {
    let score = 0;

    // Prioritize chunks belonging to active experiment
    if (experimentId && chunk.experimentId === experimentId) {
      score += 10;
    }

    // Check keyword matches
    chunk.keywords.forEach(kw => {
      if (normalized.includes(kw)) score += 6;
    });

    // Check title matches
    if (chunk.title.toLowerCase().includes(normalized)) score += 10;

    // Token matching in content
    queryTokens.forEach(token => {
      if (chunk.content.toLowerCase().includes(token)) score += 1;
    });

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const results = scored.filter(s => s.score > 0).map(s => s.chunk);
  if (results.length === 0) {
    if (experimentId) {
      return COMPREHENSIVE_KNOWLEDGE_BASE.filter(c => c.experimentId === experimentId).slice(0, limit);
    }
    return COMPREHENSIVE_KNOWLEDGE_BASE.slice(0, limit);
  }
  return results.slice(0, limit);
}
