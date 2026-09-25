import { LabComponent, WireConnection } from './components';

export interface CircuitDocumentMetadata {
  experimentId?: string;
  author?: string;
  notes?: string;
  tags?: string[];
}

export interface CircuitDocument {
  version: string; // e.g. '1.0.0'
  id: string;
  title: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  nodes: LabComponent[];
  wires: WireConnection[];
  parameters: Record<string, number>;
  activeFaults: string[];
  metadata?: CircuitDocumentMetadata;
}

export interface HistoryState {
  nodes: LabComponent[];
  wires: WireConnection[];
}
