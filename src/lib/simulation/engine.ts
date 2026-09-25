import { SimulationInput, SimulationResult } from '@/types';
import { simulateOhmsLaw } from './circuits/ohms-law-sim';
import { simulatePendulum } from './mechanics/pendulum-sim';
import { simulatePhotoelectric } from './quantum/photoelectric-sim';

export function runExperimentSimulation(input: SimulationInput): SimulationResult {
  switch (input.experimentId) {
    case 'ohms-law':
      return simulateOhmsLaw(input);
    case 'gravity-pendulum':
      return simulatePendulum(input);
    case 'photoelectric-effect':
      return simulatePhotoelectric(input);
    default:
      return simulateOhmsLaw(input);
  }
}

// Keep legacy helper for quick backwards compatibility
export function formatCurrent(amperes: number): string {
  if (Math.abs(amperes) < 0.001 && amperes !== 0) {
    return `${(amperes * 1000).toFixed(2)} mA`;
  }
  if (Math.abs(amperes) < 1) {
    return `${(amperes * 1000).toFixed(1)} mA (${amperes.toFixed(3)} A)`;
  }
  return `${amperes.toFixed(2)} A`;
}

export function getResistorColorBands(ohms: number) {
  const colorMap: Record<number, { color: string; hex: string }> = {
    0: { color: 'Black', hex: '#1e293b' },
    1: { color: 'Brown', hex: '#78350f' },
    2: { color: 'Red', hex: '#dc2626' },
    3: { color: 'Orange', hex: '#ea580c' },
    4: { color: 'Yellow', hex: '#eab308' },
    5: { color: 'Green', hex: '#16a34a' },
    6: { color: 'Blue', hex: '#2563eb' },
    7: { color: 'Violet', hex: '#9333ea' },
    8: { color: 'Grey', hex: '#64748b' },
    9: { color: 'White', hex: '#f8fafc' },
  };

  const rounded = Math.round(ohms);
  const str = rounded.toString();
  const digit1 = parseInt(str[0]) || 1;
  const digit2 = str.length > 1 ? parseInt(str[1]) : 0;
  const multiplier = str.length - 2 >= 0 ? str.length - 2 : 0;

  return [
    colorMap[digit1] || colorMap[1],
    colorMap[digit2] || colorMap[0],
    colorMap[multiplier] || colorMap[0],
    { color: 'Gold', hex: '#d97706' },
  ];
}
