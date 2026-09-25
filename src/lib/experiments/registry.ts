import { ExperimentDefinition, DomainCategory } from '@/types';
import { ohmsLawExperiment } from './definitions/ohms-law';
import { pendulumExperiment } from './definitions/pendulum';
import { photoelectricExperiment } from './definitions/photoelectric';
import { antennaRadiationExperiment } from './definitions/antenna-radiation';

export { ohmsLawExperiment, pendulumExperiment, photoelectricExperiment, antennaRadiationExperiment };

export const EXPERIMENT_CATALOG: ExperimentDefinition[] = [
  antennaRadiationExperiment,
  ohmsLawExperiment,
  pendulumExperiment,
  photoelectricExperiment,
  {
    id: 'rutherford-scattering',
    title: 'Rutherford Alpha Particle Scattering',
    tagline: 'Discover the dense atomic nucleus through subatomic particle collisions.',
    domain: 'NUCLEAR',
    difficulty: 'ADVANCED',
    availability: 'DEMO',
    estimatedMinutes: 25,
    coverIcon: 'Atom',
    summary: 'Fire energetic alpha particles at thin gold foils to measure scattering angular distribution N(θ) ∝ 1/sin⁴(θ/2) and deduce nuclear diameter.',
    theory: {
      corePrinciple: 'Coulomb repulsion between alpha particles (+2e) and gold nuclei (+79e) leads to hyperbolic orbits and large-angle backscattering.',
      equations: ['N(\\theta) \\propto \\frac{Z^2 E^2}{\\sin^4(\\theta/2)}', 'b = \\frac{z Z e^2}{4\\pi \\epsilon_0 m v^2} \\cot(\\theta/2)'],
      derivation: 'Rutherford differential scattering cross section dσ/dΩ derived from Coulomb force and angular momentum conservation.',
      variableDescriptions: {
        'N(theta)': 'Count of scattered alpha particles at detector angle theta',
        'Z': 'Atomic number of target nucleus (Gold Z = 79)',
        'theta': 'Scattering angle (degrees)'
      }
    },
    learningObjectives: [
      { id: 'obj-r1', description: 'Observe the rare large-angle deflection of alpha particles indicating a compact positive nucleus.', bloomLevel: 'UNDERSTAND' }
    ],
    equipment: [],
    parameters: [
      { id: 'foil_thickness', label: 'Foil Thickness (t)', symbol: 't', unit: 'nm', min: 100, max: 1000, step: 50, defaultValue: 400 },
      { id: 'beam_energy', label: 'Alpha Energy (E)', symbol: 'E', unit: 'MeV', min: 2.0, max: 8.0, step: 0.5, defaultValue: 5.5 }
    ],
    workspace: { allowedEquipment: [] },
    tutorContext: {
      experimentId: 'rutherford-scattering',
      experimentTitle: 'Rutherford Alpha Scattering Laboratory',
      learningObjectives: ['Measure scattering cross section', 'Understand nuclear atomic model'],
      governingEquations: ['N(theta) ~ 1/sin^4(theta/2)'],
      commonMistakes: ['Confusing Thomson plum pudding model with Rutherford planetary nucleus model.']
    },
    report: {
      title: 'Rutherford Scattering Laboratory Report',
      governingFormulaLatex: "N(\\theta) \\propto \\frac{1}{\\sin^4(\\theta/2)}",
      procedureSummary: ['Irradiated thin metal foil with collimated alpha beam.'],
      expectedConclusionTemplate: 'Experimental angular counts agree with Rutherford inverse fourth-power sine law.'
    },
    validateTopology: () => ({ isValid: true, canSimulate: true, message: 'Nuclear chamber evacuated and operational', errors: [], warnings: [] }),
    simulate: (input) => ({
      success: true,
      experimentId: input.experimentId,
      measurements: [
        { id: 'count_meas', label: 'Detector Counts (10°)', symbol: 'N(10°)', theoreticalValue: 12450, simulatedValue: 12450, observedValue: 12450, unit: 'cps' },
        { id: 'backscatter_meas', label: 'Backscatter Counts (150°)', symbol: 'N(150°)', theoreticalValue: 4, simulatedValue: 4, observedValue: 4, unit: 'cps' }
      ],
      derivedValues: { count: 12450 },
      visualState: { isOperating: true },
      topology: { isValid: true, canSimulate: true, message: 'Ready', errors: [], warnings: [] },
      warnings: [],
      errors: [],
      timestamp: new Date().toISOString()
    })
  },
  {
    id: 'gel-electrophoresis',
    title: 'DNA Agarose Gel Electrophoresis',
    tagline: 'Separate DNA fragments by molecular size in an electric field.',
    domain: 'BIOLOGY',
    difficulty: 'INTERMEDIATE',
    availability: 'DEMO',
    estimatedMinutes: 20,
    coverIcon: 'Dna',
    summary: 'Load PCR restriction digest DNA fragments into agarose gel wells, apply DC electric potential, and analyze migration bands under UV transillumination.',
    theory: {
      corePrinciple: 'Negatively charged DNA phosphate backbones migrate toward the positive anode (red) at rates inversely proportional to the log of their base-pair (bp) length.',
      equations: ['d \\propto \\frac{V \\cdot t}{\\log(BP)}', 'v = \\mu E = \\mu \\frac{V}{L}'],
      derivation: 'Electrophoretic mobility in porous agarose gel matrix.',
      variableDescriptions: {
        'd': 'Migration distance from well (mm)',
        'BP': 'DNA fragment size in base pairs (bp)',
        'V': 'Applied DC Voltage across buffer tank (V)'
      }
    },
    learningObjectives: [
      { id: 'obj-g1', description: 'Analyze DNA migration bands against molecular weight standard ladder.', bloomLevel: 'APPLY' }
    ],
    equipment: [],
    parameters: [
      { id: 'voltage', label: 'Buffer Voltage', symbol: 'V', unit: 'V', min: 50, max: 150, step: 10, defaultValue: 100 },
      { id: 'gel_pct', label: 'Agarose Concentration', symbol: '%', unit: '%', min: 0.8, max: 2.0, step: 0.2, defaultValue: 1.0 }
    ],
    workspace: { allowedEquipment: [] },
    tutorContext: {
      experimentId: 'gel-electrophoresis',
      experimentTitle: 'DNA Gel Electrophoresis Laboratory',
      learningObjectives: ['Determine fragment base pair size', 'Understand agarose gel migration'],
      governingEquations: ['d ~ 1/log(BP)'],
      commonMistakes: ['Reversing electrode polarity (DNA runs off the gel).']
    },
    report: {
      title: 'DNA Gel Electrophoresis Laboratory Report',
      governingFormulaLatex: "d \\propto \\frac{V \\cdot t}{\\log(BP)}",
      procedureSummary: ['Loaded DNA samples into 1% agarose gel and ran at 100V for 45 minutes.'],
      expectedConclusionTemplate: 'DNA fragment sizes calculated from migration distance against DNA ladder standards.'
    },
    validateTopology: () => ({ isValid: true, canSimulate: true, message: 'Gel chamber loaded', errors: [], warnings: [] }),
    simulate: (input) => ({
      success: true,
      experimentId: input.experimentId,
      measurements: [
        { id: 'mig_1000bp', label: '1000 bp Migration', symbol: 'd₁', theoreticalValue: 32.5, simulatedValue: 32.5, observedValue: 32.5, unit: 'mm' },
        { id: 'mig_500bp', label: '500 bp Migration', symbol: 'd₂', theoreticalValue: 58.2, simulatedValue: 58.2, observedValue: 58.2, unit: 'mm' }
      ],
      derivedValues: { d1: 32.5, d2: 58.2 },
      visualState: { isOperating: true },
      topology: { isValid: true, canSimulate: true, message: 'Ready', errors: [], warnings: [] },
      warnings: [],
      errors: [],
      timestamp: new Date().toISOString()
    })
  }
];

export function getExperiment(id: string): ExperimentDefinition {
  const found = EXPERIMENT_CATALOG.find(e => e.id === id);
  return found || ohmsLawExperiment;
}

export function getAllExperiments(): ExperimentDefinition[] {
  return EXPERIMENT_CATALOG;
}

export function getExperimentsByDomain(domain: DomainCategory): ExperimentDefinition[] {
  return EXPERIMENT_CATALOG.filter(e => e.domain === domain);
}
