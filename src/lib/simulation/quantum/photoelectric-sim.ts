import { SimulationInput, SimulationResult, Measurement } from '@/types';

// Constants
const H_PLANCK = 6.62607015e-34; // J*s
const C_LIGHT = 299792458; // m/s
const E_CHARGE = 1.602176634e-19; // Coulombs
const EV_TO_JOULE = 1.602176634e-19;

export function simulatePhotoelectric(input: SimulationInput): SimulationResult {
  const { parameters, activeFaults } = input;

  const wavelengthNm = parameters['wavelength'] ?? 450; // nm (200 - 800nm)
  const workFunctionEv = parameters['work_function'] ?? 2.2; // eV (e.g. Potassium 2.2eV, Sodium 2.3eV, Zinc 4.3eV)
  const intensityMw = parameters['intensity'] ?? 50; // mW/cm^2
  const stoppingVoltageApplied = parameters['stopping_voltage'] ?? 0.0; // V

  const wavelengthM = wavelengthNm * 1e-9;
  const frequencyHz = C_LIGHT / wavelengthM;
  const photonEnergyJ = H_PLANCK * frequencyHz;
  const photonEnergyEv = photonEnergyJ / EV_TO_JOULE;

  // Max Kinetic Energy: K_max = h*nu - Phi
  let maxKineticEnergyEv = photonEnergyEv - workFunctionEv;
  const isEmission = maxKineticEnergyEv > 0;
  if (!isEmission) {
    maxKineticEnergyEv = 0;
  }

  // Stopping Potential V0 = K_max / e
  const theoreticalStoppingPotential = isEmission ? maxKineticEnergyEv : 0;

  // Photocurrent calculation with stopping potential threshold
  let photocurrentMicroAmps = 0;
  if (isEmission) {
    if (stoppingVoltageApplied <= theoreticalStoppingPotential) {
      // Saturation curve
      const factor = Math.max(0, 1 - Math.pow(stoppingVoltageApplied / (theoreticalStoppingPotential + 0.01), 2));
      photocurrentMicroAmps = (intensityMw * 0.4) * factor;
    }
  }

  if (activeFaults.includes('FAULT_PHOTO_SURFACE_OXIDATION')) {
    // Work function increases due to oxidation layer
    maxKineticEnergyEv = Math.max(0, maxKineticEnergyEv - 0.8);
    photocurrentMicroAmps *= 0.3;
  }

  const measurements: Measurement[] = [
    {
      id: 'photon_energy_meas',
      label: 'Incident Photon Energy',
      symbol: 'E_ph',
      theoreticalValue: Number(photonEnergyEv.toFixed(3)),
      simulatedValue: Number(photonEnergyEv.toFixed(3)),
      observedValue: Number(photonEnergyEv.toFixed(3)),
      unit: 'eV',
      precision: 3,
    },
    {
      id: 'stopping_pot_meas',
      label: 'Stopping Potential (V₀)',
      symbol: 'V₀',
      theoreticalValue: Number(theoreticalStoppingPotential.toFixed(3)),
      simulatedValue: Number(theoreticalStoppingPotential.toFixed(3)),
      observedValue: Number(theoreticalStoppingPotential.toFixed(3)),
      unit: 'V',
      precision: 3,
    },
    {
      id: 'photocurrent_meas',
      label: 'Photocurrent',
      symbol: 'I_ph',
      theoreticalValue: Number(photocurrentMicroAmps.toFixed(2)),
      simulatedValue: Number(photocurrentMicroAmps.toFixed(2)),
      observedValue: Number(photocurrentMicroAmps.toFixed(2)),
      unit: 'µA',
      precision: 2,
    },
  ];

  return {
    success: true,
    experimentId: input.experimentId,
    measurements,
    derivedValues: {
      photonEnergyEv: Number(photonEnergyEv.toFixed(3)),
      frequencyTeraHz: Number((frequencyHz * 1e-12).toFixed(2)),
      maxKineticEnergyEv: Number(maxKineticEnergyEv.toFixed(3)),
      stoppingPotential: Number(theoreticalStoppingPotential.toFixed(3)),
      photocurrent: Number(photocurrentMicroAmps.toFixed(2)),
    },
    visualState: {
      isOperating: photocurrentMicroAmps > 0,
      electronVelocity: Math.min(5, maxKineticEnergyEv * 1.5),
    },
    topology: {
      isValid: true,
      canSimulate: true,
      message: 'Photoelectric Apparatus Aligned',
      errors: [],
      warnings: isEmission ? [] : [{
        code: 'BELOW_THRESHOLD',
        message: 'Incident photon energy is below work function. No photoelectrons emitted.',
      }],
    },
    warnings: [],
    errors: [],
    timestamp: new Date().toISOString(),
  };
}
