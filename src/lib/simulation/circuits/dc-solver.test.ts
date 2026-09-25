import { solveDCCircuit } from './dc-solver';
import { LabComponent, WireConnection } from '@/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('=== Running Numerical MNA DC Solver Unit Tests ===\n');

// 1. Single Resistor Circuit (6V / 20Ω = 0.3A)
const bat1: LabComponent = {
  id: 'bat-1',
  type: 'BATTERY',
  title: 'DC Source',
  domain: 'ELECTRONICS',
  position: { x: 100, y: 100 },
  terminals: [
    { id: 'pos', name: '+', type: 'POSITIVE', position: { x: 0, y: -20 } },
    { id: 'neg', name: '-', type: 'NEGATIVE', position: { x: 0, y: 20 } },
  ],
  properties: { voltage: 6.0 },
  state: {},
};

const res1: LabComponent = {
  id: 'res-1',
  type: 'RESISTOR',
  title: 'Resistor R1',
  domain: 'ELECTRONICS',
  position: { x: 300, y: 100 },
  terminals: [
    { id: 't1', name: 'T1', type: 'NEUTRAL', position: { x: -30, y: 0 } },
    { id: 't2', name: 'T2', type: 'NEUTRAL', position: { x: 30, y: 0 } },
  ],
  properties: { resistance: 20.0 },
  state: {},
};

const wires1: WireConnection[] = [
  { id: 'w1', fromComponentId: 'bat-1', fromTerminalId: 'pos', toComponentId: 'res-1', toTerminalId: 't1' },
  { id: 'w2', fromComponentId: 'res-1', fromTerminalId: 't2', toComponentId: 'bat-1', toTerminalId: 'neg' },
];

const resSingle = solveDCCircuit({
  nodes: [bat1, res1],
  wires: wires1,
  parameters: { voltage: 6.0, resistance: 20.0 },
});

assert(resSingle.success === true, 'Single resistor circuit should solve successfully');
assert(Math.abs(resSingle.sourceCurrent - 0.3) < 1e-4, `Expected current 0.3A, got ${resSingle.sourceCurrent}A`);
assert(Math.abs(resSingle.equivalentResistance - 20.0) < 1e-2, `Expected Req 20Ω, got ${resSingle.equivalentResistance}Ω`);
console.log('✔ Test 1 Passed: Single Resistor (6V / 20Ω = 0.3000A, Req = 20Ω)');

// 2. Series Resistor Circuit (12V / (10Ω + 20Ω) = 0.4A)
const bat12: LabComponent = { ...bat1, properties: { voltage: 12.0 } };
const resR1: LabComponent = { ...res1, properties: { resistance: 10.0 } };
const resR2: LabComponent = {
  ...res1,
  id: 'res-2',
  title: 'Resistor R2',
  position: { x: 500, y: 100 },
  properties: { resistance: 20.0 },
};

const wiresSeries: WireConnection[] = [
  { id: 'w1', fromComponentId: 'bat-1', fromTerminalId: 'pos', toComponentId: 'res-1', toTerminalId: 't1' },
  { id: 'w2', fromComponentId: 'res-1', fromTerminalId: 't2', toComponentId: 'res-2', toTerminalId: 't1' },
  { id: 'w3', fromComponentId: 'res-2', fromTerminalId: 't2', toComponentId: 'bat-1', toTerminalId: 'neg' },
];

const resSeries = solveDCCircuit({
  nodes: [bat12, resR1, resR2],
  wires: wiresSeries,
  parameters: { voltage: 12.0 },
});

assert(resSeries.success === true, 'Series circuit should solve successfully');
assert(Math.abs(resSeries.sourceCurrent - 0.4) < 1e-4, `Expected current 0.4A, got ${resSeries.sourceCurrent}A`);
assert(Math.abs(resSeries.equivalentResistance - 30.0) < 1e-2, `Expected Req 30Ω, got ${resSeries.equivalentResistance}Ω`);
console.log('✔ Test 2 Passed: Series Resistor Network (12V / [10Ω + 20Ω] = 0.4000A, Req = 30Ω)');

// 3. Parallel Resistor Circuit (6V / (20Ω || 20Ω) = 0.6A)
const resP1: LabComponent = { ...res1, id: 'res-p1' };
const resP2: LabComponent = { ...res1, id: 'res-p2', position: { x: 300, y: 250 } };

