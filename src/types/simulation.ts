import { LabComponent, WireConnection } from './components';

export interface ParameterValue {
  id: string;
  value: number;
  unit: string;
}

export interface SimulationInput {
  experimentId: string;
  components: LabComponent[];
  connections: WireConnection[];
  parameters: Record<string, number>;
  activeFaults: string[];
}

export interface Measurement {
  id: string;
  label: string;
  symbol: string;
  theoreticalValue: number;
  simulatedValue: number;
  observedValue: number;
  unit: string;
  precision?: number;
}

export interface SimulationWarning {
  code: string;
  message: string;
  componentId?: string;
}

export interface SimulationError {
  code: string;
  message: string;
  hint?: string;
  componentId?: string;
}

export interface VisualSimulationState {
  isOperating: boolean;
  electronVelocity?: number;
  activePathIds?: string[];
  meterReadings?: Record<string, number | string>;
  componentStates?: Record<string, any>;
  waveforms?: Array<{ x: number; y: number }>;
}

export interface TopologyVerificationResult {
  isValid: boolean;
  canSimulate: boolean;
  message: string;
  details?: string;
  errors: SimulationError[];
  warnings: SimulationWarning[];
  circuitTopology?: 'SERIES' | 'PARALLEL' | 'OPEN' | 'SHORT' | 'INVALID';
}

export interface SimulationResult {
  success: boolean;
  experimentId: string;
  measurements: Measurement[];
  derivedValues: Record<string, number>;
  visualState: VisualSimulationState;
  topology: TopologyVerificationResult;
  warnings: SimulationWarning[];
  errors: SimulationError[];
  timestamp: string;
}
