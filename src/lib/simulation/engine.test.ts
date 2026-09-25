import { runSimulation, validateInput, formatCurrent } from './engine';
import { CircuitInput } from '@/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('=== Running Simulation Engine Tests ===');

// Test 1: 6 V across 20 Ω produces 0.30 A theoretical current
const test1Input: CircuitInput = { voltage: 6, resistance: 20, faultType: 'NORMAL' };
const res1 = runSimulation(test1Input);
assert(res1.theoreticalCurrent === 0.3, `Expected theoreticalCurrent 0.3, got ${res1.theoreticalCurrent}`);
assert(res1.measuredCurrent === 0.3, `Expected measuredCurrent 0.3, got ${res1.measuredCurrent}`);
assert(res1.isCircuitClosed === true, 'Expected circuit to be closed');
console.log('✔ Test 1 Passed: 6V / 20Ω = 0.30A Normal Circuit');

// Test 2: Open circuit fault
const test2Input: CircuitInput = { voltage: 6, resistance: 20, faultType: 'OPEN_CIRCUIT' };
const res2 = runSimulation(test2Input);
assert(res2.theoreticalCurrent === 0.3, `Expected theoretical 0.3, got ${res2.theoreticalCurrent}`);
assert(res2.circuitCurrent === 0, `Expected physical circuitCurrent 0, got ${res2.circuitCurrent}`);
assert(res2.measuredCurrent === 0, `Expected measuredCurrent 0, got ${res2.measuredCurrent}`);
assert(res2.isCircuitClosed === false, 'Expected circuit to be open');
console.log('✔ Test 2 Passed: Open Circuit Fault produces 0A current');

// Test 3: Meter calibration fault
const test3Input: CircuitInput = { voltage: 10, resistance: 50, faultType: 'METER_FAULT' };
// I_theo = 10 / 50 = 0.2A. Measured = 0.2 * 2.5 = 0.5A
const res3 = runSimulation(test3Input);
assert(res3.theoreticalCurrent === 0.2, `Expected theoretical 0.2, got ${res3.theoreticalCurrent}`);
assert(res3.circuitCurrent === 0.2, `Expected circuitCurrent 0.2, got ${res3.circuitCurrent}`);
assert(res3.measuredCurrent === 0.5, `Expected measuredCurrent 0.5, got ${res3.measuredCurrent}`);
console.log('✔ Test 3 Passed: Meter Calibration Fault scales reading to 0.5A while circuit current remains 0.2A');

// Test 4: Boundary validation tests
const invalidVolt = validateInput({ voltage: -5, resistance: 100, faultType: 'NORMAL' });
assert(!invalidVolt.valid, 'Negative voltage should be invalid');

const invalidRes = validateInput({ voltage: 12, resistance: 0, faultType: 'NORMAL' });
assert(!invalidRes.valid, 'Zero resistance should be invalid (divide by zero prevention)');

const invalidInf = validateInput({ voltage: Infinity, resistance: 10, faultType: 'NORMAL' });
assert(!invalidInf.valid, 'Infinite voltage should be invalid');

console.log('✔ Test 4 Passed: Input validation prevents negative voltage, 0Ω resistance, and Infinity');

// Test 5: Unit formatting
assert(formatCurrent(0.3) === '300.0 mA (0.300 A)', `Got ${formatCurrent(0.3)}`);
assert(formatCurrent(2.5) === '2.50 A', `Got ${formatCurrent(2.5)}`);
console.log('✔ Test 5 Passed: Current formatting converts to mA and A correctly');

console.log('ALL SIMULATION TESTS PASSED SUCCESSFULLY! 🎉');
