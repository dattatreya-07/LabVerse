import { RAGChunk } from '@/types';

export const OHMS_LAW_KNOWLEDGE_BASE: RAGChunk[] = [
  {
    id: 'kb-theory-01',
    title: "Ohm's Law Core Principle & Equation",
    category: 'THEORY',
    source: "Physics Lab Manual: Fundamental Electrodynamics Section 2.1",
    keywords: ['ohms law', 'equation', 'v=ir', 'formula', 'voltage', 'current', 'resistance', 'proportionality'],
    content: "Ohm's Law states that the current (I) flowing through a conductor between two points is directly proportional to the voltage (V) across the two points and inversely proportional to the resistance (R). Mathematically expressed as V = I × R, or I = V / R, or R = V / I. In SI units: Voltage in Volts (V), Current in Amperes (A), and Resistance in Ohms (Ω)."
  },
  {
    id: 'kb-theory-02',
    title: 'Linearity and V-I Graph Slope',
    category: 'THEORY',
    source: "Experiment Guide: Ohmic Resistors & Linear Response",
    keywords: ['v-i curve', 'graph', 'slope', 'linear', 'ohmic', 'straight line', 'plot'],
    content: "For an ohmic resistor, plotting Voltage (V) on the x-axis against Current (I) on the y-axis yields a straight line passing through the origin (0,0). The slope of this line represents the conductance (1/R). Alternatively, if V is on the y-axis and I on the x-axis, the slope equals the resistance (R)."
  },
  {
    id: 'kb-fault-01',
    title: 'Open Circuit Fault Diagnosis & Physical Mechanics',
    category: 'TROUBLESHOOTING',
    source: "Lab Diagnostics Handbook: Circuit Continuity & Fault Patterns",
    keywords: ['open circuit', 'fault', 'zero current', 'broken wire', 'infinite resistance', '0a', 'gap', 'switch open', 'diagnose', 'repair'],
    content: "An open circuit occurs when there is a physical discontinuity in the conductive path (e.g. broken wire, burnt element, open switch). Because air has effectively infinite resistance, no electron flow can occur. Symptoms: Ammeter reads exactly 0.00 A regardless of applied voltage. Diagnosis: Measure continuity across terminals. Repair: Replace or re-connect the broken segment."
  },
  {
    id: 'kb-fault-02',
    title: 'Ammeter Calibration & Meter Reading Errors',
    category: 'FAULTS',
    source: "Instrument Standards Bulletin: Ammeter Calibration Drift",
    keywords: ['meter fault', 'calibration', 'ammeter error', 'measured vs theoretical', 'gain multiplier', 'reading wrong', 'miscalibrated'],
    content: "A meter fault occurs when the ammeter's internal shunt resistor or digital gain amplifier drifts from standard calibration. Physical current in the circuit follows I = V / R, but the ammeter display scales the value erroneously (e.g., displaying 2.5× actual value). Diagnosis: Compare ammeter reading with theoretical I = V/R calculation or verify against a secondary calibrated multimeter."
  },
  {
    id: 'kb-safety-01',
    title: 'Power Dissipation and Component Ratings',
    category: 'SAFETY',
    source: "Lab Safety Manual: Joule Heating & Power Ratings",
    keywords: ['power', 'joule heating', 'watts', 'dissipation', 'overheat', 'safety', 'p=vi', 'i^2r'],
    content: "When current flows through a resistor, electrical energy is converted to thermal energy (Joule heating) at rate P = V × I = I² × R = V² / R Watts (W). Always ensure the resistor's power rating is not exceeded to prevent component degradation or thermal damage."
  },
  {
    id: 'kb-equip-01',
    title: 'Virtual Apparatus & Circuit Topology',
    category: 'EQUIPMENT',
    source: "LabVerse Apparatus Guide: Series Circuit Assembly",
    keywords: ['battery', 'ammeter', 'resistor', 'wires', 'series', 'circuit setup', 'apparatus'],
    content: "The Ohm's Law laboratory setup places a variable DC voltage source, a precision resistor, and a digital ammeter in series. An ideal ammeter has negligible internal resistance (0 Ω) so that it measures circuit current without dropping significant voltage."
  }
];

export function retrieveRelevantChunks(query: string, limit = 3): RAGChunk[] {
  const normalized = query.toLowerCase();
  const queryTokens = normalized.split(/\W+/).filter(t => t.length > 2);

  const scored = OHMS_LAW_KNOWLEDGE_BASE.map(chunk => {
    let score = 0;
    // Check keyword matches
    chunk.keywords.forEach(kw => {
      if (normalized.includes(kw)) score += 5;
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

  // Return top matches or default theory chunks if score is low
  const results = scored.filter(s => s.score > 0).map(s => s.chunk);
  if (results.length === 0) {
    return OHMS_LAW_KNOWLEDGE_BASE.slice(0, limit);
  }
  return results.slice(0, limit);
}
