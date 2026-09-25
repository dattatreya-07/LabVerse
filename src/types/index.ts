export type FaultType = 'NORMAL' | 'OPEN_CIRCUIT' | 'METER_FAULT';

export interface CircuitInput {
  voltage: number;      // In Volts (V), valid range 0.0 - 30.0 V
  resistance: number;   // In Ohms (Ω), valid range 1.0 - 1000.0 Ω
  faultType: FaultType;
}

export interface SimulationResult {
  voltage: number;            // V
  resistance: number;         // Ω
  theoreticalCurrent: number; // Amperes (A)
  measuredCurrent: number;    // Amperes (A) - displayed on meter
  circuitCurrent: number;     // Amperes (A) - actual physical current in wires
  isCircuitClosed: boolean;
  faultType: FaultType;
  faultExplanation?: string;
  timestamp: number;
}

export interface ObservationRecord {
  id: string;
  timestamp: string;
  voltage: number;            // V
  resistance: number;         // Ω
  theoreticalCurrent: number; // A
  measuredCurrent: number;    // A
  faultType: FaultType;
  notes?: string;
}

export interface FaultLogEntry {
  id: string;
  timestamp: string;
  faultType: FaultType;
  action: 'INJECTED' | 'REPAIRED' | 'DIAGNOSED';
  details: string;
}

export interface SessionState {
  sessionId: string;
  studentName: string;
  startTime: string;
  currentInput: CircuitInput;
  lastResult: SimulationResult | null;
  observations: ObservationRecord[];
  faultLog: FaultLogEntry[];
  completedSteps: number[]; // Procedure step IDs
  notes: string;
}

export interface RAGChunk {
  id: string;
  title: string;
  content: string;
  category: 'THEORY' | 'TROUBLESHOOTING' | 'FAULTS' | 'SAFETY' | 'EQUIPMENT';
  source: string;
  keywords: string[];
}

export interface TutorRequest {
  question: string;
  experimentId: string;
  currentStep?: number;
  circuitInput?: CircuitInput;
  lastResult?: SimulationResult | null;
  recentObservationsCount?: number;
}

export interface TutorSource {
  title: string;
  source: string;
  excerpt: string;
}

export interface TutorResponse {
  answer: string;
  sources: TutorSource[];
  isCuratedFallback: boolean;
  grounded: boolean;
  timestamp: string;
}
