import { CircuitInput, SimulationResult, FaultType } from '@/types';

export const VOLTAGE_MIN = 0;
export const VOLTAGE_MAX = 30;
export const RESISTANCE_MIN = 1;
export const RESISTANCE_MAX = 1000;

export function validateInput(input: CircuitInput): { valid: boolean; error?: string } {
  if (typeof input.voltage !== 'number' || !Number.isFinite(input.voltage)) {
    return { valid: false, error: 'Voltage must be a finite number.' };
  }
  if (typeof input.resistance !== 'number' || !Number.isFinite(input.resistance)) {
    return { valid: false, error: 'Resistance must be a finite number.' };
  }
  if (input.voltage < VOLTAGE_MIN || input.voltage > VOLTAGE_MAX) {
    return { valid: false, error: `Voltage must be between ${VOLTAGE_MIN}V and ${VOLTAGE_MAX}V.` };
  }
  if (input.resistance < RESISTANCE_MIN || input.resistance > RESISTANCE_MAX) {
    return { valid: false, error: `Resistance must be between ${RESISTANCE_MIN}Ω and ${RESISTANCE_MAX}Ω.` };
  }
  return { valid: true };
}

export function runSimulation(input: CircuitInput): SimulationResult {
  const validation = validateInput(input);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid simulation inputs');
  }

  const { voltage, resistance, faultType } = input;
  
  // Theoretical current according to Ohm's Law: I = V / R
  const theoreticalCurrent = voltage / resistance;
  
  let circuitCurrent = theoreticalCurrent;
  let measuredCurrent = theoreticalCurrent;
  let isCircuitClosed = true;
  let faultExplanation: string | undefined = undefined;

  switch (faultType) {
    case 'OPEN_CIRCUIT':
      // Circuit is physically broken
      circuitCurrent = 0;
      measuredCurrent = 0;
      isCircuitClosed = false;
      faultExplanation = 'Open Circuit Fault: Circuit loop is disconnected. Physical current drops to 0.00 A.';
      break;

    case 'METER_FAULT':
      // Physical current is normal, but ammeter internal multiplier is scaled up by 2.5x
      circuitCurrent = theoreticalCurrent;
      measuredCurrent = Number((theoreticalCurrent * 2.5).toFixed(4));
      isCircuitClosed = true;
      faultExplanation = 'Meter Calibration Fault: Instrument gain offset by 250%. Ammeter reads higher than physical current in circuit.';
      break;

    case 'NORMAL':
    default:
      // Normal operation: slight precision rounding (4 decimals)
      circuitCurrent = theoreticalCurrent;
      measuredCurrent = Number(theoreticalCurrent.toFixed(4));
      isCircuitClosed = true;
      break;
  }

  return {
    voltage: Number(voltage.toFixed(2)),
    resistance: Number(resistance.toFixed(2)),
    theoreticalCurrent: Number(theoreticalCurrent.toFixed(4)),
    measuredCurrent,
    circuitCurrent: Number(circuitCurrent.toFixed(4)),
    isCircuitClosed,
    faultType,
    faultExplanation,
    timestamp: Date.now(),
  };
}

/**
 * Utility to format current into appropriate unit string (A or mA)
 */
export function formatCurrent(amperes: number): string {
  if (Math.abs(amperes) < 0.001 && amperes !== 0) {
    return `${(amperes * 1000).toFixed(2)} mA`;
  }
  if (Math.abs(amperes) < 1) {
    return `${(amperes * 1000).toFixed(1)} mA (${amperes.toFixed(3)} A)`;
  }
  return `${amperes.toFixed(2)} A`;
}

/**
 * Resistor color code finder for visual SVG diagram
 */
export interface ColorBand {
  color: string;
  hex: string;
}

export function getResistorColorBands(ohms: number): ColorBand[] {
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
    { color: 'Gold', hex: '#d97706' } // 5% tolerance standard
  ];
}
