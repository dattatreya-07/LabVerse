import { ExperimentDefinition } from '@/types';

export const antennaRadiationExperiment: ExperimentDefinition = {
  id: 'antenna-radiation',
  title: '3D Antenna Radiation Patterns & Wave Propagation',
  tagline: 'Visualize 3D electromagnetic wave expansion, radiation pattern lobes, and RF signal strength attenuation in real time.',
  domain: 'ECE',
  difficulty: 'INTERMEDIATE',
  availability: 'AVAILABLE',
  estimatedMinutes: 20,
  coverIcon: 'Radio',
  summary: 'Explore real-time 3D electromagnetic wave propagation from central transmitter towers. Compare Omni-directional Dipole donut patterns with Directional Satellite dishes and Yagi-Uda beam lobes, adjusting RF frequency, transmit power, and field probe positions.',
  theory: {
    corePrinciple: 'Electromagnetic radiation travels outward from accelerating electric charges as transverse E and H waves. The 3D radiation intensity pattern U(θ,φ) dictates how transmit power is focused directional vs isotropic.',
    equations: [
      'E(r) = \\frac{\\sqrt{30 \\cdot P_t \\cdot G_t}}{r}',
      'S(r) = \\frac{P_t \\cdot G_t}{4 \\pi r^2} = \\frac{|E|^2}{\\eta_0}',
      '\\text{FSPL (dB)} = 20 \\log_{10}(r) + 20 \\log_{10}(f_{\\text{MHz}}) - 27.55',
      '\\lambda = \\frac{c}{f}'
    ],
    derivation: 'Derived from Maxwell equations for oscillating dipole and aperture antennas, where far-field radiation zone begins at r > 2D^2 / lambda.',
    variableDescriptions: {
      'P_t': 'Transmitter Power in Watts (W)',
      'G_t': 'Antenna Gain multiplier over isotropic radiator (dBi)',
      'E(r)': 'Peak Electric Field Strength at distance r (V/m)',
      'S(r)': 'Poynting Vector Power Density (W/m²), eta_0 = 377 Ohm',
      'FSPL': 'Free Space Path Loss in decibels (dB)',
      'lambda': 'Wavelength in meters (m), c = 3.0e8 m/s'
    }
  },
  learningObjectives: [
    {
      id: 'obj-ant-1',
      description: 'Differentiate between Omni-Directional (Dipole torus) and Directional (Parabolic Dish / Yagi beam) radiation patterns in 3D space.',
      bloomLevel: 'UNDERSTAND'
    },
    {
      id: 'obj-ant-2',
      description: 'Observe the inverse-square law attenuation of EM wave amplitude and Poynting power density over radial distance.',
      bloomLevel: 'APPLY'
    },
    {
      id: 'obj-ant-3',
      description: 'Calculate Free Space Path Loss (FSPL) and Electric Field Strength E(r) as a function of carrier frequency and transmit power.',
      bloomLevel: 'ANALYZE'
    }
  ],
  equipment: [
    {
      type: 'ANTENNA_TOWER',
      title: 'RF Transmitter Tower',
      description: 'Central lattice antenna tower with adjustable feed radiator elements.',
      domain: 'ECE',
      defaultProperties: { frequencyGhz: 1.5, powerWatts: 10, antennaType: 0 },
      terminals: [
        { id: 'rf_in', name: 'RF Feed Input', type: 'INPUT', position: { x: 0, y: 0 } }
      ]
    },
    {
      type: 'RADIATION_PROBE',
      title: '3D E-Field Receiver Probe',
      description: 'High-precision RF field strength meter measuring peak E-field (V/m) and power density.',
      domain: 'ECE',
      defaultProperties: { distanceMeters: 5.0 },
      terminals: [
        { id: 'rf_out', name: 'RF Output Signal', type: 'OUTPUT', position: { x: 0, y: 0 } }
      ]
    },
    {
      type: 'SIGNAL_GENERATOR',
      title: 'RF Signal Synthesizer',
      description: 'Generates high-frequency sinusoidal AC carrier voltage signals.',
      domain: 'ECE',
      defaultProperties: { carrierFreqGhz: 1.5, powerDbm: 30 },
      terminals: [
        { id: 'gen_out', name: 'RF Out', type: 'OUTPUT', position: { x: 0, y: 0 } }
      ]
    }
  ],
  parameters: [
    {
      id: 'frequency',
      label: 'Carrier Frequency (f)',
      symbol: 'f',
      unit: 'GHz',
      min: 0.5,
      max: 5.0,
      step: 0.1,
      defaultValue: 1.5,
      description: 'RF carrier wave frequency altering wavelength and propagation attenuation'
    },
    {
      id: 'power',
      label: 'Transmit Power (Pt)',
      symbol: 'Pt',
      unit: 'W',
      min: 0.5,
      max: 5.0,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Transmitter RF power scaling signal intensity and radiation lobe envelope'
    },
    {
      id: 'antennaType',
      label: 'Antenna Topology',
      symbol: 'Mode',
      unit: '',
      min: 0,
      max: 2,
      step: 1,
      defaultValue: 0,
      description: '0: Omni Dipole (Donut), 1: Directional Dish (Beam Lobe), 2: Yagi-Uda Array'
    },
    {
      id: 'probeDistance',
      label: 'Probe Distance (r)',
      symbol: 'r',
      unit: 'm',
      min: 1.0,
      max: 20.0,
      step: 0.5,
      defaultValue: 6.0,
      description: 'Radial distance of the interactive 3D measurement probe from antenna center'
    }
  ],
  workspace: {
    allowedEquipment: ['ANTENNA_TOWER', 'RADIATION_PROBE', 'SIGNAL_GENERATOR'],
    defaultPreset: {
      components: [
        {
          id: 'tower-1',
          type: 'ANTENNA_TOWER',
          title: 'Central Transmitter Tower',
          domain: 'ECE',
          position: { x: 300, y: 220 },
          terminals: [{ id: 'rf_in', name: 'RF Feed Input', type: 'INPUT', position: { x: 0, y: 0 } }],
          properties: { frequencyGhz: 1.5, powerWatts: 1.0, antennaType: 0 },
          state: { isPowered: true }
        },
        {
          id: 'probe-1',
          type: 'RADIATION_PROBE',
          title: 'Field Strength Sensor',
          domain: 'ECE',
          position: { x: 520, y: 220 },
          terminals: [{ id: 'rf_out', name: 'RF Sensor Output', type: 'OUTPUT', position: { x: 0, y: 0 } }],
          properties: { distanceMeters: 6.0 },
          state: { isPowered: true }
        }
      ],
      connections: []
    },
    guidedSteps: [
      {
        stepNumber: 1,
        title: 'Observe Omni-Directional Torus Pattern',
        instruction: 'Select Omni Dipole mode (Antenna Type = 0). Observe the 3D donut pattern and expanding concentric EM waves around the transmitter tower.',
        expectedValidation: 'Antenna Type is set to 0'
      },
      {
        stepNumber: 2,
        title: 'Switch to Directional Dish',
        instruction: 'Change Antenna Topology slider to 1 (Directional Satellite Dish). Notice how RF power is concentrated into a highly directional main lobe beam.',
        expectedValidation: 'Antenna Type is set to 1'
      },
      {
        stepNumber: 3,
        title: 'Analyze Distance Attenuation',
        instruction: 'Increase carrier frequency to 3.0 GHz and drag Probe Distance to 15 m. Observe the exponential decrease in E-Field (V/m) and increase in Path Loss (dB).',
        expectedValidation: 'Probe distance set > 10m'
      }
    ]
  },
  challenges: [
    {
      id: 'ch-ant-1',
      title: 'Target E-Field Calibration',
      description: 'Adjust Transmit Power and Frequency to achieve a field strength of exactly 5.0 V/m at a probe distance of 4.0 meters in Omni-Dipole mode.',
      targetMetric: 'Peak E-Field',
      targetValue: 5.0,
      tolerance: 0.1,
      unit: 'V/m',
      hint: 'Formula: E = sqrt(30 * Pt * 1.64) / r. Rearrange for Pt given r = 4m and E = 5 V/m.'
    }
  ],
  faults: [
    {
      id: 'fault-impedance-mismatch',
      title: 'Feeder Cable Impedance Mismatch (SWR High)',
      description: 'Impedance discontinuity causes 50% RF power reflection back to generator, reducing transmitted wave amplitude.',
      applicableComponentTypes: ['ANTENNA_TOWER'],
      symptoms: ['Radiated wave amplitude reduced by half', 'Reflected wave standing wave ratio (SWR > 3.0)'],
      diagnosticHints: ['Check VSWR meter or inspect RF feeder matching network.'],
      effect: 'PARAM_DEVIATION',
      parameterModifier: { multiplier: 0.5 }
    },
    {
      id: 'fault-ground-plane-corrosion',
      title: 'Ground Plane Mesh Corrosion',
      description: 'Corroded ground grid increases ground resistance, distorting the lower radiation pattern lobe.',
      applicableComponentTypes: ['ANTENNA_TOWER'],
      symptoms: ['Asymmetrical downward radiation pattern distortion', 'Increased ground return loss'],
      diagnosticHints: ['Visually inspect radial ground wire mesh connections.'],
      effect: 'PARAM_DEVIATION',
      parameterModifier: { multiplier: 0.75 }
    }
  ],
  analysis: {
    xAxisLabel: 'Radial Distance r',
    xAxisKey: 'distance',
    xAxisUnit: 'm',
    yAxisLabel: 'Electric Field Strength E',
    yAxisKey: 'eField',
    yAxisUnit: 'V/m',
    expectedSlopeFormula: 'E \\propto 1 / r',
    theoreticalRelationshipDescription: 'Inverse radial distance attenuation E(r) = sqrt(30 * Pt * G) / r according to Poynting theorem.'
  },
  report: {
    title: '3D Antenna Radiation & Wave Propagation Experiment Report',
    governingFormulaLatex: "E(r) = \\frac{\\sqrt{30 \\cdot P_t \\cdot G_t}}{r}, \\quad S(r) = \\frac{|E|^2}{377 \\,\\Omega}",
    procedureSummary: [
      'Configured RF signal frequency and transmit power levels.',
      'Selected antenna topologies (Omni-Directional Dipole, Directional Parabolic Dish, Yagi-Uda Array).',
      'Measured 3D field intensity E(r) and Poynting power density at varying radial probe distances.',
      'Calculated Free Space Path Loss (FSPL) across carrier frequency bands.'
    ],
    expectedConclusionTemplate: 'The experiment verified that Omni Dipole produces toroidal radiation, whereas directional dishes focus RF energy into narrow main lobes with significantly higher peak E-field strengths obeying 1/r distance decay.'
  },
  tutorContext: {
    experimentId: 'antenna-radiation',
    experimentTitle: '3D Antenna Radiation Patterns & Wave Propagation',
    learningObjectives: [
      'Understand radiation patterns (Torus vs Directional Beam)',
      'Calculate E-Field strength and Poynting power density',
      'Demonstrate Free Space Path Loss (FSPL)'
    ],
    governingEquations: ['E = sqrt(30 * Pt * G) / r', 'S = Pt * G / (4 * pi * r^2)', 'FSPL = 20*log10(r) + 20*log10(f_MHz) - 27.55'],
    commonMistakes: [
      'Confusing magnetic field H-plane with electric field E-plane orientation.',
      'Expecting wave amplitude to decay exponentially rather than 1/r in far-field vacuum.'
    ]
  },
  validateTopology: () => {
    return {
      isValid: true,
      canSimulate: true,
      message: '3D RF Field Simulator Ready and Active',
      errors: [],
      warnings: []
    };
  },
  simulate: (input) => {
    const freq = input.parameters['frequency'] ?? 1.5;
    const power = input.parameters['power'] ?? 1.0;
    const typeIdx = Math.round(input.parameters['antennaType'] ?? 0);
    const distance = input.parameters['probeDistance'] ?? 6.0;

    // Check fault modifier
    let powerMult = 1.0;
    if (input.activeFaults.includes('fault-impedance-mismatch')) powerMult *= 0.5;
    if (input.activeFaults.includes('fault-ground-plane-corrosion')) powerMult *= 0.75;

    const effectivePower = power * powerMult;

    // Gains: 0=Dipole (1.64 / 2.15 dBi), 1=Dish (28.2 / 14.5 dBi), 2=Yagi (10.5 / 10.2 dBi)
    const gains = [1.64, 28.2, 10.5];
    const gainDbi = [2.15, 14.5, 10.2];
    const gain = gains[typeIdx] || 1.64;

    // Wavelength (m)
    const wavelength = 0.3 / freq; // c / (freq * 10^9) = 0.3 / freq

    // E-field (V/m) = sqrt(30 * P * G) / r
    const eField = Math.sqrt(30 * effectivePower * gain) / Math.max(0.5, distance);

    // Power density S (W/m^2) = E^2 / 377
    const powerDensity = (eField * eField) / 377.0;

    // Free Space Path Loss (dB)
    const freqMhz = freq * 1000;
    const fspl = 20 * Math.log10(Math.max(0.1, distance)) + 20 * Math.log10(freqMhz) - 27.55;

    // Beamwidth FWHM (degrees)
    const hpbw = [78, 18, 35][typeIdx] || 78;

    return {
      success: true,
      experimentId: input.experimentId,
      measurements: [
        {
          id: 'e_field',
          label: 'Peak Electric Field (E)',
          symbol: 'E',
          theoreticalValue: Number(eField.toFixed(3)),
          simulatedValue: Number(eField.toFixed(3)),
          observedValue: Number(eField.toFixed(3)),
          unit: 'V/m'
        },
        {
          id: 'power_density',
          label: 'Poynting Power Density (S)',
          symbol: 'S',
          theoreticalValue: Number((powerDensity * 1000).toFixed(3)), // in mW/m^2
          simulatedValue: Number((powerDensity * 1000).toFixed(3)),
          observedValue: Number((powerDensity * 1000).toFixed(3)),
          unit: 'mW/m²'
        },
        {
          id: 'path_loss',
          label: 'Path Loss (FSPL)',
          symbol: 'FSPL',
          theoreticalValue: Number(fspl.toFixed(1)),
          simulatedValue: Number(fspl.toFixed(1)),
          observedValue: Number(fspl.toFixed(1)),
          unit: 'dB'
        },
        {
          id: 'wavelength',
          label: 'EM Wavelength (λ)',
          symbol: 'λ',
          theoreticalValue: Number((wavelength * 100).toFixed(1)),
          simulatedValue: Number((wavelength * 100).toFixed(1)),
          observedValue: Number((wavelength * 100).toFixed(1)),
          unit: 'cm'
        }
      ],
      derivedValues: {
        eField,
        powerDensity,
        fspl,
        wavelength,
        antennaGainDbi: gainDbi[typeIdx],
        hpbw
      },
      visualState: {
        isOperating: true,
        electronVelocity: freq * 2.0
      },
      topology: {
        isValid: true,
        canSimulate: true,
        message: '3D Antenna Array Active & Radiating',
        errors: [],
        warnings: input.activeFaults.length > 0 ? [{ code: 'RF_FAULT', message: 'RF Feeder/Ground fault active' }] : []
      },
      warnings: [],
      errors: [],
      timestamp: new Date().toISOString()
    };
  }
};
