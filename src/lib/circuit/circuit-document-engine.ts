import { CircuitDocument, LabComponent, WireConnection, SimulationError, SimulationWarning, TopologyVerificationResult } from '@/types';
import { ohmsLawExperiment } from '@/lib/experiments/definitions/ohms-law';

export const CURRENT_CIRCUIT_DOC_VERSION = '1.0.0';
export const CIRCUIT_DOC_STORAGE_KEY_PREFIX = 'labverse_circuit_doc_';

/**
 * Creates a new blank CircuitDocument
 */
export function createCircuitDocument(
  title: string = 'Untitled Circuit',
  domain: string = 'ELECTRONICS',
  experimentId?: string
): CircuitDocument {
  const now = new Date().toISOString();
  return {
    version: CURRENT_CIRCUIT_DOC_VERSION,
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    domain,
    createdAt: now,
    updatedAt: now,
    nodes: [],
    wires: [],
    parameters: {
      voltage: 6.0,
      resistance: 20.0,
    },
    activeFaults: [],
    metadata: {
      experimentId: experimentId || 'ohms-law',
      author: 'LabVerse Student',
    },
  };
}

/**
 * Preloads the standard Ohm's Law series circuit preset document
 */
export function createOhmsLawPresetDocument(): CircuitDocument {
  const defaultPreset = ohmsLawExperiment.workspace.defaultPreset;
  const now = new Date().toISOString();

  const initialNodes: LabComponent[] = defaultPreset
    ? defaultPreset.components.map(c => ({
        ...c,
        terminals: c.terminals.map(t => ({ ...t })),
        properties: { ...c.properties },
        state: { ...c.state },
      }))
    : [];

  const initialWires: WireConnection[] = defaultPreset
    ? defaultPreset.connections.map(w => ({ ...w }))
    : [];

  return {
    version: CURRENT_CIRCUIT_DOC_VERSION,
    id: `doc-ohms-law-preset`,
    title: "Ohm's Law Verification Circuit",
    domain: 'ELECTRONICS',
    createdAt: now,
    updatedAt: now,
    nodes: initialNodes,
    wires: initialWires,
    parameters: {
      voltage: 6.0,
      resistance: 20.0,
    },
    activeFaults: [],
    metadata: {
      experimentId: 'ohms-law',
      author: 'LabVerse Preloaded Preset',
      notes: 'Series DC circuit with Battery, Resistor, Ammeter, and Switch.',
    },
  };
}

/**
 * Duplicates a selected component node, shifting position slightly with a unique ID
 */
