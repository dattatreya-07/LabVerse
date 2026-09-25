import { ExperimentDefinition } from '@/types';
import { simulatePhotoelectric } from '@/lib/simulation/quantum/photoelectric-sim';

export const photoelectricExperiment: ExperimentDefinition = {
  id: 'photoelectric-effect',
  title: 'Photoelectric Effect & Planck Constant',
  tagline: 'Observe photon quantization and measure Planck\'s constant h.',
  domain: 'QUANTUM',
  difficulty: 'INTERMEDIATE',
  availability: 'AVAILABLE',
  estimatedMinutes: 25,
  coverIcon: 'Sun',
  summary: 'Irradiate metal photocathodes with monochromatic photon beams. Measure the kinetic energy of emitted photoelectrons via retarding stopping potential V_stop to determine Planck\'s constant h and metal work functions.',
  
  theory: {
    corePrinciple: 'Light consists of discrete energy quanta (photons) with energy E = h*f. Photoelectron emission occurs instantaneously when photon energy exceeds the material work function Phi.',
    equations: [
      'E = h \\nu = \\frac{hc}{\\lambda}',
      'K_{\\max} = h\\nu - \\Phi = e V_0',
      'V_0 = \\left(\\frac{h}{e}\\right)\\nu - \\frac{\\Phi}{e}'
    ],
    derivation: 'Einstein\'s Photoelectric Equation: Incoming photon energy divides between freeing the electron (Work Function Phi) and supplying maximum kinetic energy (K_max = e*V_0). Plotting stopping potential V_0 versus frequency nu yields a straight line with slope h/e.',
    variableDescriptions: {
      'E': 'Photon energy (electron-volts, eV)',
      'h': 'Planck\'s constant (6.626 x 10^-34 J·s or 4.1357 x 10^-15 eV·s)',
      'lambda': 'Wavelength of incident light (nanometers, nm)',
      'Phi': 'Work function of target cathode metal (eV)',
      'V_0': 'Stopping potential required to halt photocurrent (Volts, V)'
    }
  },

  learningObjectives: [
    { id: 'obj-pe1', description: 'Confirm that electron kinetic energy depends on photon frequency/wavelength, not beam intensity.', bloomLevel: 'UNDERSTAND' },
    { id: 'obj-pe2', description: 'Calculate stopping potential V_0 for varied wavelengths across Potassium (Phi = 2.20 eV).', bloomLevel: 'APPLY' },
    { id: 'obj-pe3', description: 'Determine Planck\'s constant h from the slope of stopping potential vs light frequency.', bloomLevel: 'EVALUATE' }
  ],

  equipment: [
    {
      type: 'LIGHT_SOURCE',
      title: 'Monochromatic Laser Source',
      description: 'Tunable wavelength UV/Visible spectrum emitter (200 nm - 750 nm).',
      domain: 'QUANTUM',
      defaultProperties: { wavelength: 450, intensity: 100 },
      terminals: [],
      iconName: 'Sun'
    },
    {
      type: 'PHOTO_TUBE',
      title: 'Vacuum Phototube Cell',
      description: 'Quartz evacuated chamber with Potassium (K) cathode emitter and collector ring.',
      domain: 'QUANTUM',
      defaultProperties: { workFunction: 2.20 },
      terminals: [
        { id: 'anode', name: 'Anode Ring (+)', type: 'POSITIVE', position: { x: 55, y: 0 }, label: 'A' },
        { id: 'cathode', name: 'Cathode (-)', type: 'NEGATIVE', position: { x: -55, y: 0 }, label: 'K' }
      ],
      iconName: 'Zap'
    }
  ],

  parameters: [
    {
      id: 'wavelength',
      label: 'Incident Wavelength (λ)',
      symbol: 'λ',
      unit: 'nm',
      min: 200,
      max: 750,
      step: 10,
      defaultValue: 450,
      description: 'Wavelength of incident photon beam'
    },
    {
      id: 'stopping_voltage',
      label: 'Opposing Retarding Potential',
      symbol: 'V_rev',
      unit: 'V',
      min: 0.0,
      max: 5.0,
      step: 0.05,
      defaultValue: 0.0,
      description: 'Reverse bias voltage applied to stop photoelectrons'
    }
  ],

  workspace: {
    allowedEquipment: ['LIGHT_SOURCE', 'PHOTO_TUBE', 'AMMETER', 'DC_SUPPLY'],
    defaultPreset: {
      components: [
        {
          id: 'light-source-1',
          type: 'LIGHT_SOURCE',
          title: 'Monochromatic Laser Source',
          domain: 'QUANTUM',
          position: { x: 300, y: 220 },
          terminals: [],
          properties: { wavelength: 450, intensity: 100 },
          state: {}
        },
        {
          id: 'photo-tube-1',
          type: 'PHOTO_TUBE',
          title: 'Vacuum Phototube Cell',
          domain: 'QUANTUM',
          position: { x: 520, y: 220 },
          terminals: [
            { id: 'anode', name: 'Anode Ring (+)', type: 'POSITIVE', position: { x: 55, y: 0 }, label: 'A' },
            { id: 'cathode', name: 'Cathode (-)', type: 'NEGATIVE', position: { x: -55, y: 0 }, label: 'K' }
          ],
          properties: { workFunction: 2.20 },
          state: {}
        }
      ],
      connections: []
    },
    guidedSteps: [
      { stepNumber: 1, title: 'Select 400 nm Violet Light', instruction: 'Set wavelength to 400 nm (E = 3.10 eV).' },
      { stepNumber: 2, title: 'Observe Photocurrent', instruction: 'With Potassium (Phi = 2.2 eV), photoelectrons are emitted (K_max = 0.90 eV).' },
      { stepNumber: 3, title: 'Dial Stopping Potential', instruction: 'Increase retarding potential until photocurrent drops to 0 µA at V0 = 0.90 V.' }
    ]
  },

  challenges: [
    {
      id: 'ch-pe1',
      title: 'Zero Photocurrent Threshold',
      description: 'Find the stopping potential required to halt all photoelectrons for 350 nm UV light on Potassium (Phi = 2.2 eV).',
      targetMetric: 'stopping_pot_meas',
      targetValue: 1.35,
      tolerance: 0.05,
      unit: 'V',
      hint: 'E = 1240 / 350 = 3.54 eV. V_0 = 3.54 - 2.20 = 1.34 V.'
    }
  ],

  faults: [
    {
      id: 'FAULT_SURFACE_OXIDATION',
      title: 'Cathode Surface Oxidation (+0.5 eV Work Function)',
      description: 'Oxide layer increases the energy barrier required to extract electrons.',
      applicableComponentTypes: ['PHOTO_TUBE'],
      symptoms: ['Stopping potential is lower than expected for clean metal surface'],
      diagnosticHints: ['Clean metal surface in ultra-high vacuum chamber'],
      effect: 'PARAM_DEVIATION'
    }
  ],

  analysis: {
    xAxisLabel: 'Light Frequency (ν)',
    xAxisKey: 'frequency',
    xAxisUnit: 'x 10¹⁴ Hz',
    yAxisLabel: 'Stopping Potential (V₀)',
    yAxisKey: 'stopping_pot_meas',
    yAxisUnit: 'V',
    expectedSlopeFormula: 'Slope = h / e',
    theoreticalRelationshipDescription: 'The linear relationship between stopping potential V₀ and frequency ν has slope h/e = 4.136 x 10⁻¹⁵ V·s. Multiplying slope by elementary charge e directly yields Planck\'s constant.'
  },

  tutorContext: {
    experimentId: 'photoelectric-effect',
    experimentTitle: 'Quantum Photoelectric Laboratory',
    learningObjectives: ['Verify Einstein photoelectric equation', 'Measure stopping potential', 'Calculate Planck constant h'],
    governingEquations: ['E = h*f = hc/lambda', 'K_max = E - Phi = e*V0'],
    commonMistakes: ['Thinking increasing brightness/intensity increases electron kinetic energy (it only increases the number of emitted electrons).']
  },

  report: {
    title: 'Quantum Photoelectric Effect & Planck Constant Determination',
    governingFormulaLatex: "K_{\\max} = h\\nu - \\Phi = e V_0",
    procedureSummary: [
      'Irradiated Potassium photocathode with monochromatic wavelength spectrum (250 nm - 600 nm).',
      'Measured opposing stopping potential V₀ to halt photocurrent at each frequency.',
      'Plotted V₀ versus ν and calculated Planck\'s constant h from graph gradient.'
    ],
    expectedConclusionTemplate: 'The linear slope of stopping potential versus optical frequency yields Planck\'s constant h ≈ 6.63 x 10⁻³⁴ J·s, in full agreement with quantum mechanical photon theory.'
  },

  validateTopology: () => ({ isValid: true, canSimulate: true, message: 'Phototube optical chamber aligned and calibrated', errors: [], warnings: [] }),
  simulate: simulatePhotoelectric
};
