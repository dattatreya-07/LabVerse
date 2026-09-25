import { runExperimentSimulation, formatCurrent } from './engine';
import { SimulationInput, LabComponent, WireConnection } from '@/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('=== Running Modular Simulation Engine Tests ===');

// Standard Ohm's Law Circuit Setup
const batteryComp: LabComponent = {
  id: 'bat-1',
  type: 'BATTERY',
  domain: 'ELECTRONICS',
  title: 'DC Power Source',
  position: { x: 80, y: 150 },
  terminals: [
    { id: 'bat-pos', name: 'Positive (+)', type: 'POSITIVE', position: { x: 120, y: 20 }, label: '+' },
    { id: 'bat-neg', name: 'Negative (-)', type: 'NEGATIVE', position: { x: 0, y: 20 }, label: '-' },
  ],
  properties: { voltage: 6.0 },
  state: { isPowered: true },
};

const resistorComp: LabComponent = {
  id: 'res-1',
  type: 'RESISTOR',
  domain: 'ELECTRONICS',
  title: 'Standard Resistor',
  position: { x: 260, y: 50 },
  terminals: [
    { id: 'res-t1', name: 'Terminal 1', type: 'NEUTRAL', position: { x: 0, y: 20 } },
    { id: 'res-t2', name: 'Terminal 2', type: 'NEUTRAL', position: { x: 120, y: 20 } },
  ],
  properties: { resistance: 20.0 },
  state: {},
};

const ammeterComp: LabComponent = {
  id: 'amm-1',
  type: 'AMMETER',
  domain: 'ELECTRONICS',
  title: 'Precision Digital Ammeter',
  position: { x: 440, y: 150 },
  terminals: [
    { id: 'amm-in', name: 'Input (+)', type: 'INPUT', position: { x: 0, y: 20 }, label: 'A+' },
    { id: 'amm-out', name: 'Output (-)', type: 'OUTPUT', position: { x: 120, y: 20 }, label: 'COM' },
  ],
  properties: { scale: 'AUTO' },
  state: {},
};

// Closed Loop Connections: Battery(+) -> Resistor -> Ammeter -> Battery(-)
const closedCircuitWires: WireConnection[] = [
  { id: 'w1', fromComponentId: 'bat-1', fromTerminalId: 'bat-pos', toComponentId: 'res-1', toTerminalId: 'res-t1', color: '#ef4444' },
  { id: 'w2', fromComponentId: 'res-1', fromTerminalId: 'res-t2', toComponentId: 'amm-1', toTerminalId: 'amm-in', color: '#3b82f6' },
  { id: 'w3', fromComponentId: 'amm-1', fromTerminalId: 'amm-out', toComponentId: 'bat-1', toTerminalId: 'bat-neg', color: '#10b981' },
];

// Test 1: 6 V across 20 Ω produces 0.30 A theoretical & simulated current
const test1Input: SimulationInput = {
  experimentId: 'ohms-law',
  components: [batteryComp, resistorComp, ammeterComp],
  connections: closedCircuitWires,
  parameters: { voltage: 6.0, resistance: 20.0 },
  activeFaults: [],
};

const res1 = runExperimentSimulation(test1Input);
assert(res1.derivedValues.theoreticalCurrent === 0.3, `Expected theoreticalCurrent 0.3, got ${res1.derivedValues.theoreticalCurrent}`);
assert(res1.derivedValues.observedCurrent === 0.3, `Expected observedCurrent 0.3, got ${res1.derivedValues.observedCurrent}`);
assert(res1.success === true, 'Expected simulation to be successful');
console.log('✔ Test 1 Passed: 6V / 20Ω = 0.3000A in Ohm\'s Law circuit');