const wiresParallel: WireConnection[] = [
  { id: 'wp1', fromComponentId: 'bat-1', fromTerminalId: 'pos', toComponentId: 'res-p1', toTerminalId: 't1' },
  { id: 'wp2', fromComponentId: 'bat-1', fromTerminalId: 'pos', toComponentId: 'res-p2', toTerminalId: 't1' },
  { id: 'wp3', fromComponentId: 'res-p1', fromTerminalId: 't2', toComponentId: 'bat-1', toTerminalId: 'neg' },
  { id: 'wp4', fromComponentId: 'res-p2', fromTerminalId: 't2', toComponentId: 'bat-1', toTerminalId: 'neg' },
];

const resParallel = solveDCCircuit({
  nodes: [bat1, resP1, resP2],
  wires: wiresParallel,
  parameters: { voltage: 6.0 },
});

assert(resParallel.success === true, 'Parallel circuit should solve successfully');
assert(Math.abs(resParallel.sourceCurrent - 0.6) < 1e-4, `Expected total current 0.6A, got ${resParallel.sourceCurrent}A`);
assert(Math.abs(resParallel.equivalentResistance - 10.0) < 1e-2, `Expected Req 10Ω, got ${resParallel.equivalentResistance}Ω`);
console.log('✔ Test 3 Passed: Parallel Resistor Network (6V / [20Ω || 20Ω] = 0.6000A, Req = 10Ω)');

// 4. Open Switch / Discontinuous Loop
const switchComp: LabComponent = {
  id: 'sw-1',
  type: 'SWITCH',
  title: 'Knife Switch',
  domain: 'ELECTRONICS',
  position: { x: 200, y: 100 },
  terminals: [
    { id: 't1', name: 'T1', type: 'NEUTRAL', position: { x: -20, y: 0 } },
    { id: 't2', name: 'T2', type: 'NEUTRAL', position: { x: 20, y: 0 } },
  ],
  properties: {},
  state: { isOpen: true },
};

const wiresSwitch: WireConnection[] = [
  { id: 'w1', fromComponentId: 'bat-1', fromTerminalId: 'pos', toComponentId: 'sw-1', toTerminalId: 't1' },
  { id: 'w2', fromComponentId: 'sw-1', fromTerminalId: 't2', toComponentId: 'res-1', toTerminalId: 't1' },
  { id: 'w3', fromComponentId: 'res-1', fromTerminalId: 't2', toComponentId: 'bat-1', toTerminalId: 'neg' },
];

const resSwitchOpen = solveDCCircuit({
  nodes: [bat1, res1, switchComp],
  wires: wiresSwitch,
  parameters: { voltage: 6.0, resistance: 20.0 },
});

assert(resSwitchOpen.sourceCurrent < 1e-4, `Expected open switch current ~0A, got ${resSwitchOpen.sourceCurrent}A`);
console.log('✔ Test 4 Passed: Open Switch / Circuit Discontinuity (0.0000A)');

// 5. Fault Injections (Meter Calibration Offset & High Resistance)
const ammComp: LabComponent = {
  id: 'amm-1',
  type: 'AMMETER',
  title: 'DC Ammeter',
  domain: 'ELECTRONICS',
  position: { x: 400, y: 100 },
  terminals: [
    { id: 'pos', name: '+', type: 'POSITIVE', position: { x: -20, y: 0 } },
    { id: 'neg', name: '-', type: 'NEGATIVE', position: { x: 20, y: 0 } },
  ],
  properties: {},
  state: {},
};

const wiresAmm: WireConnection[] = [
  { id: 'w1', fromComponentId: 'bat-1', fromTerminalId: 'pos', toComponentId: 'res-1', toTerminalId: 't1' },
  { id: 'w2', fromComponentId: 'res-1', fromTerminalId: 't2', toComponentId: 'amm-1', toTerminalId: 'pos' },
  { id: 'w3', fromComponentId: 'amm-1', fromTerminalId: 'neg', toComponentId: 'bat-1', toTerminalId: 'neg' },
];

const resFaultCal = solveDCCircuit({
  nodes: [bat1, res1, ammComp],
  wires: wiresAmm,
  parameters: { voltage: 6.0, resistance: 20.0 },
  activeFaults: ['FAULT_METER_CALIBRATION'],
});

const ammeterReading = resFaultCal.meterReadings.find(m => m.meterType === 'AMMETER');
assert(ammeterReading !== undefined, 'Ammeter reading should exist');
assert(Math.abs(ammeterReading!.observedValue - 0.75) < 1e-3, `Expected calibration fault reading 0.75A (2.5x drift), got ${ammeterReading!.observedValue}A`);
console.log('✔ Test 5 Passed: Meter Calibration Fault Offset (2.5x gain drift)');

console.log('\n=========================================');
console.log('ALL NUMERICAL MNA DC SOLVER TESTS PASSED! 🎉');
console.log('=========================================\n');