export function duplicateComponent(
  nodes: LabComponent[],
  targetNodeId: string
): { updatedNodes: LabComponent[]; newNodeId: string | null } {
  const sourceNode = nodes.find(n => n.id === targetNodeId);
  if (!sourceNode) return { updatedNodes: nodes, newNodeId: null };

  const newNodeId = `${sourceNode.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  const newNode: LabComponent = {
    ...sourceNode,
    id: newNodeId,
    title: `${sourceNode.title} (Copy)`,
    position: {
      x: sourceNode.position.x + 30,
      y: sourceNode.position.y + 30,
    },
    terminals: sourceNode.terminals.map(t => ({ ...t })),
    properties: { ...sourceNode.properties },
    state: { ...sourceNode.state },
  };

  return {
    updatedNodes: [...nodes, newNode],
    newNodeId,
  };
}

/**
 * Validates a CircuitDocument graph for electrical completeness and errors
 */
export function validateCircuitDocumentGraph(
  nodes: LabComponent[],
  wires: WireConnection[]
): TopologyVerificationResult {
  const errors: SimulationError[] = [];
  const warnings: SimulationWarning[] = [];

  // Check 1: Missing Endpoints / Invalid Wires
  const nodeMap = new Map<string, LabComponent>(nodes.map(n => [n.id, n]));
  const danglingWires: string[] = [];
  const invalidWires: string[] = [];

  wires.forEach(w => {
    const fromNode = nodeMap.get(w.fromComponentId);
    const toNode = nodeMap.get(w.toComponentId);

    if (!fromNode || !toNode) {
      invalidWires.push(w.id);
      return;
    }

    const fromTerm = fromNode.terminals.find(t => t.id === w.fromTerminalId);
    const toTerm = toNode.terminals.find(t => t.id === w.toTerminalId);

    if (!fromTerm || !toTerm) {
      danglingWires.push(w.id);
    }
  });

  if (invalidWires.length > 0 || danglingWires.length > 0) {
    errors.push({
      code: 'DANGLING_WIRE',
      message: `Found ${invalidWires.length + danglingWires.length} wire(s) connected to missing components or terminals.`,
      hint: 'Delete broken wires or reconnect them to valid apparatus terminals.',
    });
  }

  // Check 2: Disconnected Components
  nodes.forEach(node => {
    const isConnected = wires.some(w => w.fromComponentId === node.id || w.toComponentId === node.id);
    if (!isConnected) {
      warnings.push({
        code: 'DISCONNECTED_COMPONENT',
        message: `Apparatus '${node.title}' (${node.id}) is not wired into the circuit graph.`,
      });
    }
  });

  // Check 3: Missing Voltage Source / Load
  const battery = nodes.find(n => n.type === 'BATTERY' || n.type === 'DC_SUPPLY');
  const resistor = nodes.find(n => n.type === 'RESISTOR' || n.type === 'VARIABLE_RESISTOR');

  if (!battery) {
    errors.push({
      code: 'MISSING_SOURCE',
      message: 'No DC Voltage Power Supply present in circuit schema.',
      hint: 'Add a Battery or DC Power Supply to provide electromotive force.',
    });
  }

  if (!resistor) {
    errors.push({
      code: 'MISSING_LOAD',
      message: 'No resistive load present in circuit schema.',
      hint: 'Add an Ohmic Resistor to provide electrical resistance and prevent short circuit.',
    });
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      canSimulate: false,
      message: 'Circuit Document Contains Topological Errors',
      details: errors.map(e => e.message).join(' '),
      errors,
      warnings,
      circuitTopology: 'INVALID',
    };
  }

  // Delegate to series topology validator
  return ohmsLawExperiment.validateTopology(nodes, wires);
}

/**
 * Saves a CircuitDocument to LocalStorage
 */
export function saveCircuitDocumentToStorage(doc: CircuitDocument): void {
  if (typeof window === 'undefined') return;
  try {
    const updatedDoc = {
      ...doc,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${CIRCUIT_DOC_STORAGE_KEY_PREFIX}${doc.id}`, JSON.stringify(updatedDoc));
  } catch (err) {
    console.error('Failed to save CircuitDocument to localStorage:', err);
  }
}

/**
 * Loads a CircuitDocument from LocalStorage
 */
export function loadCircuitDocumentFromStorage(id: string): CircuitDocument | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CIRCUIT_DOC_STORAGE_KEY_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as CircuitDocument;
  } catch (err) {
    console.error('Failed to load CircuitDocument from localStorage:', err);
    return null;
  }
}

/**
 * Exports a CircuitDocument to formatted JSON string
 */
export function exportCircuitDocumentJSON(doc: CircuitDocument): string {
  return JSON.stringify(doc, null, 2);
}

/**
 * Imports and validates a CircuitDocument from JSON string
 */
export function importCircuitDocumentJSON(jsonStr: string): CircuitDocument {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== 'object' || !parsed.id || !Array.isArray(parsed.nodes)) {
    throw new Error('Invalid CircuitDocument schema structure.');
  }
  return {
    version: parsed.version || CURRENT_CIRCUIT_DOC_VERSION,
    id: parsed.id,
    title: parsed.title || 'Imported Circuit',
    domain: parsed.domain || 'ELECTRONICS',
    createdAt: parsed.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: parsed.nodes,
    wires: parsed.wires || [],
    parameters: parsed.parameters || { voltage: 6.0, resistance: 20.0 },
    activeFaults: parsed.activeFaults || [],
    metadata: parsed.metadata || {},
  };
}
