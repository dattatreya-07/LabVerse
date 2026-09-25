import { LabComponent, WireConnection, TopologyVerificationResult, SimulationError, SimulationWarning } from '@/types';

export function createWire(
  fromComponentId: string,
  fromTerminalId: string,
  toComponentId: string,
  toTerminalId: string,
  color: string = '#0284c7'
): WireConnection {
  return {
    id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    fromComponentId,
    fromTerminalId,
    toComponentId,
    toTerminalId,
    color,
    isConducting: false,
    isBroken: false,
  };
}

export interface AdjacencyNode {
  componentId: string;
  terminalId: string;
  connectedTo: Array<{
    componentId: string;
    terminalId: string;
    wireId: string;
  }>;
}

/**
 * Builds an electrical node graph from components and wire connections
 */
export function buildCircuitGraph(components: LabComponent[], connections: WireConnection[]): Map<string, Array<{ componentId: string; terminalId: string; wireId: string }>> {
  const graph = new Map<string, Array<{ componentId: string; terminalId: string; wireId: string }>>();

  // Initialize nodes for every terminal on the board
  components.forEach(comp => {
    comp.terminals.forEach(term => {
      const key = `${comp.id}:${term.id}`;
      graph.set(key, []);
    });
  });

  // Connect wires
  connections.forEach(wire => {
    const key1 = `${wire.fromComponentId}:${wire.fromTerminalId}`;
    const key2 = `${wire.toComponentId}:${wire.toTerminalId}`;

    if (graph.has(key1) && graph.has(key2)) {
      graph.get(key1)!.push({ componentId: wire.toComponentId, terminalId: wire.toTerminalId, wireId: wire.id });
      graph.get(key2)!.push({ componentId: wire.fromComponentId, terminalId: wire.fromTerminalId, wireId: wire.id });
    }
  });

  return graph;
}

/**
 * Generic DC series circuit topological validator for Ohm's Law and basic electronics
 */
