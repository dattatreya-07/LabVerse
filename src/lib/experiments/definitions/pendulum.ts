import { ExperimentDefinition } from '@/types';
import { simulatePendulum } from '@/lib/simulation/mechanics/pendulum-sim';

export const pendulumExperiment: ExperimentDefinition = {
  id: 'gravity-pendulum',
  title: 'Variable-Gravity Simple Pendulum',
  tagline: 'Explore harmonic motion and planetary gravitational acceleration.',
  domain: 'MECHANICS',
  difficulty: 'BEGINNER',
  availability: 'AVAILABLE',
  estimatedMinutes: 20,
  coverIcon: 'Activity',
  summary: 'Measure oscillation period as a function of string length across planetary gravitational environments (Earth, Moon, Mars, Jupiter) to calculate gravitational acceleration g.',
  
  theory: {
    corePrinciple: 'A simple pendulum consists of a point mass suspended by a massless string undergoing simple harmonic motion for small angular displacements.',
    equations: [
      'T = 2\\pi \\sqrt{\\frac{L}{g}}',
      'g = 4\\pi^2 \\frac{L}{T^2}',
      'f = \\frac{1}{T}'
    ],
    derivation: 'Restoring torque tau = -m*g*L*sin(theta) approx -m*g*L*theta for small theta (< 15 deg). Solving the second-order differential equation yields angular frequency omega = sqrt(g/L), period T = 2*pi / omega.',
    variableDescriptions: {
      'T': 'Period of one full oscillation cycle (seconds, s)',
      'L': 'Effective length of pendulum string (meters, m)',
      'g': 'Local gravitational acceleration (m/s²)',
      'f': 'Oscillation frequency (Hertz, Hz)'
    }
  },

  learningObjectives: [
    { id: 'obj-p1', description: 'Investigate the square-root proportionality between pendulum length and period.', bloomLevel: 'UNDERSTAND' },
    { id: 'obj-p2', description: 'Determine local gravitational acceleration g from the slope of a T² vs L plot.', bloomLevel: 'APPLY' },
    { id: 'obj-p3', description: 'Compare harmonic periods across Earth (9.81 m/s²), Moon (1.62 m/s²), and Jupiter (24.79 m/s²).', bloomLevel: 'ANALYZE' }
  ],

  equipment: [
    {
      type: 'PENDULUM',
      title: 'Suspended Pendulum Bob',
      description: 'Adjustable length cord with brass sphere bob.',
      domain: 'MECHANICS',
      defaultProperties: { length: 1.0, mass: 0.5 },
      terminals: [],
      iconName: 'Activity'
    },
    {
      type: 'STOPWATCH',
      title: 'Precision Digital Stopwatch',
      description: 'Millisecond timer with lap gate trigger.',
      domain: 'MECHANICS',
      defaultProperties: {},
      terminals: [],
      iconName: 'Timer'
    }
  ],

  parameters: [
    {
      id: 'length',
      label: 'String Length (L)',
      symbol: 'L',
      unit: 'm',
      min: 0.1,
      max: 4.0,
      step: 0.1,
      defaultValue: 1.0,
      description: 'Length of cord from pivot to center of mass'
    },
    {
      id: 'gravity',
      label: 'Gravitational Field (g)',
      symbol: 'g',
      unit: 'm/s²',
      min: 1.62,
      max: 25.0,
      step: 0.01,
      defaultValue: 9.81,
      description: 'Local gravity (Earth: 9.81, Moon: 1.62, Mars: 3.71, Jupiter: 24.79)'
    }
  ],

  workspace: {
    allowedEquipment: ['PENDULUM', 'STOPWATCH', 'RULER'],
    guidedSteps: [
      { stepNumber: 1, title: 'Set String Length L = 1.0 m', instruction: 'Set length to 1.0m on Earth (g = 9.81 m/s²).' },
      { stepNumber: 2, title: 'Measure Period T', instruction: 'Run the timer and observe theoretical period T = 2.006 s.' },
      { stepNumber: 3, title: 'Change Gravity to Moon (1.62 m/s²)', instruction: 'Observe how lower gravity drastically increases period to ~4.94 s.' }
    ]
  },

  challenges: [
    {
      id: 'ch-p1',
      title: 'Exact 2-Second Grandfather Clock',
      description: 'Adjust string length on Earth to create a period of exactly 2.00 seconds.',
      targetMetric: 'period_meas',
      targetValue: 2.00,
      tolerance: 0.02,
      unit: 's',
      hint: 'L = g * (T / (2 * pi))^2 = 9.81 * (2 / (2 * pi))^2 = 0.994 m.'
    }
  ],

  faults: [
    {
      id: 'FAULT_TIMER_CALIBRATION',
      title: 'Stopwatch Calibration Error (+25%)',
      description: 'Digital timer oscillator is running slower than standard reference time.',
      applicableComponentTypes: ['STOPWATCH'],
      symptoms: ['Measured period is higher than theoretical 2*pi*sqrt(L/g)'],
      diagnosticHints: ['Cross verify timer with calibrated standard clock'],
      effect: 'CALIBRATION_DRIFT'
    }
  ],

  analysis: {
    xAxisLabel: 'String Length (L)',
    xAxisKey: 'length',
    xAxisUnit: 'm',
    yAxisLabel: 'Period Squared (T²)',
    yAxisKey: 'period_meas',
    yAxisUnit: 's²',
    expectedSlopeFormula: 'Slope = 4*pi² / g',
    theoreticalRelationshipDescription: 'Plotting T² against L yields a linear graph with slope 4*pi²/g. Calculating g = 4*pi² / slope verifies gravitational acceleration.'
  },

  tutorContext: {
    experimentId: 'gravity-pendulum',
    experimentTitle: 'Variable Gravity Pendulum Laboratory',
    learningObjectives: ['Verify T = 2*pi*sqrt(L/g)', 'Measure g from slope', 'Analyze planetary gravity effects'],
    governingEquations: ['T = 2*pi*sqrt(L/g)', 'g = 4*pi^2 * L / T^2'],
    commonMistakes: ['Assuming mass changes the period (mass cancels out in simple pendulum equations).']
  },

  report: {
    title: 'Harmonic Motion and Gravitational Acceleration Report',
    governingFormulaLatex: "T = 2\\pi \\sqrt{\\frac{L}{g}}",
    procedureSummary: [
      'Measured oscillation period of simple pendulum across variable lengths and gravity environments.',
      'Plotted T² versus L and calculated local gravitational acceleration.'
    ],
    expectedConclusionTemplate: 'The empirical measurements confirm that the square of the oscillation period is directly proportional to length and inversely proportional to gravitational acceleration.'
  },

  validateTopology: () => ({ isValid: true, canSimulate: true, message: 'Pendulum setup valid', errors: [], warnings: [] }),
  simulate: simulatePendulum
};
