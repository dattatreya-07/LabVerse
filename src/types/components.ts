export type DomainCategory = 'ELECTRONICS' | 'MECHANICS' | 'OPTICS' | 'QUANTUM' | 'NUCLEAR' | 'BIOLOGY' | 'CHEMISTRY';

export type ComponentType =
  // Electronics
  | 'BATTERY'
  | 'DC_SUPPLY'
  | 'RESISTOR'
  | 'VARIABLE_RESISTOR'
  | 'AMMETER'
  | 'VOLTMETER'
  | 'SWITCH'
  | 'BULB'
  | 'LED'
  | 'WIRE'
  | 'FUSE'
  // Mechanics
  | 'PENDULUM'
  | 'MASS_HANGER'
  | 'STOPWATCH'
  | 'RULER'
  // Optics / Quantum
  | 'LIGHT_SOURCE'
  | 'PHOTO_TUBE'
  | 'MONOCHROMATOR'
  | 'OPTICAL_BENCH'
  // Nuclear
  | 'ALPHA_EMITTER'
  | 'GOLD_FOIL'
  | 'SCATTERING_DETECTOR'
  // Biology / Chemistry
  | 'GEL_TRAY'
  | 'POWER_SUPPLY'
  | 'PIPETTE'
  | 'DNA_WELLS';

export interface Terminal {
  id: string;
  name: string;
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'INPUT' | 'OUTPUT' | 'OPTICAL_PORT' | 'SAMPLE_PORT';
  position: { x: number; y: number }; // Relative to component center (px)
  label?: string;
  acceptedTypes?: string[];
}

export interface LabComponent {
  id: string;
  type: ComponentType;
  title: string;
  domain: DomainCategory;
  position: {
    x: number;
    y: number;
  };
  rotation?: number; // In degrees: 0, 90, 180, 270
  terminals: Terminal[];
  properties: Record<string, any>;
  state: {
    isPowered?: boolean;
    isOpen?: boolean; // For switches
    isFaulted?: boolean;
    faultId?: string;
    displayValue?: string;
    valueNumber?: number;
    [key: string]: any;
  };
}

export interface WireConnection {
  id: string;
  fromComponentId: string;
  fromTerminalId: string;
  toComponentId: string;
  toTerminalId: string;
  color?: string;
  isConducting?: boolean;
  isBroken?: boolean;
}
