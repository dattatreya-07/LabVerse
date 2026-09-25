import { ExperimentDefinition } from '@/types';

export const chemistryKineticsExperiment: ExperimentDefinition = {
  id: 'chemical-kinetics',
  title: 'Iodine Clock Reaction Kinetics & Arrhenius Law',
  tagline: 'Measure reaction rates, determine rate law exponents, and calculate activation energy Ea.',
  domain: 'CHEMISTRY',
  difficulty: 'INTERMEDIATE',
  availability: 'AVAILABLE',
  estimatedMinutes: 25,
  coverIcon: 'Atom',
  summary: 'Mix Persulfate (S₂O₈²⁻) and Iodide (I⁻) solutions to observe sudden blue-black starch complexation. Vary reactant concentrations and temperature (15°C - 60°C) to calculate the reaction rate constant k and activation energy Ea.',

  theory: {
    corePrinciple: 'Chemical reaction rate depends on reactant concentrations and thermal kinetic energy. Rate = k(T) * [S₂O₈²⁻]^m * [I⁻]^n. Rate constants follow the Arrhenius equation: k = A * exp(-Ea / (R*T)).',
    equations: [
      '\\text{Rate} = k(T) [\\text{S}_2\\text{O}_8^{2-}]^m [\\text{I}^-]^n',
      'k = A e^{-\\frac{E_a}{R T}}',
      '\\ln(k) = \\ln(A) - \\frac{E_a}{R}\\left(\\frac{1}{T}\\right)'
    ],
    derivation: 'Differential rate laws relating reactant consumption to reaction order. Plotting ln(k) versus 1/T yields a linear Arrhenius plot with slope -Ea/R.',
    variableDescriptions: {
      'Rate': 'Initial rate of reaction (mol/(L·s))',
      'k': 'Specific reaction rate constant (L/(mol·s))',
      'E_a': 'Activation energy barrier (kJ/mol)',
      'T': 'Absolute temperature (Kelvin, K)',
      'R': 'Universal gas constant (8.314 J/(mol·K))'
    }
  },

  learningObjectives: [
    { id: 'obj-c1', description: 'Determine individual reaction orders m and n with respect to persulfate and iodide.', bloomLevel: 'APPLY' },
    { id: 'obj-c2', description: 'Measure reaction completion time t_color as a function of temperature.', bloomLevel: 'UNDERSTAND' },
    { id: 'obj-c3', description: 'Calculate activation energy Ea from the gradient of an Arrhenius ln(k) vs 1/T plot.', bloomLevel: 'EVALUATE' }
  ],

  equipment: [
    {
      type: 'BEAKER',
      title: 'Thermostatted Reaction Vessel',
      description: 'Borosilicate reaction vessel with magnetic stirrer and water bath temperature jacket.',
      domain: 'CHEMISTRY',
      defaultProperties: { temperature: 25 },
      terminals: [],
      iconName: 'Atom'
    },
    {
      type: 'SPECTROPHOTOMETER',
      title: 'Digital UV-Vis Spectrophotometer',
      description: 'Absorbance detector tracking optical density of triiodide-starch complex formation.',
      domain: 'CHEMISTRY',
      defaultProperties: { absorbance: 0.42 },
      terminals: [],
      iconName: 'Activity'
    }
  ],

  parameters: [
    {
      id: 'temperature',
      label: 'Reaction Temperature (T)',
      symbol: 'T',
      unit: '°C',
      min: 15,
      max: 60,
      step: 5,
      defaultValue: 25,
      description: 'Water bath temperature of the reaction mixture'
    },
    {
      id: 'concentration',
      label: 'Persulfate Concentration [S₂O₈²⁻]',
      symbol: '[A]',
      unit: 'M',
      min: 0.05,
      max: 0.40,
      step: 0.05,
      defaultValue: 0.20,
      description: 'Initial concentration of potassium persulfate'
    }
  ],

  workspace: {
    allowedEquipment: ['BEAKER', 'SPECTROPHOTOMETER'],
    defaultPreset: {
      components: [
        {
          id: 'beaker-1',
          type: 'BEAKER',
          title: 'Thermostatted Reaction Vessel',
          domain: 'CHEMISTRY',
          position: { x: 380, y: 220 },
          terminals: [],
          properties: { temperature: 25 },
          state: {}
        },
        {
          id: 'spectro-1',
          type: 'SPECTROPHOTOMETER',
          title: 'Digital UV-Vis Spectrophotometer',
          domain: 'CHEMISTRY',
          position: { x: 580, y: 220 },
          terminals: [],
          properties: { absorbance: 0.42 },
          state: { displayValue: 'A = 0.42' }
        }
      ],
      connections: []
    },
    guidedSteps: [
      { stepNumber: 1, title: 'Set Baseline Temperature T = 25°C', instruction: 'Set concentration [A] = 0.20 M and observe reaction time t ≈ 45.0 s.' },
      { stepNumber: 2, title: 'Double Reactant Concentration to 0.40 M', instruction: 'Observe doubling of rate, reducing reaction time to ~22.5 s (first-order kinetics).' },
      { stepNumber: 3, title: 'Increase Temperature to 50°C', instruction: 'Observe dramatic kinetic acceleration according to Arrhenius exponential law.' }
    ]
  },

  challenges: [
    {
      id: 'ch-c1',
      title: 'Target 15-Second Reaction Time',
      description: 'Calibrate temperature and concentration to achieve exactly 15.0s reaction color transition time.',
      targetMetric: 'reaction_time_meas',
      targetValue: 15.0,
      tolerance: 0.05,
      unit: 's',
      hint: 'Increase temperature to 45°C or concentration to 0.35M.'
    }
  ],

  faults: [
    {
      id: 'FAULT_CONTAMINATED_REAGENT',
      title: 'Thiosulfate Buffer Depletion (Premature Color Shift)',
      description: 'Impaired inhibitor reagent causes immediate triiodide starch reaction.',
      applicableComponentTypes: ['BEAKER'],
      symptoms: ['Reaction completes almost immediately (t < 2s)'],
      diagnosticHints: ['Prepare fresh thiosulfate scavenger stock solution'],
      effect: 'PARAM_DEVIATION'
    }
  ],

  analysis: {
    xAxisLabel: 'Reciprocal Temperature (1/T)',
    xAxisKey: 'inv_temp',
    xAxisUnit: 'x 10⁻³ K⁻¹',
    yAxisLabel: 'Natural Log Rate Constant ln(k)',
    yAxisKey: 'rate_k_meas',
    yAxisUnit: '',
    expectedSlopeFormula: 'Slope = -Ea / R',
    theoreticalRelationshipDescription: 'Plotting ln(k) against 1/T yields a linear graph with slope -Ea/R. Multiplying by -R = -8.314 J/mol·K directly calculates the activation energy Ea = 52.3 kJ/mol.'
  },

  tutorContext: {
    experimentId: 'chemical-kinetics',
    experimentTitle: 'Chemical Kinetics & Arrhenius Law',
    learningObjectives: ['Determine rate law exponents', 'Calculate rate constant k', 'Verify Arrhenius activation energy Ea'],
    governingEquations: ['Rate = k [A]^m [B]^n', 'k = A * exp(-Ea / (R*T))', 'ln(k) = ln(A) - (Ea/R)*(1/T)'],
    commonMistakes: ['Forgetting to convert Celsius temperature to absolute Kelvin (T_K = T_C + 273.15).']
  },

  report: {
    title: 'Chemical Reaction Kinetics & Arrhenius Law Laboratory Report',
    governingFormulaLatex: "k = A e^{-\\frac{E_a}{R T}}",
    procedureSummary: [
      'Measured reaction completion time of iodine-clock reaction across varied temperatures (15°C - 60°C) and reactant concentrations.',
      'Plotted Arrhenius ln(k) vs 1/T and deduced the activation energy Ea.'
    ],
    expectedConclusionTemplate: 'The empirical rate constants obey the Arrhenius equation with activation energy Ea = 52.3 kJ/mol, confirming first-order rate kinetics with respect to persulfate.'
  },

  validateTopology: () => ({ isValid: true, canSimulate: true, message: 'Reaction chamber stabilized and ready for titration', errors: [], warnings: [] }),
  simulate: (input) => {
    const tempC = input.parameters['temperature'] || 25;
    const conc = input.parameters['concentration'] || 0.20;
    const tempK = tempC + 273.15;
    const R_GAS = 8.314;
    const EA = 52300; // 52.3 kJ/mol
    const A_FACTOR = 3.5e8;

    const k_rate = A_FACTOR * Math.exp(-EA / (R_GAS * tempK));
    const isContaminated = input.activeFaults.includes('FAULT_CONTAMINATED_REAGENT');

    const rate = k_rate * conc;
    const timeColor = isContaminated ? 1.5 : Math.max(1.0, +(0.005 / rate).toFixed(1));
    const k_display = +(k_rate * 1000).toFixed(2);

    return {
      success: true,
      experimentId: input.experimentId,
      measurements: [
        { id: 'reaction_time_meas', label: 'Reaction Time (t)', symbol: 't_rxn', theoreticalValue: isContaminated ? 1.5 : timeColor, simulatedValue: timeColor, observedValue: timeColor, unit: 's' },
        { id: 'rate_k_meas', label: 'Rate Constant k', symbol: 'k', theoreticalValue: k_display, simulatedValue: k_display, observedValue: k_display, unit: 'x10⁻³ L/mol·s' }
      ],
      derivedValues: { tempK, rate, k_rate },
      visualState: { isOperating: true },
      topology: { isValid: true, canSimulate: true, message: 'Kinetics solver converged', errors: [], warnings: [] },
      warnings: isContaminated ? [{ code: 'WARN_REAGENT_DEPLETED', message: 'Thiosulfate buffer depleted: Instantaneous reaction occurred.' }] : [],
      errors: [],
      timestamp: new Date().toISOString()
    };
  }
};
