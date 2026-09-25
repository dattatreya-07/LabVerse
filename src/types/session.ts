import { LabComponent, WireConnection } from './components';
import { SimulationResult } from './simulation';
import { LearningMode } from './experiment';

export interface ObservationRecord {
  id: string;
  timestamp: string;
  runIndex: number;
  parameters: Record<string, number>;
  measurements: Record<string, number>;
  theoreticalValues: Record<string, number>;
  faultsActive: string[];
  notes?: string;
  circuitTopology?: string;
}

export interface FaultLogEntry {
  id: string;
  timestamp: string;
  faultId: string;
  faultTitle: string;
  action: 'INJECTED' | 'REPAIRED' | 'DIAGNOSED';
  details: string;
}

export interface ExperimentSession {
  sessionId: string;
  studentName: string;
  experimentId: string;
  startTime: string;
  lastUpdated: string;
  mode: LearningMode;
  components: LabComponent[];
  connections: WireConnection[];
  parameters: Record<string, number>;
  activeFaults: string[];
  lastResult: SimulationResult | null;
  observations: ObservationRecord[];
  faultLog: FaultLogEntry[];
  completedSteps: number[];
  activeChallengeId?: string;
  isChallengeCompleted?: boolean;
}
