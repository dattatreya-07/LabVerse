import { SimulationInput, SimulationResult, Measurement } from '@/types';

export function simulatePendulum(input: SimulationInput): SimulationResult {
  const { parameters, activeFaults } = input;

  const length = parameters['length'] ?? 1.0; // meters (0.1 - 5.0m)
  const mass = parameters['mass'] ?? 0.5; // kg
  const gravity = parameters['gravity'] ?? 9.81; // m/s^2 (Earth=9.81, Moon=1.62, Mars=3.71, Jupiter=24.79)
  const angleDeg = parameters['initial_angle'] ?? 15.0; // degrees

  // Theoretical small-angle period T = 2*pi*sqrt(L/g)
  let theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / gravity);
  
  // High amplitude correction (Borda / Bernouilli series approximation)
  const angleRad = (angleDeg * Math.PI) / 180;
  const amplitudeCorrection = 1 + (1 / 16) * Math.pow(Math.sin(angleRad / 2), 2);
  const simulatedPeriod = theoreticalPeriod * amplitudeCorrection;

  let observedPeriod = simulatedPeriod;
  if (activeFaults.includes('FAULT_TIMER_CALIBRATION')) {
    observedPeriod *= 1.25; // Timer running slow
  }

  const frequency = 1 / observedPeriod;

  const measurements: Measurement[] = [
    {
      id: 'period_meas',
      label: 'Oscillation Period',
      symbol: 'T',
      theoreticalValue: Number(theoreticalPeriod.toFixed(3)),
      simulatedValue: Number(simulatedPeriod.toFixed(3)),
      observedValue: Number(observedPeriod.toFixed(3)),
      unit: 's',
      precision: 3,
    },
    {
      id: 'freq_meas',
      label: 'Frequency',
      symbol: 'f',
      theoreticalValue: Number((1 / theoreticalPeriod).toFixed(3)),
      simulatedValue: Number((1 / simulatedPeriod).toFixed(3)),
      observedValue: Number(frequency.toFixed(3)),
      unit: 'Hz',
      precision: 3,
    },
    {
      id: 'gravity_meas',
      label: 'Gravitational Acceleration',
      symbol: 'g',
      theoreticalValue: gravity,
      simulatedValue: gravity,
      observedValue: gravity,
      unit: 'm/s²',
      precision: 2,
    },
  ];

  return {
    success: true,
    experimentId: input.experimentId,
    measurements,
    derivedValues: {
      period: Number(observedPeriod.toFixed(3)),
      frequency: Number(frequency.toFixed(3)),
      length,
      gravity,
    },
    visualState: {
      isOperating: true,
      electronVelocity: frequency * 2,
    },
    topology: {
      isValid: true,
      canSimulate: true,
      message: 'Pendulum Apparatus Ready',
      errors: [],
      warnings: [],
    },
    warnings: [],
    errors: [],
    timestamp: new Date().toISOString(),
  };
}
