import { LabComponent, WireConnection, SimulationError, SimulationWarning } from '@/types';

export interface DCSolverInput {
  nodes: LabComponent[];
  wires: WireConnection[];
  parameters: Record<string, number>;
  activeFaults?: string[];
}

export interface NodeVoltageResult {
  nodeId: number;
  voltage: number; // in Volts
  isReference: boolean;
  terminals: Array<{ componentId: string; terminalId: string }>;
}

export interface BranchCurrentResult {
  componentId: string;
  componentType: string;
  current: number; // in Amperes (positive from terminal 1 to terminal 2)
  voltageDrop: number; // in Volts
  powerDissipation: number; // in Watts
}

export interface MeterReadingResult {
  meterId: string;
  meterType: 'AMMETER' | 'VOLTMETER';
  observedValue: number;
  simulatedValue: number;
  unit: string;
  formattedText: string;
}

export interface DCSolverResult {
  success: boolean;
  canSimulate: boolean;
  status: 'SOLVED' | 'SINGULAR' | 'OPEN_CIRCUIT' | 'SHORT_CIRCUIT' | 'INVALID_TOPOLOGY';
  message: string;
  details?: string;
  nodeVoltages: NodeVoltageResult[];
  branchResults: Map<string, BranchCurrentResult>;
  meterReadings: MeterReadingResult[];
  equivalentResistance: number; // in Ohms
  sourceVoltage: number; // in Volts
  sourceCurrent: number; // in Amperes
  totalPower: number; // in Watts
  errors: SimulationError[];
  warnings: SimulationWarning[];
}

/**
 * Pure numerical Modified Nodal Analysis (MNA) solver for DC resistive circuits
 */
