/**
 * Data Export Engine for LabVerse Virtual Laboratory
 * Generates standards-compliant CSV and Jupyter Notebook (.ipynb) format with
 * executable Python plotting and mathematical regression models.
 */

import { ObservationRecord, ExperimentDefinition } from '@/types';

/**
 * Triggers a browser file download for a generated blob
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports empirical observation runs to CSV format
 */
export function exportObservationsToCSV(
  observations: ObservationRecord[],
  experiment: ExperimentDefinition
): void {
  if (!observations || observations.length === 0) {
    alert('No observation runs recorded yet. Run a simulation to log data before exporting.');
    return;
  }

  // Determine dynamic column keys
  const paramKeys = Object.keys(observations[0].parameters || {});
  const measKeys = Object.keys(observations[0].measurements || {});
  const theoKeys = Object.keys(observations[0].theoreticalValues || {});

  // Header row
  const headers = [
    'Run_Index',
    'Timestamp',
    ...paramKeys.map(k => `Param_${k}`),
    ...measKeys.map(k => `Measured_${k}`),
    ...theoKeys.map(k => `Theoretical_${k}`),
    'Active_Faults',
    'Topology_State',
    'Notes',
  ];

  const rows = observations.map((obs) => {
    const pVals = paramKeys.map(k => obs.parameters[k] ?? '');
    const mVals = measKeys.map(k => obs.measurements[k] ?? '');
    const tVals = theoKeys.map(k => obs.theoreticalValues[k] ?? '');
    const faults = (obs.faultsActive || []).join(';') || 'NONE';
    const topology = obs.circuitTopology || 'NORMAL';
    const notes = `"${(obs.notes || '').replace(/"/g, '""')}"`;

    return [
      obs.runIndex,
      obs.timestamp,
      ...pVals,
      ...mVals,
      ...tVals,
      faults,
      topology,
      notes,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const filename = `${experiment.id}_observations_${Date.now()}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Exports observation data as an interactive Jupyter Notebook (.ipynb v4)
 * with Pandas, Matplotlib, and SciPy curve-fitting scripts.
 */
export function exportToJupyterNotebook(
  observations: ObservationRecord[],
  experiment: ExperimentDefinition
): void {
  const xKey = experiment.analysis?.xAxisKey || 'voltage';
  const yKey = experiment.analysis?.yAxisKey || 'current';
  const xLabel = experiment.analysis?.xAxisLabel || 'Independent Variable';
  const yLabel = experiment.analysis?.yAxisLabel || 'Dependent Variable';
  const xUnit = experiment.analysis?.xAxisUnit || '';
  const yUnit = experiment.analysis?.yAxisUnit || '';

  // Extract empirical coordinate pairs
  const xData: number[] = [];
  const yDataObs: number[] = [];
  const yDataTheo: number[] = [];

  observations.forEach(o => {
    const xVal = o.parameters[xKey] ?? o.measurements[xKey];
    const yObs = o.measurements[yKey];
    const yTheo = o.theoreticalValues[yKey];

    if (typeof xVal === 'number' && typeof yObs === 'number') {
      xData.push(xVal);
      yDataObs.push(yObs);
      yDataTheo.push(typeof yTheo === 'number' ? yTheo : yObs);
    }
  });

  // Construct Jupyter Notebook JSON structure (v4)
  const notebook = {
    cells: [
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          `# ${experiment.title} — Laboratory Data Analysis\n`,
          `**Domain**: ${experiment.domain}  \n`,
          `**Platform**: LabVerse Virtual Laboratory  \n`,
          `**Generated**: ${new Date().toLocaleString()}  \n\n`,
          `## 1. Scientific Theory & Governing Equations\n`,
          `> ${experiment.theory?.corePrinciple || 'Governing physical laws'}\n\n`,
          `$$\n`,
          `${experiment.analysis?.expectedSlopeFormula || 'y = f(x)'}\n`,
          `$$\n\n`,
          `**Learning Objectives:**\n`,
          ...(experiment.learningObjectives || []).map(obj => `- ${obj.description}\n`),
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          `# Import standard scientific computing libraries\n`,
          `import numpy as np\n`,
          `import pandas as pd\n`,
          `import matplotlib.pyplot as plt\n`,
          `from scipy import stats\n`,
          `\n`,
          `# Configure publication-grade plot styles\n`,
          `plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')\n`,
          `plt.rcParams['figure.dpi'] = 120\n`,
          `plt.rcParams['font.size'] = 11\n`,
          `print("Libraries loaded successfully!")\n`,
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          `## 2. Experimental Observations Dataset\n`,
          `The table below contains the empirical measurements recorded during the laboratory session.\n`,
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          `# Load empirical measurements into a Pandas DataFrame\n`,
          `data = {\n`,
          `    "${xKey} (${xUnit})": ${JSON.stringify(xData)},\n`,
          `    "Observed_${yKey} (${yUnit})": ${JSON.stringify(yDataObs)},\n`,
          `    "Theoretical_${yKey} (${yUnit})": ${JSON.stringify(yDataTheo)}\n`,
          `}\n`,
          `df = pd.DataFrame(data)\n`,
          `df.sort_values(by="${xKey} (${xUnit})", inplace=True)\n`,
          `display(df)\n`,
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          `## 3. Statistical Regression & Mathematical Model Fitting\n`,
          `We evaluate the linear relationship, calculate slope, Pearson correlation coefficient ($R^2$), and experimental error margins.\n`,
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          `if len(df) >= 2:\n`,
          `    x = df["${xKey} (${xUnit})"].values\n`,
          `    y = df["Observed_${yKey} (${yUnit})"].values\n`,
          `    \n`,
          `    slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)\n`,
          `    r_squared = r_value**2\n`,
          `    \n`,
          `    print(f"═══════════════════════════════════════")\n`,
          `    print(f" Empirical Model Fit: y = {slope:.4f}x + {intercept:.4f}")\n`,
          `    print(f" Determination Coefficient (R²): {r_squared:.4f}")\n`,
          `    print(f" Standard Error: {std_err:.6f}")\n`,
          `    print(f" Statistical p-value: {p_value:.3e}")\n`,
          `    print(f"═══════════════════════════════════════")\n`,
          `else:\n`,
          `    print("Record at least 2 observation runs to perform regression analysis.")\n`,
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          `## 4. Publication-Quality Comparative Plot\n`,
          `Plotting the empirical measured points against the exact theoretical simulation curve.\n`,
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          `fig, ax = plt.subplots(figsize=(9, 5))\n`,
          `\n`,
          `# Plot observed data scatter points\n`,
          `ax.scatter(df["${xKey} (${xUnit})"], df["Observed_${yKey} (${yUnit})"], color="#FF7448", s=65, label="Empirical Observations", zorder=5, edgecolors="black")\n`,
          `\n`,
          `# Plot theoretical reference curve\n`,
          `ax.plot(df["${xKey} (${xUnit})"], df["Theoretical_${yKey} (${yUnit})"], color="#0284C7", linestyle="--", linewidth=2, label="Theoretical Prediction")\n`,
          `\n`,
          `ax.set_title("${experiment.title} — Empirical vs Theoretical Curve", fontsize=14, fontweight="bold", pad=12)\n`,
          `ax.set_xlabel("${xLabel} (${xUnit})", fontweight="bold")\n`,
          `ax.set_ylabel("${yLabel} (${yUnit})", fontweight="bold")\n`,
          `ax.legend(frameon=True, facecolor="white", edgecolor="#E2E8F0")\n`,
          `ax.grid(True, alpha=0.3, linestyle=":")\n`,
          `\n`,
          `plt.tight_layout()\n`,
          `plt.show()\n`,
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          `## 5. Official Conclusion\n`,
          `> ${experiment.report?.expectedConclusionTemplate || 'The experimental data verifies adherence to the governing physical relationships within standard instrumentation tolerance.'}\n`,
        ]
      }
    ],
    metadata: {
      kernelspec: {
        display_name: 'Python 3',
        language: 'python',
        name: 'python3'
      },
      language_info: {
        codemirror_mode: { name: 'ipython', version: 3 },
        file_extension: '.py',
        mimetype: 'text/x-python',
        name: 'python',
        nbconvert_exporter: 'python',
        pygments_lexer: 'ipython3',
        version: '3.11.0'
      }
    },
    nbformat: 4,
    nbformat_minor: 4
  };

  const jsonString = JSON.stringify(notebook, null, 2);
  const filename = `${experiment.id}_notebook_${Date.now()}.ipynb`;
  downloadFile(jsonString, filename, 'application/x-ipynb+json;charset=utf-8;');
}
