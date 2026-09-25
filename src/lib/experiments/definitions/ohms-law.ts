import { ExperimentDefinition } from '@/types';
import { validateSeriesCircuitTopology } from '@/lib/connection/connection-engine';
import { simulateOhmsLaw } from '@/lib/simulation/circuits/ohms-law-sim';

export const ohmsLawExperiment: ExperimentDefinition = {
  id: 'ohms-law',
  title: "Ohm's Law & Circuit Diagnostics",
  tagline: "Don't just perform the experiment. Understand what happens when it goes wrong.",
  domain: 'ELECTRONICS',
  difficulty: 'BEGINNER',
  availability: 'AVAILABLE',
  estimatedMinutes: 15,
  coverIcon: 'Zap',
  summary: 'Construct a closed series DC circuit, adjust voltage and resistance, observe physical V-I linearity, inject open-circuit or ammeter calibration faults, and diagnose errors using AI tutoring.',
  
  theory: {
    corePrinciple: "Ohm's Law describes the linear relationship between voltage (potential difference), current (charge flow rate), and resistance in an electrical circuit.",
    equations: [
      'V = I \\times R',
      'I = \\frac{V}{R}',
      'R = \\frac{V}{I}',
      'P = V \\times I = I^2 \\times R'
    ],
    derivation: 'At constant temperature, the current flowing through an ohmic conductor is directly proportional to the applied potential difference across its terminals and inversely proportional to its resistance.',
    variableDescriptions: {
      'V': 'Voltage / Potential Difference across conductor terminals (Volts, V)',
      'I': 'Electric Current flow rate (Amperes, A)',
      'R': 'Electrical Resistance (Ohms, Ω)',
      'P': 'Thermal Power Dissipation via Joule Heating (Watts, W)'
    }
  },

  learningObjectives: [
    { id: 'obj-1', description: 'Understand and verify the mathematical proportionality V = I × R in a DC circuit.', bloomLevel: 'UNDERSTAND' },
    { id: 'obj-2', description: 'Assemble a closed series circuit with DC power source, resistor, and ammeter.', bloomLevel: 'APPLY' },
    { id: 'obj-3', description: 'Plot empirical V-I curve and determine circuit resistance from graph slope (1/R).', bloomLevel: 'ANALYZE' },
    { id: 'obj-4', description: 'Diagnose open circuit discontinuities and instrument calibration systematic errors.', bloomLevel: 'EVALUATE' }
  ],

  equipment: [
    {
      type: 'BATTERY',
      title: 'DC Power Supply',
      description: 'Variable DC voltage source with isolated positive (+) and negative (-) terminals.',
      domain: 'ELECTRONICS',
      defaultProperties: { voltage: 6.0 },
      terminals: [
        { id: 'pos', name: 'Positive (+)', type: 'POSITIVE', position: { x: -35, y: -20 }, label: '+' },
        { id: 'neg', name: 'Negative (-)', type: 'NEGATIVE', position: { x: -35, y: 20 }, label: '-' }
      ],
      iconName: 'Battery'
    },
    {
      type: 'RESISTOR',
      title: 'Precision Resistor',
      description: 'Ohmic ceramic resistor with color band encoding.',
      domain: 'ELECTRONICS',
      defaultProperties: { resistance: 20.0 },
      terminals: [
        { id: 't1', name: 'Terminal 1', type: 'NEUTRAL', position: { x: -45, y: 0 }, label: 'T1' },
        { id: 't2', name: 'Terminal 2', type: 'NEUTRAL', position: { x: 45, y: 0 }, label: 'T2' }
      ],
      iconName: 'Activity'
    },
    {
      type: 'AMMETER',
      title: 'Digital & Analog Ammeter',
      description: 'Series current meter with rotating needle and digital readout.',
      domain: 'ELECTRONICS',
      defaultProperties: {},
      terminals: [
        { id: 'pos', name: 'Positive (+)', type: 'POSITIVE', position: { x: -30, y: 0 }, label: '+' },
        { id: 'neg', name: 'Negative (-)', type: 'NEGATIVE', position: { x: 30, y: 0 }, label: '-' }
      ],
      iconName: 'Gauge'
    },
    {
      type: 'SWITCH',
      title: 'Knife Switch',
      description: 'Single pole single throw (SPST) mechanical contact switch.',
      domain: 'ELECTRONICS',
      defaultProperties: { isOpen: false },
      terminals: [
        { id: 't1', name: 'Contact 1', type: 'NEUTRAL', position: { x: -30, y: 0 }, label: '1' },
        { id: 't2', name: 'Contact 2', type: 'NEUTRAL', position: { x: 30, y: 0 }, label: '2' }
      ],
      iconName: 'ToggleRight'
    }
  ],

  parameters: [
    {
      id: 'voltage',
      label: 'Applied Voltage',
      symbol: 'V',
      unit: 'V',
      min: 0.0,
      max: 30.0,
      step: 0.5,
      defaultValue: 6.0,
      description: 'Potential difference across circuit terminals'
    },
    {
      id: 'resistance',
      label: 'Load Resistance',
      symbol: 'R',
      unit: 'Ω',
      min: 1.0,
      max: 1000.0,
      step: 1.0,
      defaultValue: 20.0,
      description: 'Opposition to electrical charge flow'
    }
  ],

  workspace: {
    gridSize: 20,
    canvasWidth: 800,
    canvasHeight: 440,
    allowedEquipment: ['BATTERY', 'RESISTOR', 'AMMETER', 'SWITCH', 'WIRE'],
    defaultPreset: {
      components: [
        {
          id: 'bat-1',
          type: 'BATTERY',
          title: 'DC Power Supply',
          domain: 'ELECTRONICS',
          position: { x: 140, y: 220 },
          terminals: [
            { id: 'pos', name: 'Positive (+)', type: 'POSITIVE', position: { x: 0, y: -30 }, label: '+' },
            { id: 'neg', name: 'Negative (-)', type: 'NEGATIVE', position: { x: 0, y: 30 }, label: '-' }
          ],
          properties: { voltage: 6.0 },
          state: { isPowered: true }
        },
        {
          id: 'res-1',
          type: 'RESISTOR',
          title: 'Precision Resistor',
          domain: 'ELECTRONICS',
          position: { x: 400, y: 80 },
          terminals: [
            { id: 't1', name: 'Terminal 1', type: 'NEUTRAL', position: { x: -50, y: 0 }, label: 'T1' },
            { id: 't2', name: 'Terminal 2', type: 'NEUTRAL', position: { x: 50, y: 0 }, label: 'T2' }
          ],
          properties: { resistance: 20.0 },
          state: {}
        },
        {
          id: 'amm-1',
          type: 'AMMETER',
          title: 'Digital Ammeter',
          domain: 'ELECTRONICS',
          position: { x: 400, y: 360 },
          terminals: [
            { id: 'pos', name: 'Positive (+)', type: 'POSITIVE', position: { x: -40, y: 0 }, label: '+' },
            { id: 'neg', name: 'Negative (-)', type: 'NEGATIVE', position: { x: 40, y: 0 }, label: '-' }
          ],
          properties: {},
          state: {}
        },
        {
          id: 'sw-1',
          type: 'SWITCH',
          title: 'Knife Switch',
          domain: 'ELECTRONICS',
          position: { x: 660, y: 220 },
          terminals: [
            { id: 't1', name: 'Contact 1', type: 'NEUTRAL', position: { x: 0, y: -30 }, label: '1' },
            { id: 't2', name: 'Contact 2', type: 'NEUTRAL', position: { x: 0, y: 30 }, label: '2' }
          ],
          properties: { isOpen: false },
          state: { isOpen: false }
        }
      ],
      connections: [
        { id: 'w1', fromComponentId: 'bat-1', fromTerminalId: 'pos', toComponentId: 'res-1', toTerminalId: 't1', color: '#0284c7' },
        { id: 'w2', fromComponentId: 'res-1', fromTerminalId: 't2', toComponentId: 'sw-1', toTerminalId: 't1', color: '#0284c7' },
        { id: 'w3', fromComponentId: 'sw-1', fromTerminalId: 't2', toComponentId: 'amm-1', toTerminalId: 'pos', color: '#0284c7' },
        { id: 'w4', fromComponentId: 'amm-1', fromTerminalId: 'neg', toComponentId: 'bat-1', toTerminalId: 'neg', color: '#0284c7' }
      ]
    },
    guidedSteps: [
      { stepNumber: 1, title: 'Inspect Circuit Topology', instruction: 'Ensure Battery, Resistor, Switch, and Ammeter are wired in a closed series loop.' },
      { stepNumber: 2, title: 'Set Baseline 6.0 V and 20.0 Ω', instruction: 'Use parameter sliders to select 6V and 20Ω, then run simulation.' },
      { stepNumber: 3, title: 'Verify I = 0.30 A', instruction: 'Check that theoretical current and measured ammeter reading both equal 0.30 A.' },
      { stepNumber: 4, title: 'Sweep Voltage to Plot V-I Linearity', instruction: 'Record data points at 6V, 12V, 18V, 24V, and 30V.' },
      { stepNumber: 5, title: 'Inject Open Circuit / Meter Faults', instruction: 'Troubleshoot simulated fault anomalies with AI Tutor assistance.' }
    ]
  },

  challenges: [
    {
      id: 'ch-1',
      title: 'Current Calibration Challenge',
      description: 'Configure voltage and resistance to produce an exact circuit current of 0.25 A (250 mA).',
      targetMetric: 'current_meas',
      targetValue: 0.25,
      tolerance: 0.02,
      unit: 'A',
      hint: 'Remember I = V / R. If V = 10 V, what resistance R gives 0.25 A? (R = 10 / 0.25 = 40 Ω).'
    },
    {
      id: 'ch-2',
      title: 'High Power Safe Operation',
      description: 'Configure the circuit to achieve 1.20 A current while keeping total power dissipation under 15 W.',
      targetMetric: 'current_meas',
      targetValue: 1.20,
      tolerance: 0.05,
      unit: 'A',
      hint: 'P = V × I. If I = 1.20 A, V must be <= 12.5 V.'
    }
  ],

  faults: [
    {
      id: 'FAULT_OPEN_CIRCUIT',
      title: 'Open Circuit Discontinuity',
      description: 'A physical break in the copper lead prevents electron movement across the circuit loop.',
      applicableComponentTypes: ['WIRE', 'SWITCH', 'RESISTOR'],
      symptoms: ['Ammeter displays exactly 0.00 A', 'Visual electron particles freeze', 'Potential difference remains across battery'],
      diagnosticHints: ['Check circuit continuity between terminals', 'Verify switch is closed and wires are unbroken'],
      effect: 'OPEN_CIRCUIT'
    },
    {
      id: 'FAULT_METER_CALIBRATION',
      title: 'Ammeter Calibration Gain Error (+150%)',
      description: 'The internal digital amplifier in the ammeter has drifted, reporting 2.5x higher current than physical wire current.',
      applicableComponentTypes: ['AMMETER'],
      symptoms: ['Measured reading is significantly higher than V/R theoretical calculation', 'Physical circuit current remains normal'],
      diagnosticHints: ['Compare I_meas against theoretical V/R calculation', 'Check instrument calibration log'],
      effect: 'CALIBRATION_DRIFT',
      parameterModifier: { multiplier: 2.5 }
    },
    {
      id: 'FAULT_HIGH_RESISTANCE',
      title: 'High Contact Resistance (+100 Ω)',
      description: 'Oxidized terminal clips add unexpected series resistance to the circuit loop.',
      applicableComponentTypes: ['RESISTOR', 'BATTERY'],
      symptoms: ['Circuit current is lower than expected for the dialed resistor value'],
      diagnosticHints: ['Measure total circuit resistance', 'Clean contact terminals'],
      effect: 'PARAM_DEVIATION',
      parameterModifier: { offset: 100 }
    }
  ],

  analysis: {
    xAxisLabel: 'Applied Voltage (V)',
    xAxisKey: 'voltage',
    xAxisUnit: 'V',
    yAxisLabel: 'Measured Current (I)',
    yAxisKey: 'current_meas',
    yAxisUnit: 'A',
    expectedSlopeFormula: 'Slope = 1 / R (Conductance G in Siemens)',
    theoreticalRelationshipDescription: "For an ohmic resistor, the slope of the I vs V curve equals the conductance (1/R). The inverse of the slope yields the circuit resistance R."
  },

  safety: {
    rules: [
      'Never short-circuit DC battery terminals directly with 0 Ω wire.',
      'Always connect the ammeter in SERIES, never in parallel across a voltage source.',
      'Ensure resistor power rating P = V × I does not exceed thermal limits.'
    ],
    maxSafeVoltage: 30.0,
    maxSafeCurrent: 3.0,
    maxPowerRating: 50.0
  },

  tutorContext: {
    experimentId: 'ohms-law',
    experimentTitle: "Ohm's Law Verification & Diagnostics",
    learningObjectives: [
      'Verify V = I x R relationship',
      'Diagnose open circuits and meter gain errors',
      'Calculate resistance from V-I curve slope'
    ],
    governingEquations: ['V = I * R', 'I = V / R', 'R = V / I', 'P = V * I'],
    commonMistakes: [
      'Connecting the ammeter in parallel across the power supply (causes short circuit).',
      'Leaving the switch open and wondering why current is 0A.',
      'Confusing instrument calibration drift with physical circuit failure.'
    ]
  },

  report: {
    title: "Ohm's Law Verification and Fault Diagnosis Laboratory Report",
    governingFormulaLatex: "V = I \\times R \\implies I = \\frac{V}{R}",
    procedureSummary: [
      "Assembled a series DC circuit consisting of a variable DC voltage supply, precision resistor, SPST knife switch, and digital ammeter.",
      "Varying applied voltage across set resistance values while recording theoretical and observed currents.",
      "Injected and isolated open circuit discontinuities and instrumental calibration gain errors."
    ],
    expectedConclusionTemplate: "The experimental measurements verify that current is directly proportional to applied voltage and inversely proportional to resistance in adherence with Ohm's Law. Fault diagnosis successfully isolated open circuit discontinuities (0.00 A) from systematic instrument calibration offsets (+150%)."
  },

  validateTopology: validateSeriesCircuitTopology,
  simulate: simulateOhmsLaw
};
