import { ExperimentDefinition } from '@/types';

export const financePortfolioExperiment: ExperimentDefinition = {
  id: 'portfolio-risk',
  title: 'Markowitz Modern Portfolio Theory & Risk Optimization',
  tagline: 'Balance risk-return efficient frontiers, calculate Value-at-Risk (VaR), and maximize Sharpe ratio.',
  domain: 'FINANCE',
  difficulty: 'INTERMEDIATE',
  availability: 'AVAILABLE',
  estimatedMinutes: 20,
  coverIcon: 'TrendingUp',
  summary: 'Construct two-asset portfolios comprising equities and government bonds. Vary capital allocation weights (w₁), asset correlation (ρ), and risk-free rates to maximize the risk-adjusted Sharpe ratio along the Markowitz Efficient Frontier.',

  theory: {
    corePrinciple: 'Diversification reduces unsystematic portfolio variance without sacrificing expected return when assets are imperfectly correlated (ρ < 1). The optimal allocation maximizes the Sharpe Ratio: S = (E(Rp) - Rf) / σp.',
    equations: [
      'E(R_p) = w_1 E(R_1) + (1 - w_1) E(R_2)',
      '\\sigma_p = \\sqrt{w_1^2 \\sigma_1^2 + w_2^2 \\sigma_2^2 + 2 w_1 w_2 \\rho \\sigma_1 \\sigma_2}',
      '\\text{Sharpe} = \\frac{E(R_p) - R_f}{\\sigma_p}'
    ],
    derivation: 'Markowitz quadratic mean-variance portfolio optimization. Computing the tangency portfolio gradient maximizes risk-adjusted capital performance.',
    variableDescriptions: {
      'E(R_p)': 'Expected annual portfolio return (%)',
      '\\sigma_p': 'Annualized portfolio volatility/standard deviation (%)',
      'w_1': 'Weight allocated to equities / growth assets (%)',
      '\\rho': 'Correlation coefficient between assets (-1.0 to +1.0)',
      'R_f': 'Risk-free sovereign Treasury rate (%)'
    }
  },

  learningObjectives: [
    { id: 'obj-f1', description: 'Observe how low asset correlation ρ compresses overall portfolio volatility.', bloomLevel: 'UNDERSTAND' },
    { id: 'obj-f2', description: 'Determine optimal equity/bond weighting w₁ that maximizes the Sharpe Ratio.', bloomLevel: 'APPLY' },
    { id: 'obj-f3', description: 'Evaluate Parametric 95% Daily Value-at-Risk (VaR) under market volatility shocks.', bloomLevel: 'ANALYZE' }
  ],

  equipment: [
    {
      type: 'FINANCE_CHART',
      title: 'Efficient Frontier Risk Optimizer',
      description: 'Dynamic mean-variance curve plotting expected return vs annualized standard deviation.',
      domain: 'FINANCE',
      defaultProperties: { sharpeRatio: 1.85 },
      terminals: [],
      iconName: 'TrendingUp'
    },
    {
      type: 'PORTFOLIO_LEDGER',
      title: 'Risk & Capital Compliance Ledger',
      description: 'Audited accounting ledger tracking capital allocations and regulatory VaR constraints.',
      domain: 'FINANCE',
      defaultProperties: {},
      terminals: [],
      iconName: 'FileSpreadsheet'
    }
  ],

  parameters: [
    {
      id: 'equity_weight',
      label: 'Equity Allocation Weight (w₁)',
      symbol: 'w₁',
      unit: '%',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 60,
      description: 'Percentage of portfolio invested in equities (Asset 1: Return 12%, Volatility 20%)'
    },
    {
      id: 'correlation',
      label: 'Asset Correlation (ρ)',
      symbol: 'ρ',
      unit: '',
      min: -0.8,
      max: 0.8,
      step: 0.1,
      defaultValue: 0.2,
      description: 'Correlation coefficient between Equities and Sovereign Bonds'
    },
    {
      id: 'risk_free_rate',
      label: 'Risk-Free Benchmark (Rf)',
      symbol: 'Rf',
      unit: '%',
      min: 1.0,
      max: 6.0,
      step: 0.5,
      defaultValue: 3.5,
      description: 'Yield on 10-Year Government Treasury notes'
    }
  ],

  workspace: {
    allowedEquipment: ['FINANCE_CHART', 'PORTFOLIO_LEDGER'],
    defaultPreset: {
      components: [
        {
          id: 'fin-chart-1',
          type: 'FINANCE_CHART',
          title: 'Efficient Frontier Risk Optimizer',
          domain: 'FINANCE',
          position: { x: 380, y: 220 },
          terminals: [],
          properties: { sharpeRatio: 1.85 },
          state: {}
        },
        {
          id: 'ledger-1',
          type: 'PORTFOLIO_LEDGER',
          title: 'Risk & Capital Compliance Ledger',
          domain: 'FINANCE',
          position: { x: 580, y: 220 },
          terminals: [],
          properties: {},
          state: {}
        }
      ],
      connections: []
    },
    guidedSteps: [
      { stepNumber: 1, title: 'Set 60/40 Equity/Bond Baseline', instruction: 'Allocate 60% equities and 40% bonds with correlation ρ = 0.2.' },
      { stepNumber: 2, title: 'Observe Risk Diversification', instruction: 'Notice portfolio volatility σ = 13.2% is substantially lower than individual equities (20%).' },
      { stepNumber: 3, title: 'Stress Test Crisis Correlation (ρ = 0.8)', instruction: 'Simulate liquidity contagion shock and observe risk compression breakdown.' }
    ]
  },

  challenges: [
    {
      id: 'ch-f1',
      title: 'Maximize Sharpe Ratio (> 0.65)',
      description: 'Find allocation weight that achieves highest risk-adjusted excess return for Rf = 3.5%.',
      targetMetric: 'sharpe_meas',
      targetValue: 0.68,
      tolerance: 0.05,
      unit: '',
      hint: 'Optimize equity weight around 55% - 65% with correlation ρ = 0.1.'
    }
  ],

  faults: [
    {
      id: 'FAULT_VOLATILITY_SPIKE',
      title: 'Flash Crash Volatility Shock (+100% Equity Volatility)',
      description: 'Sudden liquidity crunch doubles market standard deviation σ₁ from 20% to 40%.',
      applicableComponentTypes: ['FINANCE_CHART'],
      symptoms: ['Portfolio risk spikes and Sharpe ratio collapses'],
      diagnosticHints: ['Rebalance portfolio toward defensive high-grade fixed income bonds'],
      effect: 'PARAM_DEVIATION'
    }
  ],

  analysis: {
    xAxisLabel: 'Equity Weight (w₁)',
    xAxisKey: 'equity_weight',
    xAxisUnit: '%',
    yAxisLabel: 'Expected Return E(Rp)',
    yAxisKey: 'return_meas',
    yAxisUnit: '%',
    expectedSlopeFormula: 'E(R_p) = w_1 R_1 + (1-w_1) R_2',
    theoreticalRelationshipDescription: 'Plotting expected return against portfolio weight maps the linear expected return curve and the parabolic Markowitz variance frontier.'
  },

  tutorContext: {
    experimentId: 'portfolio-risk',
    experimentTitle: 'Modern Portfolio Theory Laboratory',
    learningObjectives: ['Calculate expected return and portfolio variance', 'Optimize Sharpe ratio', 'Understand diversification benefits'],
    governingEquations: ['E(Rp) = w1*R1 + w2*R2', 'sigma_p = sqrt(w1^2*s1^2 + w2^2*s2^2 + 2*w1*w2*rho*s1*s2)', 'Sharpe = (E(Rp) - Rf) / sigma_p'],
    commonMistakes: ['Assuming correlation rho is constant during market drawdowns (correlations tend to converge toward 1 during panic).']
  },

  report: {
    title: 'Modern Portfolio Theory & Asset Allocation Laboratory Report',
    governingFormulaLatex: "\\text{Sharpe Ratio} = \\frac{E(R_p) - R_f}{\\sigma_p}",
    procedureSummary: [
      'Simulated multi-asset portfolio weights and evaluated annualized return and volatility trade-offs.',
      'Derived optimal Capital Allocation Line (CAL) and Maximum Sharpe Ratio portfolio.'
    ],
    expectedConclusionTemplate: 'The empirical simulation demonstrates that multi-asset diversification with correlation ρ < 1 produces a superior risk-adjusted Sharpe ratio compared to any single asset class.'
  },

  validateTopology: () => ({ isValid: true, canSimulate: true, message: 'Portfolio ledger verified and balanced', errors: [], warnings: [] }),
  simulate: (input) => {
    const w1 = (input.parameters['equity_weight'] ?? 60) / 100;
    const w2 = 1 - w1;
    const rho = input.parameters['correlation'] ?? 0.2;
    const rf = input.parameters['risk_free_rate'] ?? 3.5;

    const R1 = 12.0; // Equities expected return 12%
    const R2 = 5.0;  // Bonds expected return 5%

    const isVolShock = input.activeFaults.includes('FAULT_VOLATILITY_SPIKE');
    const s1 = isVolShock ? 40.0 : 20.0; // Equities standard deviation
    const s2 = 6.0;  // Bonds standard deviation

    const expReturn = +(w1 * R1 + w2 * R2).toFixed(2);
    const variance = (w1 * s1) ** 2 + (w2 * s2) ** 2 + 2 * w1 * w2 * rho * s1 * s2;
    const vol = +Math.sqrt(Math.max(0.1, variance)).toFixed(2);
    const sharpe = +((expReturn - rf) / vol).toFixed(2);
    const var95 = +(1.645 * (vol / Math.sqrt(252))).toFixed(2);

    return {
      success: true,
      experimentId: input.experimentId,
      measurements: [
        { id: 'return_meas', label: 'Expected Return E(Rp)', symbol: 'E(Rp)', theoreticalValue: expReturn, simulatedValue: expReturn, observedValue: expReturn, unit: '%' },
        { id: 'vol_meas', label: 'Portfolio Risk (σp)', symbol: 'σp', theoreticalValue: vol, simulatedValue: vol, observedValue: vol, unit: '%' },
        { id: 'sharpe_meas', label: 'Sharpe Ratio (S)', symbol: 'S', theoreticalValue: sharpe, simulatedValue: sharpe, observedValue: sharpe, unit: '' },
        { id: 'var_meas', label: '1-Day 95% VaR', symbol: 'VaR₉₅', theoreticalValue: var95, simulatedValue: var95, observedValue: var95, unit: '%' }
      ],
      derivedValues: { expReturn, vol, sharpe, var95 },
      visualState: { isOperating: true },
      topology: { isValid: true, canSimulate: true, message: 'Portfolio risk optimized', errors: [], warnings: [] },
      warnings: isVolShock ? [{ code: 'WARN_VOL_SHOCK', message: 'Volatility Shock active: Equity variance increased 100%.' }] : [],
      errors: [],
      timestamp: new Date().toISOString()
    };
  }
};