export function solveDCCircuit(input: DCSolverInput): DCSolverResult {
  const { nodes, wires, parameters, activeFaults = [] } = input;

  const errors: SimulationError[] = [];
  const warnings: SimulationWarning[] = [];

  // Filter valid components
  if (nodes.length === 0) {
    return createErrorResult('INVALID_TOPOLOGY', 'No components placed on canvas.', errors, warnings);
  }

  // Identify battery source & resistor load
  const battery = nodes.find(c => c.type === 'BATTERY' || c.type === 'DC_SUPPLY');
  const resistors = nodes.filter(c => c.type === 'RESISTOR' || c.type === 'VARIABLE_RESISTOR');
  const ammeters = nodes.filter(c => c.type === 'AMMETER');
  const voltmeters = nodes.filter(c => c.type === 'VOLTMETER');
  const switches = nodes.filter(c => c.type === 'SWITCH');

  if (!battery) {
    errors.push({
      code: 'MISSING_SOURCE',
      message: 'No DC voltage source found in circuit.',
      hint: 'Add a Battery or DC Voltage Supply to power the circuit.',
    });
    return createErrorResult('INVALID_TOPOLOGY', 'Missing Power Source', errors, warnings);
  }

  if (resistors.length === 0) {
    errors.push({
      code: 'MISSING_LOAD',
      message: 'No resistive load components in circuit.',
      hint: 'Add a Resistor to limit current and form a load.',
    });
    return createErrorResult('INVALID_TOPOLOGY', 'Missing Load Resistor', errors, warnings);
  }

  // 1. Build Netlist / Connected Equipotential Nets using Disjoint Set (Union-Find)
  const terminalKeys: string[] = [];
  nodes.forEach(n => {
    n.terminals.forEach(t => {
      terminalKeys.push(`${n.id}:${t.id}`);
    });
  });

  const parent = new Map<string, string>();
  terminalKeys.forEach(k => parent.set(k, k));

  function find(k: string): string {
    if (!parent.has(k)) return k;
    if (parent.get(k) !== k) {
      parent.set(k, find(parent.get(k)!));
    }
    return parent.get(k)!;
  }

  function union(k1: string, k2: string) {
    const r1 = find(k1);
    const r2 = find(k2);
    if (r1 !== r2) {
      parent.set(r1, r2);
    }
  }

  // Connect terminals joined by wires
  wires.forEach(w => {
    const k1 = `${w.fromComponentId}:${w.fromTerminalId}`;
    const k2 = `${w.toComponentId}:${w.toTerminalId}`;
    if (parent.has(k1) && parent.has(k2)) {
      union(k1, k2);
    }
  });

  // Group terminals into Net IDs
  const netMap = new Map<string, number>(); // Root terminal key -> Net Index
  const netTerminals = new Map<number, Array<{ componentId: string; terminalId: string }>>();

  terminalKeys.forEach(k => {
    const root = find(k);
    if (!netMap.has(root)) {
      netMap.set(root, netMap.size);
      netTerminals.set(netMap.get(root)!, []);
    }
    const netId = netMap.get(root)!;
    const [compObjId, termObjId] = k.split(':');
    netTerminals.get(netId)!.push({ componentId: compObjId, terminalId: termObjId });
  });

  const getTerminalNet = (compObjId: string, termObjId: string): number => {
    const key = `${compObjId}:${termObjId}`;
    const root = find(key);
    return netMap.get(root) ?? -1;
  };

  // Find Battery terminals
  const batPosTerm = battery.terminals.find(t => t.type === 'POSITIVE' || t.id.includes('pos') || t.id.includes('+')) || battery.terminals[0];
  const batNegTerm = battery.terminals.find(t => (t.type === 'NEGATIVE' || t.id.includes('neg') || t.id.includes('-')) && t.id !== batPosTerm.id) || battery.terminals.find(t => t.id !== batPosTerm.id) || battery.terminals[1] || battery.terminals[0];

  const posNet = getTerminalNet(battery.id, batPosTerm.id);
  const negNet = getTerminalNet(battery.id, batNegTerm.id);

  if (posNet === negNet && posNet !== -1) {
    errors.push({
      code: 'DIRECT_SHORT_CIRCUIT',
      message: 'Battery terminals are directly short-circuited with 0 Ω resistance.',
      hint: 'Remove direct wire connection between battery (+) and (-) terminals.',
    });
    return createErrorResult('SHORT_CIRCUIT', 'Direct Short Circuit Detected!', errors, warnings);
  }

  // 2. Assign Reference Node (Node 0) to Battery NEG Net
  const totalNets = netMap.size;
  const netToMnaNode = new Map<number, number>(); // Net ID -> MNA Node Index (0 = reference)
  
  let mnaNodeCount = 0;
  netToMnaNode.set(negNet, 0); // Reference ground = 0V

  for (let i = 0; i < totalNets; i++) {
    if (i !== negNet) {
      mnaNodeCount++;
      netToMnaNode.set(i, mnaNodeCount);
    }
  }

  // Check if battery POS net is connected to anything
  const posMnaNode = netToMnaNode.get(posNet) ?? -1;
  if (posMnaNode === -1) {
    return createErrorResult('OPEN_CIRCUIT', 'Circuit path is open / disconnected.', errors, warnings);
  }

  // 3. MNA Matrix Formulation: [A] [x] = [z]
  // Dimensions: N = mnaNodeCount (non-reference node voltages) + 1 (voltage source current)
  const vSourceIndex = mnaNodeCount + 1; // 1-indexed for MNA matrix size
  const matrixDim = mnaNodeCount + 1;

  // Initialize Matrix A (matrixDim x matrixDim) and Vector Z (matrixDim)
  const A: number[][] = Array.from({ length: matrixDim }, () => Array(matrixDim).fill(0));
  const Z: number[] = Array(matrixDim).fill(0);

  // Set Source Voltage value
  const vSource = parameters['voltage'] ?? (typeof battery.properties?.voltage === 'number' ? battery.properties.voltage : 6.0);
  
  // Add Voltage Source to MNA matrix
  // V(posMnaNode) - V(negMnaNode) = vSource
  // Note: negMnaNode is 0 (reference)
  const posIdx = posMnaNode - 1; // 0-indexed for matrix array
  const vSrcIdx = mnaNodeCount; // Column index for source current

  if (posIdx >= 0) {
    A[posIdx][vSrcIdx] += 1;
    A[vSrcIdx][posIdx] += 1;
  }
  Z[vSrcIdx] = vSource;

  // Stamp Resistors into Conductance Matrix
  resistors.forEach(res => {
    const t1 = res.terminals[0];
    const t2 = res.terminals[1];
    let rVal = parameters['resistance'] ?? (typeof res.properties?.resistance === 'number' ? res.properties.resistance : 20.0);

    if (activeFaults.includes('FAULT_HIGH_RESISTANCE')) {
      rVal += 100.0;
    }

    if (rVal <= 0) rVal = 0.001; // Avoid divide-by-zero

    const g = 1.0 / rVal;
    const n1 = netToMnaNode.get(getTerminalNet(res.id, t1.id)) ?? 0;
    const n2 = netToMnaNode.get(getTerminalNet(res.id, t2.id)) ?? 0;

    const idx1 = n1 - 1;
    const idx2 = n2 - 1;

    if (idx1 >= 0) A[idx1][idx1] += g;
    if (idx2 >= 0) A[idx2][idx2] += g;
    if (idx1 >= 0 && idx2 >= 0) {
      A[idx1][idx2] -= g;
      A[idx2][idx1] -= g;
    }
  });

  // Stamp Switches into Conductance Matrix
  switches.forEach(sw => {
    const t1 = sw.terminals[0];
    const t2 = sw.terminals[1];
    const isOpen = !!sw.state?.isOpen || activeFaults.includes('FAULT_OPEN_CIRCUIT');

    const g = isOpen ? 1e-9 : 1e6; // Near zero resistance when closed, open circuit when open
    const n1 = netToMnaNode.get(getTerminalNet(sw.id, t1.id)) ?? 0;
    const n2 = netToMnaNode.get(getTerminalNet(sw.id, t2.id)) ?? 0;

    const idx1 = n1 - 1;
    const idx2 = n2 - 1;

    if (idx1 >= 0) A[idx1][idx1] += g;
    if (idx2 >= 0) A[idx2][idx2] += g;
    if (idx1 >= 0 && idx2 >= 0) {
      A[idx1][idx2] -= g;
      A[idx2][idx1] -= g;
    }
  });

  // Stamp Ammeters (ideal resistance R = 0.001 Ω)
  ammeters.forEach(amm => {
    const t1 = amm.terminals[0];
    const t2 = amm.terminals[1];
    const g = 1000.0; // 0.001 Ω
    const n1 = netToMnaNode.get(getTerminalNet(amm.id, t1.id)) ?? 0;
    const n2 = netToMnaNode.get(getTerminalNet(amm.id, t2.id)) ?? 0;

    const idx1 = n1 - 1;
    const idx2 = n2 - 1;

    if (idx1 >= 0) A[idx1][idx1] += g;
    if (idx2 >= 0) A[idx2][idx2] += g;
    if (idx1 >= 0 && idx2 >= 0) {
      A[idx1][idx2] -= g;
      A[idx2][idx1] -= g;
    }
  });

  // Stamp Voltmeters (ideal high input resistance R = 1e7 Ω)
  voltmeters.forEach(vm => {
    const t1 = vm.terminals[0];
    const t2 = vm.terminals[1];
    const g = 1e-7;
    const n1 = netToMnaNode.get(getTerminalNet(vm.id, t1.id)) ?? 0;
    const n2 = netToMnaNode.get(getTerminalNet(vm.id, t2.id)) ?? 0;

    const idx1 = n1 - 1;
    const idx2 = n2 - 1;

    if (idx1 >= 0) A[idx1][idx1] += g;
    if (idx2 >= 0) A[idx2][idx2] += g;
    if (idx1 >= 0 && idx2 >= 0) {
      A[idx1][idx2] -= g;
      A[idx2][idx1] -= g;
    }
  });

  // 4. Solve Linear System A * X = Z using Gaussian Elimination with Partial Pivoting
  const X = solveLinearSystemGaussian(A, Z);

  if (!X) {
    return createErrorResult('SINGULAR', 'Unresolved or singular circuit graph matrix.', errors, warnings);
  }

  // Extract Node Voltages
  const nodeVoltageValues = new Map<number, number>();
  nodeVoltageValues.set(0, 0.0); // Ground = 0V

  for (let i = 0; i < mnaNodeCount; i++) {
    nodeVoltageValues.set(i + 1, X[i]);
  }

  const iSource = Math.abs(X[vSrcIdx]);

  // Construct Node Voltage Results
  const nodeVoltages: NodeVoltageResult[] = [];
  netToMnaNode.forEach((mnaIdx, netId) => {
    nodeVoltages.push({
      nodeId: mnaIdx,
      voltage: Number((nodeVoltageValues.get(mnaIdx) ?? 0).toFixed(4)),
      isReference: mnaIdx === 0,
      terminals: netTerminals.get(netId) || [],
    });
  });

  // Branch Current & Voltage Drop Results
  const branchResults = new Map<string, BranchCurrentResult>();

  resistors.forEach(res => {
    const t1 = res.terminals[0];
    const t2 = res.terminals[1];
    const n1 = netToMnaNode.get(getTerminalNet(res.id, t1.id)) ?? 0;
    const n2 = netToMnaNode.get(getTerminalNet(res.id, t2.id)) ?? 0;

    const v1 = nodeVoltageValues.get(n1) ?? 0;
    const v2 = nodeVoltageValues.get(n2) ?? 0;
    const vDrop = Math.abs(v1 - v2);

    let rVal = parameters['resistance'] ?? (typeof res.properties?.resistance === 'number' ? res.properties.resistance : 20.0);
    if (activeFaults.includes('FAULT_HIGH_RESISTANCE')) rVal += 100.0;

    const iBranch = rVal > 0 ? vDrop / rVal : 0;
    const pDiss = vDrop * iBranch;

    branchResults.set(res.id, {
      componentId: res.id,
      componentType: res.type,
      current: Number(iBranch.toFixed(4)),
      voltageDrop: Number(vDrop.toFixed(3)),
      powerDissipation: Number(pDiss.toFixed(3)),
    });
  });

  // Meter Readings Calculation
  const meterReadings: MeterReadingResult[] = [];

  ammeters.forEach(amm => {
    let simulatedCurrent = iSource;

    // Check if open circuit fault or open switch active
    const isOpen = switches.some(s => s.state?.isOpen) || activeFaults.includes('FAULT_OPEN_CIRCUIT');
    if (isOpen) simulatedCurrent = 0;

    let observedCurrent = simulatedCurrent;
    if (activeFaults.includes('FAULT_METER_CALIBRATION')) {
      observedCurrent = Number((simulatedCurrent * 2.5).toFixed(4));
    }

    meterReadings.push({
      meterId: amm.id,
      meterType: 'AMMETER',
      simulatedValue: Number(simulatedCurrent.toFixed(4)),
      observedValue: Number(observedCurrent.toFixed(4)),
      unit: 'A',
      formattedText: observedCurrent < 1.0 && observedCurrent > 0
        ? `${(observedCurrent * 1000).toFixed(1)} mA`
        : `${observedCurrent.toFixed(3)} A`,
    });
  });

  voltmeters.forEach(vm => {
    const t1 = vm.terminals[0];
    const t2 = vm.terminals[1];
    const n1 = netToMnaNode.get(getTerminalNet(vm.id, t1.id)) ?? 0;
    const n2 = netToMnaNode.get(getTerminalNet(vm.id, t2.id)) ?? 0;

    const v1 = nodeVoltageValues.get(n1) ?? 0;
    const v2 = nodeVoltageValues.get(n2) ?? 0;
    const vDrop = Math.abs(v1 - v2);

    meterReadings.push({
      meterId: vm.id,
      meterType: 'VOLTMETER',
      simulatedValue: Number(vDrop.toFixed(2)),
      observedValue: Number(vDrop.toFixed(2)),
      unit: 'V',
      formattedText: `${vDrop.toFixed(2)} V`,
    });
  });

  // Calculate Equivalent Resistance Req = V_source / I_source
  const eqResistance = iSource > 0 ? Number((vSource / iSource).toFixed(2)) : 0;
  const totalPower = Number((vSource * iSource).toFixed(3));

  const isCircuitOpen = iSource < 1e-6;

  return {
    success: true,
    canSimulate: true,
    status: isCircuitOpen ? 'OPEN_CIRCUIT' : 'SOLVED',
    message: isCircuitOpen ? 'Open Circuit (0.00 A Flow)' : 'DC Circuit Solved Successfully',
    details: isCircuitOpen 
      ? 'Circuit path is open or switch contacts are open.'
      : `Solved MNA matrix: Node V = ${vSource.toFixed(2)}V, I = ${iSource.toFixed(4)}A, Req = ${eqResistance}Ω.`,
    nodeVoltages,
    branchResults,
    meterReadings,
    equivalentResistance: eqResistance,
    sourceVoltage: Number(vSource.toFixed(2)),
    sourceCurrent: Number(iSource.toFixed(4)),
    totalPower,
    errors,
    warnings,
  };
}

