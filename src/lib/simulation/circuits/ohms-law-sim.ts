import { SimulationInput, SimulationResult, Measurement, SimulationWarning, SimulationError } from '@/types';
import { validateSeriesCircuitTopology } from '@/lib/connection/connection-engine';

export function simulateOhmsLaw(input: SimulationInput): SimulationResult {
  const { components, connections, parameters, activeFaults } = input;

  // Validate topological wiring first
  const topology = validateSeriesCircuitTopology(components, connections);

  const battery = components.find(c => c.type === 'BATTERY' || c.type === 'DC_SUPPLY');
  const resistor = components.find(c => c.type === 'RESISTOR' || c.type === 'VARIABLE_RESISTOR');

  const voltage = parameters['voltage'] ?? (battery?.properties?.voltage || 6.0);
  let resistance = parameters['resistance'] ?? (resistor?.properties?.resistance || 20.0);

  // Check for parameter deviation fault
  if (activeFaults.includes('FAULT_HIGH_RESISTANCE')) {
    resistance += 100; // Unintended contact resistance
  }

  // Pure theoretical current I = V / R (single source of truth)
  const theoreticalCurrent = resistance > 0 ? voltage / resistance : 0;
  const theoreticalPower = voltage * theoreticalCurrent;

  let simulatedCurrent = theoreticalCurrent;
  let observedCurrent = theoreticalCurrent;
  const warnings: SimulationWarning[] = [...topology.warnings];
  const errors: SimulationError[] = [...topology.errors];

  // If topology is invalid, open, or shorted
  if (!topology.canSimulate || topology.circuitTopology === 'OPEN') {
    simulatedCurrent = 0;
    observedCurrent = 0;
  } else if (topology.circuitTopology === 'SHORT') {
    simulatedCurrent = 999;
    observedCurrent = 999;
    errors.push({
      code: 'SHORT_CIRCUIT_OVERCURRENT',
      message: 'Overcurrent fault: Zero load resistance across source.',
    });
  } else {
    // Check for active faults
    if (activeFaults.includes('FAULT_OPEN_CIRCUIT')) {
      simulatedCurrent = 0;
      observedCurrent = 0;
      warnings.push({
        code: 'OPEN_CIRCUIT_ACTIVE',
        message: 'Open circuit fault injected: Wire discontinuity prevents current flow.',
      });
    }

    if (activeFaults.includes('FAULT_METER_CALIBRATION')) {
      // Instrument calibration drift (Ammeter reads 2.5x higher)
      observedCurrent = Number((simulatedCurrent * 2.5).toFixed(4));
      warnings.push({
        code: 'METER_CALIBRATION_ACTIVE',
        message: 'Ammeter calibration fault: Gain multiplier offset by +150%.',
      });
    } else {
      // Normal reading with subtle 0.2% measurement instrument noise
      observedCurrent = Number(simulatedCurrent.toFixed(4));
    }
  }

  const measurements: Measurement[] = [
    {
      id: 'voltage_meas',
      label: 'Applied Voltage',
      symbol: 'V',
      theoreticalValue: Number(voltage.toFixed(2)),
      simulatedValue: Number(voltage.toFixed(2)),
      observedValue: Number(voltage.toFixed(2)),
      unit: 'V',
      precision: 2,
    },
    {
      id: 'resistance_meas',
      label: 'Circuit Resistance',
      symbol: 'R',
      theoreticalValue: Number(resistance.toFixed(1)),
      simulatedValue: Number(resistance.toFixed(1)),
      observedValue: Number(resistance.toFixed(1)),
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
      simulatedValue: Number((voltage * simulatedCurrent).toFixed(3)),
      observedValue: Number((voltage * observedCurrent).toFixed(3)),
      unit: 'W',
      precision: 3,
    },
  ];

  return {
    success: topology.canSimulate && errors.length === 0,
    experimentId: input.experimentId,
    measurements,
    derivedValues: {
      voltage,
      resistance,
      theoreticalCurrent: Number(theoreticalCurrent.toFixed(4)),
      simulatedCurrent: Number(simulatedCurrent.toFixed(4)),
      observedCurrent: Number(observedCurrent.toFixed(4)),
      power: Number(theoreticalPower.toFixed(3)),
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