export function validateSeriesCircuitTopology(
  components: LabComponent[],
  connections: WireConnection[]
): TopologyVerificationResult {
  const errors: SimulationError[] = [];
  const warnings: SimulationWarning[] = [];

  const battery = components.find(c => c.type === 'BATTERY' || c.type === 'DC_SUPPLY');
  const resistor = components.find(c => c.type === 'RESISTOR' || c.type === 'VARIABLE_RESISTOR');
  const ammeter = components.find(c => c.type === 'AMMETER');
  const switchComp = components.find(c => c.type === 'SWITCH');

  // Check 1: Structural completeness
  if (!battery) {
    errors.push({
      code: 'MISSING_SOURCE',
      message: 'No DC voltage source found in workspace.',
      hint: 'Drag a DC Battery from the Equipment Shelf onto the breadboard.',
    });
  }

  if (!resistor) {
    errors.push({
      code: 'MISSING_LOAD',
      message: 'No resistive load present.',
      hint: 'Drag an Ohmic Resistor onto the breadboard to limit circuit current.',
    });
  }

  if (!ammeter) {
    warnings.push({
      code: 'MISSING_AMMETER',
      message: 'No ammeter connected to measure circuit current.',
    });
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      canSimulate: false,
      message: 'Incomplete Apparatus Setup',
      details: errors.map(e => e.message).join(' '),
      errors,
      warnings,
      circuitTopology: 'INVALID',
    };
  }

  // Check 2: Connection completeness
  if (connections.length < 2) {
    return {
      isValid: false,
      canSimulate: false,
      message: 'Circuit is open / not wired.',
      details: 'You need to wire components in a complete loop.',
      errors: [{
        code: 'INCOMPLETE_WIRING',
        message: 'Insufficient wire connections to form a closed circuit loop.',
        hint: 'Click on a terminal and connect it to another component terminal.',
      }],
      warnings,
      circuitTopology: 'OPEN',
    };
  }

  // Build adjacency map for each terminal
  const graph = buildCircuitGraph(components, connections);

  const batPosTerm = battery!.terminals.find(t => t.type === 'POSITIVE' || t.id === 'pos' || t.id === '+' || t.label === '+' || t.name.includes('+')) || battery!.terminals[0];
  const batNegTerm = battery!.terminals.find(t => (t.type === 'NEGATIVE' || t.id === 'neg' || t.id === '-' || t.label === '-' || t.name.includes('-')) && t.id !== batPosTerm.id) || battery!.terminals.find(t => t.id !== batPosTerm.id) || battery!.terminals[1] || battery!.terminals[0];

  const batPosKey = `${battery!.id}:${batPosTerm.id}`;
  const batNegKey = `${battery!.id}:${batNegTerm.id}`;

  const posConns = graph.get(batPosKey) || [];
  const negConns = graph.get(batNegKey) || [];

  // Direct short across battery terminals
  if (posConns.some(c => c.componentId === battery!.id && c.terminalId === batNegTerm.id)) {
    return {
      isValid: false,
      canSimulate: false,
      message: 'Direct Short Circuit Detected!',
      details: 'The battery positive and negative terminals are directly shorted with zero resistance.',
      errors: [{
        code: 'SHORT_CIRCUIT',
        message: 'Battery shorted: High current risk.',
        hint: 'Connect a resistor between battery terminals rather than shorting them directly.',
      }],
      warnings,
      circuitTopology: 'SHORT',
    };
  }

  // Check if ammeter is in parallel across battery
  if (ammeter) {
    const ammPosTerm = ammeter.terminals.find(t => t.type === 'POSITIVE' || t.type === 'INPUT' || t.id === 'pos' || t.id === 'in' || t.id === '+' || t.label === '+') || ammeter.terminals[0];
    const ammNegTerm = ammeter.terminals.find(t => (t.type === 'NEGATIVE' || t.type === 'OUTPUT' || t.id === 'neg' || t.id === 'out' || t.id === '-' || t.label === '-') && t.id !== ammPosTerm.id) || ammeter.terminals.find(t => t.id !== ammPosTerm.id) || ammeter.terminals[1] || ammeter.terminals[0];

    const batToAmmPos = posConns.some(c => c.componentId === ammeter.id && c.terminalId === ammPosTerm.id);
    const batToAmmNeg = negConns.some(c => c.componentId === ammeter.id && c.terminalId === ammNegTerm.id);

    if (batToAmmPos && batToAmmNeg && connections.length === 2) {
      return {
        isValid: false,
        canSimulate: false,
        message: 'Ammeter Parallel Error!',
        details: 'An ideal ammeter has negligible internal resistance (0 Ω). Connecting it directly across the battery creates a dangerous short circuit.',
        errors: [{
          code: 'AMMETER_PARALLEL',
          message: 'Ammeter connected in parallel across power supply.',
          hint: 'Ammeters must always be connected in SERIES with the resistor load.',
        }],
        warnings,
        circuitTopology: 'SHORT',
      };
    }
  }

  // Follow circuit path sequentially starting from Battery POS
  const visitedComps = new Set<string>([battery!.id]);
  let currentCompId = battery!.id;
  let currentTermId = batPosTerm.id;
  let reachedTarget = false;
  const maxSteps = components.length * 2 + 5;
  let step = 0;

  while (step < maxSteps) {
    step++;
    const currentKey = `${currentCompId}:${currentTermId}`;
    const wires = graph.get(currentKey) || [];
    
    // Find a wire leading to an unvisited component or back to battery neg
    let nextHop: { componentId: string; terminalId: string } | null = null;
    for (const w of wires) {
      if (w.componentId === battery!.id && (w.terminalId === batNegTerm.id || w.terminalId === batPosTerm.id)) {
        if (visitedComps.size >= 2) {
          reachedTarget = true;
          break;
        }
      }
      if (!visitedComps.has(w.componentId)) {
        nextHop = w;
        break;
      }
    }

    if (reachedTarget) break;
    if (!nextHop) break;

    // Move to next component
    const nextComp = components.find(c => c.id === nextHop!.componentId);
    if (!nextComp) break;

    visitedComps.add(nextComp.id);
    currentCompId = nextComp.id;

    // Cross through component body to its other terminal
    const otherTerm = nextComp.terminals.find(t => t.id !== nextHop!.terminalId);
    if (!otherTerm) break;
    currentTermId = otherTerm.id;
  }

  // If path from POS didn't reach, try from NEG
  if (!reachedTarget) {
    visitedComps.clear();
    visitedComps.add(battery!.id);
    currentCompId = battery!.id;
    currentTermId = batNegTerm.id;
    step = 0;

    while (step < maxSteps) {
      step++;
      const currentKey = `${currentCompId}:${currentTermId}`;
      const wires = graph.get(currentKey) || [];
      
      let nextHop: { componentId: string; terminalId: string } | null = null;
      for (const w of wires) {
        if (w.componentId === battery!.id && (w.terminalId === batPosTerm.id || w.terminalId === batNegTerm.id)) {
          if (visitedComps.size >= 2) {
            reachedTarget = true;
            break;
          }
        }
        if (!visitedComps.has(w.componentId)) {
          nextHop = w;
          break;
        }
      }

      if (reachedTarget) break;
      if (!nextHop) break;

      const nextComp = components.find(c => c.id === nextHop!.componentId);
      if (!nextComp) break;

      visitedComps.add(nextComp.id);
      currentCompId = nextComp.id;

      const otherTerm = nextComp.terminals.find(t => t.id !== nextHop!.terminalId);
      if (!otherTerm) break;
      currentTermId = otherTerm.id;
    }
  }

  if (!reachedTarget) {
    return {
      isValid: false,
      canSimulate: false,
      message: 'Open Circuit: Discontinuous Loop',
      details: 'Current cannot flow because the path from Battery (+) back to Battery (-) is broken or incomplete.',
      errors: [{
        code: 'OPEN_LOOP',
        message: 'The circuit path does not form a closed conductive loop back to the power supply.',
        hint: 'Verify that all components are connected sequentially (Battery → Resistor → Ammeter → Battery).',
      }],
      warnings,
      circuitTopology: 'OPEN',
    };
  }

  // Check if switch is in the loop and open
  if (switchComp && visitedComps.has(switchComp.id) && switchComp.state?.isOpen) {
    return {
      isValid: true,
      canSimulate: true,
      message: 'Switch is Open (0.00 A)',
      details: 'Circuit is correctly assembled, but the switch contact is open.',
      errors: [],
      warnings: [{
        code: 'SWITCH_OPEN',
        message: 'Toggle the switch to close contacts and allow current to flow.',
      }],
      circuitTopology: 'OPEN',
    };
  }

  return {
    isValid: true,
    canSimulate: true,
    message: 'Valid Series Circuit Setup',
    details: 'All components correctly placed in series loop.',
    errors: [],
    warnings,
    circuitTopology: 'SERIES',
  };
}