// Test 2: Open circuit fault
const test2Input: SimulationInput = {
  ...test1Input,
  activeFaults: ['FAULT_OPEN_CIRCUIT'],
};
const res2 = runExperimentSimulation(test2Input);
assert(res2.derivedValues.theoreticalCurrent === 0.3, `Expected theoretical 0.3, got ${res2.derivedValues.theoreticalCurrent}`);
assert(res2.derivedValues.simulatedCurrent === 0, `Expected physical simulatedCurrent 0, got ${res2.derivedValues.simulatedCurrent}`);
assert(res2.derivedValues.observedCurrent === 0, `Expected observedCurrent 0, got ${res2.derivedValues.observedCurrent}`);
console.log('✔ Test 2 Passed: Open Circuit Fault safely forces current to 0A while maintaining 0.3A theoretical reference');

// Test 3: Meter calibration fault (Ammeter calibration drift)
const test3Input: SimulationInput = {
  ...test1Input,
  parameters: { voltage: 10.0, resistance: 50.0 },
  activeFaults: ['FAULT_METER_CALIBRATION'],
};
const res3 = runExperimentSimulation(test3Input);
// Theo: 10/50 = 0.2A. Observed = 0.2 * 2.5 = 0.5A
assert(res3.derivedValues.theoreticalCurrent === 0.2, `Expected theoretical 0.2, got ${res3.derivedValues.theoreticalCurrent}`);
assert(res3.derivedValues.simulatedCurrent === 0.2, `Expected simulated 0.2, got ${res3.derivedValues.simulatedCurrent}`);
assert(res3.derivedValues.observedCurrent === 0.5, `Expected observed 0.5, got ${res3.derivedValues.observedCurrent}`);
console.log('✔ Test 3 Passed: Ammeter Calibration Fault offsets meter reading to 0.5A while true circuit current is 0.2A');

// Test 4: Variable Gravity Pendulum Simulation (Mechanics)
// T = 2 * pi * sqrt(L / g). For L = 1m on Earth (g = 9.81 m/s²), T = 2.006 s
const pendulumInput: SimulationInput = {
  experimentId: 'gravity-pendulum',
  components: [],
  connections: [],
  parameters: { length: 1.0, mass: 0.5, gravity: 9.81 },
  activeFaults: [],
};
const pendulumRes = runExperimentSimulation(pendulumInput);
const periodMeas = pendulumRes.measurements.find(m => m.symbol === 'T');
assert(periodMeas !== undefined, 'Expected period measurement T');
assert(Math.abs(periodMeas!.theoreticalValue - 2.006) < 0.01, `Expected T ≈ 2.006s, got ${periodMeas!.theoreticalValue}`);
console.log(`✔ Test 4 Passed: Pendulum physics solver T = 2π√(L/g) -> ${periodMeas!.theoreticalValue}s on Earth`);

// Test 5: Photoelectric Effect Simulation (Quantum)
// Light freq = 8.0 x 10^14 Hz, Cesium work function = 2.14 eV.
const photoelectricInput: SimulationInput = {
  experimentId: 'photoelectric-effect',
  components: [],
  connections: [],
  parameters: { frequency: 8.0, intensity: 100, work_function: 2.14, reverse_voltage: 0 },
  activeFaults: [],
};
const photoRes = runExperimentSimulation(photoelectricInput);
assert(photoRes.success === true, 'Photoelectric simulation should succeed');
const photonEnergy = photoRes.measurements.find(m => m.symbol === 'E_ph' || m.symbol === 'E');
assert(photonEnergy !== undefined, 'Photon energy measurement present');
console.log(`✔ Test 5 Passed: Quantum Photoelectric solver (E_photon = ${photonEnergy!.theoreticalValue} eV)`);

// Test 6: Current formatting utility
assert(formatCurrent(0.3) === '300.0 mA (0.300 A)', `Got ${formatCurrent(0.3)}`);
assert(formatCurrent(2.5) === '2.50 A', `Got ${formatCurrent(2.5)}`);
console.log('✔ Test 6 Passed: Scientific current unit formatter handles milliamp and ampere scales');

console.log('\n=========================================');
console.log('ALL SIMULATION & DOMAIN SOLVER TESTS PASSED! 🎉');
console.log('=========================================\n');
