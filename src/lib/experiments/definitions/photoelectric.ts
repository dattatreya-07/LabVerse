import { ExperimentDefinition } from '@/types';
import { simulatePhotoelectric } from '@/lib/simulation/quantum/photoelectric-sim';

export const photoelectricExperiment: ExperimentDefinition = {
  id: 'photoelectric-effect',
  title: 'Photoelectric Effect & Planck Constant',
  tagline: 'Witness the quantum nature of light and calculate stopping potentials.',
  domain: 'QUANTUM',
  difficulty: 'INTERMEDIATE',
  availability: 'AVAILABLE',
  estimatedMinutes: 25,
  coverIcon: 'Sun',
  summary: 'Illuminate metallic cathode targets with monochromatic light, determine stopping potentials as a function of frequency, and measure Planck constant h and work function Phi.',
  
  theory: {
    corePrinciple: 'Einstein photoelectric equation states that light consists of discrete energy quanta (photons). A photon transferring its energy to an electron ejects it if photon energy exceeds metal work function.',
    equations: [
      'E_{photon} = h\\nu = \\frac{hc}{\\lambda}',
      'K_{max} = h\\nu - \\Phi',
      'e V_0 = K_{max} = h\\nu - \\Phi',
      'V_0 = \\left(\\frac{h}{e}\\right)\\nu - \\frac{\\Phi}{e}'
    ],
    derivation: 'Plotting stopping potential V0 vs frequency nu yields a straight line with slope h/e and y-intercept -Phi/e.',
    variableDescriptions: {
      'h': 'Planck Constant (6.626 x 10^-34 J*s)',
      'nu': 'Frequency of incident photon (Hz)',
      'lambda': 'Wavelength of light (nm)',
      'Phi': 'Work Function of cathode material (eV)',
      'V0': 'Stopping Potential required to halt photocurrent (V)'
    }
  },

  learningObjectives: [
    { id: 'obj-pe1', description: 'Observe that photoelectron kinetic energy depends on frequency, not intensity.', bloomLevel: 'UNDERSTAND' },
    { id: 'obj-pe2', description: 'Measure stopping potential V0 across different monochromatic wavelengths.', bloomLevel: 'APPLY' },
    { id: 'obj-pe3', description: 'Calculate Planck constant h from the slope of V0 vs frequency.', bloomLevel: 'ANALYZE' }
  ],

  equipment: [
    {
      type: 'LIGHT_SOURCE',
      title: 'Monochromatic Light Source',
      description: 'Tunable wavelength spectral lamp (200nm - 800nm).',
      domain: 'QUANTUM',
      defaultProperties: { wavelength: 450, intensity: 50 },
      terminals: [],
      iconName: 'Sun'
    },
    {
      type: 'PHOTO_TUBE',
      title: 'Vacuum Phototube Cell',
      description: 'Cathode emitter with anode collector in high vacuum glass enclosure.',
      domain: 'QUANTUM',
      defaultProperties: { workFunction: 2.2 },
      terminals: [],
      iconName: 'Radio'
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
    allowedEquipment: ['LIGHT_SOURCE', 'PHOTO_TUBE'],
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
      hint: 'E_ph = 1240 / 350 = 3.54 eV. V0 = 3.54 - 2.20 = 1.34 V.'
    }
  ],

  faults: [
    {
      id: 'FAULT_PHOTO_SURFACE_OXIDATION',
      title: 'Cathode Surface Oxidation (+0.8 eV)',
      description: 'Oxidation layer on the emitter raises effective work function and suppresses electron emission.',
      applicableComponentTypes: ['PHOTO_TUBE'],
      symptoms: ['Stopping potential is lower than expected', 'Photocurrent severely diminished'],
      diagnosticHints: ['Inspect phototube vacuum integrity and cathode cleanliness'],
      effect: 'PARAM_DEVIATION'
    }
  ],

  analysis: {
    xAxisLabel: 'Photon Frequency (ν)',
    xAxisKey: 'frequencyTeraHz',
    xAxisUnit: 'THz',
    yAxisLabel: 'Stopping Potential (V₀)',
    yAxisKey: 'stopping_pot_meas',
    yAxisUnit: 'V',
    expectedSlopeFormula: 'Slope = h / e (Planck constant / elementary charge)',
    theoreticalRelationshipDescription: 'The linear slope of V0 vs frequency equals h/e. Multiplying the slope by electron charge e yields experimental Planck constant h.'
  },

  tutorContext: {
    experimentId: 'photoelectric-effect',
    experimentTitle: 'Photoelectric Effect Quantum Lab',
    learningObjectives: ['Measure stopping potentials', 'Calculate Planck constant h', 'Verify photon energy E = h*nu'],
    governingEquations: ['E = h * nu', 'e * V0 = h * nu - Phi'],
    commonMistakes: ['Thinking increasing light intensity increases the stopping voltage (intensity only increases current, not kinetic energy).']
  },

  report: {
    title: 'Photoelectric Effect and Planck Constant Laboratory Report',
    governingFormulaLatex: "e V_0 = h\\nu - \\Phi \\implies V_0 = \\left(\\frac{h}{e}\\right)\\nu - \\frac{\\Phi}{e}",
    procedureSummary: [
      'Exposed phototube cathode to monochromatic wavelengths (250nm - 650nm).',
      'Measured stopping potential V0 for each frequency to determine maximum photoelectron kinetic energy.'
    ],
    expectedConclusionTemplate: 'The experimental results validate Einstein photoelectric equation. The linear relationship between stopping potential and frequency yields an experimental Planck constant h within 1.5% of theoretical value.'
  },

  validateTopology: () => ({ isValid: true, canSimulate: true, message: 'Apparatus aligned', errors: [], warnings: [] }),
  simulate: simulatePhotoelectric
};
