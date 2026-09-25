import { ExperimentDefinition, DomainCategory } from '@/types';
import { ohmsLawExperiment } from './definitions/ohms-law';
import { pendulumExperiment } from './definitions/pendulum';
import { photoelectricExperiment } from './definitions/photoelectric';
import { chemistryKineticsExperiment } from './definitions/chemistry-kinetics';
import { financePortfolioExperiment } from './definitions/finance-portfolio';
import { antennaRadiationExperiment } from './definitions/antenna-radiation';

export { 
  ohmsLawExperiment, 
  pendulumExperiment, 
  photoelectricExperiment,
  antennaRadiationExperiment,
  chemistryKineticsExperiment,
  financePortfolioExperiment
};

export const EXPERIMENT_CATALOG: ExperimentDefinition[] = [
  antennaRadiationExperiment,
  ohmsLawExperiment,
  pendulumExperiment,
  photoelectricExperiment,
  chemistryKineticsExperiment,
  financePortfolioExperiment,
  {
    id: 'rutherford-scattering',
    title: 'Rutherford Alpha Particle Scattering',
    tagline: 'Discover the dense atomic nucleus through subatomic particle collisions.',
    domain: 'NUCLEAR',
    difficulty: 'ADVANCED',
    availability: 'AVAILABLE',
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
      { id: 'obj-r1', description: 'Observe the rare large-angle deflection of alpha particles indicating a compact positive nucleus.', bloomLevel: 'UNDERSTAND' },
      { id: 'obj-r2', description: 'Measure detector counts as a function of scattering angle from 10° to 150°.', bloomLevel: 'APPLY' },
      { id: 'obj-r3', description: 'Verify the inverse fourth-power sine angular distribution law.', bloomLevel: 'ANALYZE' }
    ],
    equipment: [
      {
        type: 'ALPHA_SOURCE',
        title: 'Americium-241 Alpha Source',
        description: 'Collimated 5.5 MeV monoenergetic alpha particle beam capsule.',
        domain: 'NUCLEAR',
        defaultProperties: { energy: 5.5 },
        terminals: [],
        iconName: 'Atom'
      },
      {
        type: 'GOLD_FOIL',
        title: 'Thin Gold Foil Target (400nm)',
        description: 'Pure 24-karat gold foil sheet mounted in vacuum chamber target ring.',
        domain: 'NUCLEAR',
        defaultProperties: { thickness: 400 },
        terminals: [],
        iconName: 'Shield'
      },
      {
        type: 'SCATTER_DETECTOR',
        title: 'ZnS Scintillation Detector',
        description: 'Rotatable angular detector stage with photomultiplier counter.',
        domain: 'NUCLEAR',
        defaultProperties: { angle: 15 },
        terminals: [],
        iconName: 'Activity'
      }
    ],
    parameters: [
      { id: 'foil_thickness', label: 'Foil Thickness (t)', symbol: 't', unit: 'nm', min: 100, max: 1000, step: 50, defaultValue: 400 },
      { id: 'beam_energy', label: 'Alpha Energy (E)', symbol: 'E', unit: 'MeV', min: 2.0, max: 8.0, step: 0.5, defaultValue: 5.5 },
      { id: 'scatter_angle', label: 'Detector Angle (θ)', symbol: 'θ', unit: '°', min: 5, max: 160, step: 5, defaultValue: 15 }
    ],
    workspace: {
      allowedEquipment: ['ALPHA_SOURCE', 'GOLD_FOIL', 'SCATTER_DETECTOR'],
      defaultPreset: {
        components: [
          {
            id: 'alpha-source-1',
            type: 'ALPHA_SOURCE',
            title: 'Americium-241 Alpha Source',
            domain: 'NUCLEAR',
            position: { x: 260, y: 220 },
            terminals: [],
            properties: { energy: 5.5 },
            state: {}
          },
          {
            id: 'gold-foil-1',
            type: 'GOLD_FOIL',
            title: 'Thin Gold Foil Target (400nm)',
            domain: 'NUCLEAR',
            position: { x: 440, y: 220 },
            terminals: [],
            properties: { thickness: 400 },
            state: {}
          },
          {
            id: 'scatter-detector-1',
            type: 'SCATTER_DETECTOR',
            title: 'ZnS Scintillation Detector',
            domain: 'NUCLEAR',
            position: { x: 620, y: 190 },
            terminals: [],
            properties: { angle: 15 },
            state: {}
          }
        ],
        connections: []
      },
      guidedSteps: [
        { stepNumber: 1, title: 'Set Alpha Energy to 5.5 MeV', instruction: 'Align Americium-241 source toward gold foil.' },
        { stepNumber: 2, title: 'Measure Small Angle Deflection (θ = 15°)', instruction: 'Observe heavy forward particle count rate (~12,000 cps).' },
        { stepNumber: 3, title: 'Measure Backscattering (θ = 140°)', instruction: 'Observe rare 1-in-8000 nuclear reflection indicating compact dense positive nucleus.' }
      ]
    },
    challenges: [
      {
        id: 'ch-r1',
        title: 'Detect Nuclear Backscattering',
        description: 'Set detector to 140° and calculate the cross section ratio compared to 15° forward scattering.',
        targetMetric: 'count_meas',
        targetValue: 8,
        tolerance: 0.1,
        unit: 'cps',
        hint: 'Use Rutherford law: N(140°)/N(15°) = sin^4(7.5°) / sin^4(70°) ~ 0.00067.'
      }
    ],
    faults: [
      {
        id: 'FAULT_CHAMBER_LEAK',
        title: 'Vacuum Pressure Leak (Air Scattering)',
        description: 'Residual nitrogen molecules in chamber cause premature alpha attenuation.',
        applicableComponentTypes: ['ALPHA_SOURCE'],
        symptoms: ['Counts drop sharply across all angles'],
        diagnosticHints: ['Check vacuum pump seal'],
        effect: 'PARAM_DEVIATION'
      }
    ],
    analysis: {
      xAxisLabel: 'Scattering Angle (θ)',
      xAxisKey: 'scatter_angle',
      xAxisUnit: '°',
      yAxisLabel: 'Relative Counts N(θ)',
      yAxisKey: 'count_meas',
      yAxisUnit: 'cps',
      expectedSlopeFormula: 'N(θ) ∝ 1/sin⁴(θ/2)',
      theoreticalRelationshipDescription: 'Plotting log(N) against log(sin(θ/2)) confirms an inverse-fourth power relationship with slope -4.'
    },
    tutorContext: {
      experimentId: 'rutherford-scattering',
      experimentTitle: 'Rutherford Alpha Scattering Laboratory',
      learningObjectives: ['Measure scattering cross section', 'Understand nuclear atomic model'],
      governingEquations: ['N(theta) ~ 1/sin^4(theta/2)', 'b = (z*Z*e^2)/(4*pi*eps0*E) * cot(theta/2)'],
      commonMistakes: ['Confusing Thomson plum pudding model with Rutherford planetary nucleus model.']
    },
    report: {
      title: 'Rutherford Scattering Laboratory Report',
      governingFormulaLatex: "N(\\theta) \\propto \\frac{1}{\\sin^4(\\theta/2)}",
      procedureSummary: ['Irradiated thin metal foil with collimated alpha beam across varied detector angles.'],
      expectedConclusionTemplate: 'Experimental angular counts agree with Rutherford inverse fourth-power sine law, verifying the planetary atomic nucleus.'
    },
    validateTopology: () => ({ isValid: true, canSimulate: true, message: 'Nuclear scattering chamber evacuated and ready', errors: [], warnings: [] }),
    simulate: (input) => {
      const angle = input.parameters['scatter_angle'] || 15;
      const energy = input.parameters['beam_energy'] || 5.5;
      const thickness = input.parameters['foil_thickness'] || 400;
      
      const radHalf = (angle / 2) * (Math.PI / 180);
      const sin4 = Math.pow(Math.sin(radHalf), 4);
      const baseConstant = 0.5 * (thickness / 400) * Math.pow(5.5 / energy, 2);
      const countTheoretical = Math.max(1, Math.round(baseConstant / sin4));
      const hasLeak = input.activeFaults.includes('FAULT_CHAMBER_LEAK');
      const countObserved = hasLeak ? Math.round(countTheoretical * 0.15) : countTheoretical;

      return {
        success: true,
        experimentId: input.experimentId,
        measurements: [
          { id: 'count_meas', label: `Detector Counts (${angle}°)`, symbol: `N(${angle}°)`, theoreticalValue: countTheoretical, simulatedValue: countObserved, observedValue: countObserved, unit: 'cps' }
        ],
        derivedValues: { angle, count: countObserved },
        visualState: { isOperating: true },
        topology: { isValid: true, canSimulate: true, message: 'Alpha beam active', errors: [], warnings: [] },
        warnings: hasLeak ? [{ code: 'WARN_CHAMBER_LEAK', message: 'Chamber vacuum degraded: Air scattering attenuation active.' }] : [],
        errors: [],
        timestamp: new Date().toISOString()
      };
    }
  },
  {
    id: 'gel-electrophoresis',
    title: 'DNA Agarose Gel Electrophoresis',
    tagline: 'Separate DNA fragments by molecular size in an electric field.',
    domain: 'BIOLOGY',
    difficulty: 'INTERMEDIATE',
    availability: 'AVAILABLE',
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
      { id: 'obj-g1', description: 'Analyze DNA migration bands against molecular weight standard ladder.', bloomLevel: 'APPLY' },
      { id: 'obj-g2', description: 'Determine the logarithmic relationship between DNA fragment size and migration rate.', bloomLevel: 'ANALYZE' }
    ],
    equipment: [
      {
        type: 'ELECTROPHORESIS_TANK',
        title: 'Agarose Submarine Gel Tank',
        description: 'Electrophoresis chamber with TAE buffer and platinum electrodes.',
        domain: 'BIOLOGY',
        defaultProperties: { concentration: 1.0 },
        terminals: [
          { id: 'anode', name: 'Positive Anode (+)', type: 'POSITIVE', position: { x: 65, y: 0 }, label: '+' },
          { id: 'cathode', name: 'Negative Cathode (-)', type: 'NEGATIVE', position: { x: -65, y: 0 }, label: '-' }
        ],
        iconName: 'Dna'
      },
      {
        type: 'DC_SUPPLY',
        title: 'High-Voltage DC Power Unit',
        description: 'Precision electrophoresis DC voltage supply (20V - 200V).',
        domain: 'ELECTRONICS',
        defaultProperties: { voltage: 100 },
        terminals: [
          { id: 'pos', name: 'Positive (+)', type: 'POSITIVE', position: { x: 35, y: 0 }, label: '+' },
          { id: 'neg', name: 'Negative (-)', type: 'NEGATIVE', position: { x: -35, y: 0 }, label: '-' }
        ],
        iconName: 'Zap'
      }
    ],
    parameters: [
      { id: 'voltage', label: 'Buffer Voltage (V)', symbol: 'V', unit: 'V', min: 50, max: 150, step: 10, defaultValue: 100, description: 'Applied DC potential' },
      { id: 'gel_pct', label: 'Agarose Concentration', symbol: '%', unit: '%', min: 0.8, max: 2.0, step: 0.2, defaultValue: 1.0, description: 'Agarose percentage' }
    ],
    workspace: {
      allowedEquipment: ['ELECTROPHORESIS_TANK', 'DC_SUPPLY'],
      defaultPreset: {
        components: [
          {
            id: 'gel-tank-1',
            type: 'ELECTROPHORESIS_TANK',
            title: 'Agarose Submarine Gel Tank',
            domain: 'BIOLOGY',
            position: { x: 380, y: 220 },
            terminals: [
              { id: 'anode', name: 'Positive Anode (+)', type: 'POSITIVE', position: { x: 65, y: 0 }, label: '+' },
              { id: 'cathode', name: 'Negative Cathode (-)', type: 'NEGATIVE', position: { x: -65, y: 0 }, label: '-' }
            ],
            properties: { concentration: 1.0 },
            state: {}
          },
          {
            id: 'dc-supply-gel',
            type: 'DC_SUPPLY',
            title: 'High-Voltage DC Power Unit',
            domain: 'ELECTRONICS',
            position: { x: 580, y: 220 },
            terminals: [
              { id: 'pos', name: 'Positive (+)', type: 'POSITIVE', position: { x: 35, y: 0 }, label: '+' },
              { id: 'neg', name: 'Negative (-)', type: 'NEGATIVE', position: { x: -35, y: 0 }, label: '-' }
            ],
            properties: { voltage: 100 },
            state: {}
          }
        ],
        connections: [
          {
            id: 'wire-gel-1',
            fromComponentId: 'dc-supply-gel',
            fromTerminalId: 'pos',
            toComponentId: 'gel-tank-1',
            toTerminalId: 'anode',
            color: '#f43f5e'
          },
          {
            id: 'wire-gel-2',
            fromComponentId: 'dc-supply-gel',
            fromTerminalId: 'neg',
            toComponentId: 'gel-tank-1',
            toTerminalId: 'cathode',
            color: '#0284c7'
          }
        ]
      },
      guidedSteps: [
        { stepNumber: 1, title: 'Set DC Voltage to 100V', instruction: 'Ensure buffer tank electrodes are connected (+ to red anode).' },
        { stepNumber: 2, title: 'Run Electrophoresis', instruction: 'Observe small 200bp DNA fragments migrating furthest down the gel (~68 mm).' },
        { stepNumber: 3, title: 'Analyze Migration Distance', instruction: 'Verify d ∝ 1/log(BP) linear calibration curve.' }
      ]
    },
    challenges: [
      {
        id: 'ch-g1',
        title: 'Target 50mm Migration',
        description: 'Adjust voltage to achieve exactly 50mm migration for 500bp fragment.',
        targetMetric: 'mig_500bp',
        targetValue: 50.0,
        tolerance: 0.05,
        unit: 'mm',
        hint: 'd = (V / 100) * 58.2 mm. For d = 50mm, set V = 86V.'
      }
    ],
    faults: [
      {
        id: 'FAULT_REVERSE_POLARITY',
        title: 'Reversed Electrode Polarity (Anode/Cathode Swapped)',
        description: 'Negative DNA runs toward the top of the gel and runs off the wells into buffer.',
        applicableComponentTypes: ['ELECTROPHORESIS_TANK'],
        symptoms: ['DNA bands migrate backward and disappear'],
        diagnosticHints: ['Ensure red lead connects to positive terminal'],
        effect: 'PARAM_DEVIATION'
      }
    ],
    analysis: {
      xAxisLabel: 'DNA Size log(BP)',
      xAxisKey: 'log_bp',
      xAxisUnit: 'log₁₀(bp)',
      yAxisLabel: 'Migration Distance',
      yAxisKey: 'mig_500bp',
      yAxisUnit: 'mm',
      expectedSlopeFormula: 'd = A - B*log(BP)',
      theoreticalRelationshipDescription: 'Plotting migration distance against log10 of fragment length yields a linear standard curve for sizing unknown DNA samples.'
    },
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
      procedureSummary: ['Loaded DNA samples into 1% agarose gel and ran at DC electric field.'],
      expectedConclusionTemplate: 'DNA fragment sizes calculated from migration distance against DNA ladder standards confirm logarithmic sieving in agarose matrix.'
    },
    validateTopology: () => ({ isValid: true, canSimulate: true, message: 'Gel buffer tank operational', errors: [], warnings: [] }),
    simulate: (input) => {
      const voltage = input.parameters['voltage'] || 100;
      const gelPct = input.parameters['gel_pct'] || 1.0;
      const isReversed = input.activeFaults.includes('FAULT_REVERSE_POLARITY');
      
      const factor = (voltage / 100) * (1.0 / gelPct);
      const d1000 = isReversed ? 0 : +(32.5 * factor).toFixed(1);
      const d500 = isReversed ? 0 : +(58.2 * factor).toFixed(1);
      const d200 = isReversed ? 0 : +(82.4 * factor).toFixed(1);

      return {
        success: true,
        experimentId: input.experimentId,
        measurements: [
          { id: 'mig_1000bp', label: '1000 bp Band Migration', symbol: 'd(1000bp)', theoreticalValue: d1000, simulatedValue: d1000, observedValue: d1000, unit: 'mm' },
          { id: 'mig_500bp', label: '500 bp Band Migration', symbol: 'd(500bp)', theoreticalValue: d500, simulatedValue: d500, observedValue: d500, unit: 'mm' },
          { id: 'mig_200bp', label: '200 bp Band Migration', symbol: 'd(200bp)', theoreticalValue: d200, simulatedValue: d200, observedValue: d200, unit: 'mm' }
        ],
        derivedValues: { d1000, d500, d200 },
        visualState: { isOperating: true },
        topology: { isValid: true, canSimulate: true, message: 'Buffer current flowing', errors: [], warnings: [] },
        warnings: isReversed ? [{ code: 'WARN_REVERSE_POLARITY', message: 'Electrode polarity reversed! DNA migrating toward buffer reservoir.' }] : [],
        errors: [],
        timestamp: new Date().toISOString()
      };
    }
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
