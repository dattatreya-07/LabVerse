import { LabComponent, WireConnection } from './components';
import { SimulationResult } from './simulation';

export interface SourceReference {
  id: string;
  title: string;
  section: string;
  sourceType: string;
  excerpt: string;
}

export interface RAGChunk {
  id: string;
  experimentId?: string;
  title: string;
  category: 'THEORY' | 'TROUBLESHOOTING' | 'FAULTS' | 'SAFETY' | 'EQUIPMENT';
  source: string;
  keywords: string[];
  content: string;
}

export interface TutorContext {
  experimentId: string;
  experimentTitle: string;
  learningObjectives: string[];
  governingEquations: string[];
  commonMistakes: string[];
}

export interface TutorRequest {
  question: string;
  experimentId: string;
  learningMode?: string;
  components?: LabComponent[];
  connections?: WireConnection[];
  parameters?: Record<string, number>;
  latestResult?: SimulationResult | null;
  activeFaults?: string[];
  completedStepsCount?: number;
}

export interface TutorResponse {
  answer: string;
  concept?: string;
  diagnosis?: string;
  hints?: string[];
  nextAction?: string;
  sources: SourceReference[];
  isCuratedFallback: boolean;
  grounded: boolean;
  timestamp: string;
}