/**
 * Gaussian Elimination with Partial Pivoting to solve A * X = Z
 */
function solveLinearSystemGaussian(AIn: number[][], ZIn: number[]): number[] | null {
  const n = AIn.length;
  const A = AIn.map(row => [...row]);
  const Z = [...ZIn];

  for (let i = 0; i < n; i++) {
    // Partial pivoting: find maximum entry in column i
    let maxRow = i;
    let maxVal = Math.abs(A[i][i]);
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxVal) {
        maxVal = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    if (maxVal < 1e-12) {
      // Singular or rank-deficient matrix
      return null;
    }

    // Swap maximum row with current row
    if (maxRow !== i) {
      const tempRow = A[i];
      A[i] = A[maxRow];
      A[maxRow] = tempRow;

      const tempZ = Z[i];
      Z[i] = Z[maxRow];
      Z[maxRow] = tempZ;
    }

    // Eliminate column entries below pivot
    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
      Z[k] -= factor * Z[i];
    }
  }

  // Back substitution
  const X = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = Z[i];
    for (let j = i + 1; j < n; j++) {
      sum -= A[i][j] * X[j];
    }
    X[i] = sum / A[i][i];
  }

  return X;
}

function createErrorResult(
  status: 'SOLVED' | 'SINGULAR' | 'OPEN_CIRCUIT' | 'SHORT_CIRCUIT' | 'INVALID_TOPOLOGY',
  message: string,
  errors: SimulationError[],
  warnings: SimulationWarning[]
): DCSolverResult {
  return {
    success: false,
    canSimulate: false,
    status,
    message,
    details: errors.map(e => e.message).join(' '),
    nodeVoltages: [],
    branchResults: new Map(),
    meterReadings: [],
    equivalentResistance: 0,
    sourceVoltage: 0,
    sourceCurrent: 0,
    totalPower: 0,
    errors,
    warnings,
  };
}
