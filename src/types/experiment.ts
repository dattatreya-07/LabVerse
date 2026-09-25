import { DomainCategory, ComponentType, LabComponent, WireConnection } from './components';
import { SimulationInput, SimulationResult, TopologyVerificationResult } from './simulation';
import { TutorContext } from './tutor';

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type AvailabilityStatus = 'AVAILABLE' | 'DEMO' | 'COMING_SOON';
export type LearningMode = 'GUIDED' | 'PRACTICE' | 'CHALLENGE' | 'EXPLORATION';

export interface LearningObjective {
  id: string;
  description: string;
  bloomLevel?: 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE';
}

export interface EquipmentDefinition {
  type: ComponentType;
  title: string;
  description: string;
  domain: DomainCategory;
  defaultProperties: Record<string, unknown>;
  terminals: Array<{
    id: string;
    name: string;
    type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'INPUT' | 'OUTPUT' | 'OPTICAL_PORT' | 'SAMPLE_PORT';
    position: { x: number; y: number };
    label?: string;
  }>;
  iconName?: string;
  minInstances?: number;
  maxInstances?: number;
}

export interface ParameterDefinition {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description?: string;
  targetComponentType?: ComponentType;
  propertyKey?: string;
}

export interface WorkspacePreset {
  components: LabComponent[];
  connections: WireConnection[];
}

export interface WorkspaceDefinition {
  gridSize?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  allowedEquipment: ComponentType[];
  defaultPreset?: WorkspacePreset;
  guidedSteps?: Array<{
    stepNumber: number;
    title: string;
    instruction: string;
    expectedValidation?: string;
    targetComponentType?: ComponentType;
  }>;
}

export interface ChallengeGoal {
  id: string;
  title: string;
  description: string;
  targetMetric: string;
  targetValue: number;
  tolerance: number; // e.g. 0.05 for 5%
  unit: string;
  hint: string;
}

export interface FaultDefinition {
  id: string;
  title: string;
  description: string;
  applicableComponentTypes: ComponentType[];
  symptoms: string[];
  diagnosticHints: string[];
  effect: 'OPEN_CIRCUIT' | 'CALIBRATION_DRIFT' | 'SHORT_CIRCUIT' | 'PARAM_DEVIATION';
  parameterModifier?: {
    multiplier?: number;
    offset?: number;
  };
}

export interface AnalysisDefinition {
  xAxisLabel: string;
  xAxisKey: string;
  xAxisUnit: string;
  yAxisLabel: string;
  yAxisKey: string;
  yAxisUnit: string;
  expectedSlopeFormula: string;
  theoreticalRelationshipDescription: string;
}

export interface SafetyDefinition {
  rules: string[];
  maxSafeVoltage?: number;
  maxSafeCurrent?: number;
  maxPowerRating?: number;
}

export interface ReportDefinition {
  title: string;
  governingFormulaLatex: string;
  procedureSummary: string[];
  expectedConclusionTemplate: string;
}

export interface ExperimentDefinition {
  id: string;
  title: string;
  tagline: string;
  domain: DomainCategory;
  difficulty: Difficulty;
  availability: AvailabilityStatus;
  estimatedMinutes: number;
  coverIcon: string;
  summary: string;
  theory: {
    corePrinciple: string;
    equations: string[];
    derivation: string;
    variableDescriptions: Record<string, string>;
  };
  learningObjectives: LearningObjective[];
  equipment: EquipmentDefinition[];
  parameters: ParameterDefinition[];
  workspace: WorkspaceDefinition;
  challenges?: ChallengeGoal[];
  faults?: FaultDefinition[];
  analysis?: AnalysisDefinition;
  safety?: SafetyDefinition;
  tutorContext: TutorContext;
  report: ReportDefinition;
  
  // Custom simulation handler hook
  validateTopology: (components: LabComponent[], connections: WireConnection[]) => TopologyVerificationResult;
  simulate: (input: SimulationInput) => SimulationResult;
}
