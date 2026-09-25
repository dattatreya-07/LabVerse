import { SimulationInput, SimulationResult } from '@/types';
import { getExperiment } from '@/lib/experiments/registry';

export interface VerificationReport {
  isValid: boolean;
  tamperedFields: string[];
  canonicalResult: SimulationResult;
  message: string;
}

/**
 * Server-side verification of simulation results.
 * Re-runs the physics/MNA numerical solver on raw parameters and apparatus topology
 * to prevent client tampering with stored session observations or certified PDF reports.
 */
export function verifySimulationResult(
  input: SimulationInput,
  clientClaimedResult?: SimulationResult | null
): VerificationReport {
  const exp = getExperiment(input.experimentId);
  const canonicalResult = exp.simulate(input);

  if (!clientClaimedResult) {
    return {
      isValid: true,
      tamperedFields: [],
      canonicalResult,
      message: 'Canonical simulation computed successfully server-side.',
    };
  }

  const tamperedFields: string[] = [];

  // Compare each measurement
  canonicalResult.measurements.forEach(m => {
    const claimedMeas = clientClaimedResult.measurements?.find(cm => cm.id === m.id);
    if (!claimedMeas) {
      tamperedFields.push(`missing_measurement:${m.id}`);
      return;
    }

    const diffTheo = Math.abs(m.theoreticalValue - claimedMeas.theoreticalValue);
    const diffObs = Math.abs(m.observedValue - claimedMeas.observedValue);

    if (diffTheo > 0.001) {
      tamperedFields.push(`theoreticalValue:${m.id}`);
    }
    if (diffObs > 0.001) {
      tamperedFields.push(`observedValue:${m.id}`);
    }
  });

  const isValid = tamperedFields.length === 0;

  return {
    isValid,
    tamperedFields,
    canonicalResult,
    message: isValid
      ? 'Client simulation result verified against server-side MNA physics engine.'
      : `Discrepancy detected in simulation fields: ${tamperedFields.join(', ')}`,
  };
}
