import { SimulationInput, SimulationResult, Measurement, SimulationWarning, SimulationError } from '@/types';
import { validateSeriesCircuitTopology } from '@/lib/connection/connection-engine';
import { solveDCCircuit } from './dc-solver';

export function simulateOhmsLaw(input: SimulationInput): SimulationResult {
  const { components, connections, parameters, activeFaults } = input;

  // 1. Validate topological wiring
  const topology = validateSeriesCircuitTopology(components, connections);

  const battery = components.find(c => c.type === 'BATTERY' || c.type === 'DC_SUPPLY');
  const resistor = components.find(c => c.type === 'RESISTOR' || c.type === 'VARIABLE_RESISTOR');

  const voltage = parameters['voltage'] ?? (typeof battery?.properties?.voltage === 'number' ? battery.properties.voltage : 6.0);
  let resistance = parameters['resistance'] ?? (typeof resistor?.properties?.resistance === 'number' ? resistor.properties.resistance : 20.0);

  if (activeFaults.includes('FAULT_HIGH_RESISTANCE')) {
    resistance += 100.0;
  }

  // Single source of truth theoretical reference
  const theoreticalCurrent = resistance > 0 ? voltage / resistance : 0;
  const theoreticalPower = voltage * theoreticalCurrent;

  // 2. Execute Modified Nodal Analysis (MNA) Numerical Solver
  const solverResult = solveDCCircuit({
    nodes: components,
    wires: connections,
    parameters,
    activeFaults,
  });

  const warnings: SimulationWarning[] = [...topology.warnings, ...solverResult.warnings];
  const errors: SimulationError[] = [...topology.errors, ...solverResult.errors];

  let simulatedCurrent = solverResult.sourceCurrent;
  let observedCurrent = solverResult.sourceCurrent;

  if (solverResult.meterReadings.length > 0) {
    const ammeterReading = solverResult.meterReadings.find(m => m.meterType === 'AMMETER');
    if (ammeterReading) {
      simulatedCurrent = ammeterReading.simulatedValue;
      observedCurrent = ammeterReading.observedValue;
    }
  }

  // Fault state overrides
  if (!topology.canSimulate || topology.circuitTopology === 'OPEN' || solverResult.status === 'OPEN_CIRCUIT') {
    simulatedCurrent = 0;
    observedCurrent = 0;
  } else if (topology.circuitTopology === 'SHORT') {
    simulatedCurrent = 999;
    observedCurrent = 999;
  }

  const measurements: Measurement[] = [
    {
      id: 'voltage_meas',
      label: 'Applied Voltage',
      symbol: 'V',
      theoreticalValue: Number(voltage.toFixed(2)),
      simulatedValue: Number(solverResult.sourceVoltage.toFixed(2)),
      observedValue: Number(solverResult.sourceVoltage.toFixed(2)),
      unit: 'V',
      precision: 2,
    },
    {
      id: 'resistance_meas',
      label: 'Equivalent Resistance',
      symbol: 'Req',
      theoreticalValue: Number(resistance.toFixed(1)),
      simulatedValue: Number(solverResult.equivalentResistance.toFixed(1)),
      observedValue: Number(solverResult.equivalentResistance.toFixed(1)),
      unit: 'Ω',
      precision: 1,
    },
    {
      id: 'current_meas',
      label: 'Circuit Current',
      symbol: 'I',
      theoreticalValue: Number(theoreticalCurrent.toFixed(4)),
      simulatedValue: Number(simulatedCurrent.toFixed(4)),
      observedValue: Number(observedCurrent.toFixed(4)),
      unit: 'A',
      precision: 4,
    },
    {
      id: 'power_meas',
      label: 'Power Dissipation',
      symbol: 'P',
      theoreticalValue: Number(theoreticalPower.toFixed(3)),
      simulatedValue: Number(solverResult.totalPower.toFixed(3)),
      observedValue: Number((voltage * observedCurrent).toFixed(3)),
      unit: 'W',
      precision: 3,
    },
  ];

  return {
    success: topology.canSimulate && solverResult.success && errors.length === 0,
    experimentId: input.experimentId,
    measurements,
    derivedValues: {
      voltage: Number(solverResult.sourceVoltage.toFixed(2)),
      resistance: Number(solverResult.equivalentResistance.toFixed(1)),
      theoreticalCurrent: Number(theoreticalCurrent.toFixed(4)),
      simulatedCurrent: Number(simulatedCurrent.toFixed(4)),
      observedCurrent: Number(observedCurrent.toFixed(4)),
      power: Number(solverResult.totalPower.toFixed(3)),
    },
    visualState: {
      isOperating: simulatedCurrent > 0,
      electronVelocity: simulatedCurrent > 0 ? Math.min(5, Math.max(0.8, simulatedCurrent * 3)) : 0,
      meterReadings: {
        ammeter: observedCurrent < 1 && observedCurrent > 0
          ? `${(observedCurrent * 1000).toFixed(1)} mA`
          : `${observedCurrent.toFixed(3)} A`,
        voltmeter: `${voltage.toFixed(2)} V`,
      },
    },
    topology,
    warnings,
    errors,
    timestamp: new Date().toISOString(),
  };
}
