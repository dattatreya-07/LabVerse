'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ObservationRecord, AnalysisDefinition } from '@/types';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { LineChart as ChartIcon, Info, Sparkles, SlidersHorizontal, Calculator, TrendingUp, CheckCircle2 } from 'lucide-react';
import { MathFormula } from '@/components/ui/MathFormula';

interface AnalysisChartProps {
  observations: ObservationRecord[];
  analysis?: AnalysisDefinition;
  theme?: 'dark' | 'light';
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({
  observations = [],
  analysis,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Collect all available parameter and measurement keys
  const { availableXKeys, availableYKeys } = useMemo(() => {
    const xKeys = new Set<string>();
    const yKeys = new Set<string>();

    observations.forEach((obs) => {
      if (obs.parameters) {
        Object.keys(obs.parameters).forEach((k) => xKeys.add(k));
      }
      if (obs.measurements) {
        Object.keys(obs.measurements).forEach((k) => {
          xKeys.add(k);
          yKeys.add(k);
        });
      }
    });

    return {
      availableXKeys: Array.from(xKeys),
      availableYKeys: Array.from(yKeys),
    };
  }, [observations]);

  // Selected axes state (default to analysis definition if valid, else fall back)
  const defaultX = useMemo(() => {
    if (analysis?.xAxisKey && availableXKeys.includes(analysis.xAxisKey)) {
      return analysis.xAxisKey;
    }
    return availableXKeys[0] || 'x';
  }, [analysis, availableXKeys]);

  const defaultY = useMemo(() => {
    if (analysis?.yAxisKey && availableYKeys.includes(analysis.yAxisKey)) {
      return analysis.yAxisKey;
    }
    return availableYKeys[0] || 'y';
  }, [analysis, availableYKeys]);

  const [selectedXKey, setSelectedXKey] = useState<string>(defaultX);
  const [selectedYKey, setSelectedYKey] = useState<string>(defaultY);

  // Sync state if default changes
  useEffect(() => {
    if (defaultX && !availableXKeys.includes(selectedXKey)) {
      setSelectedXKey(defaultX);
    }
    if (defaultY && !availableYKeys.includes(selectedYKey)) {
      setSelectedYKey(defaultY);
    }
  }, [defaultX, defaultY, availableXKeys, availableYKeys, selectedXKey, selectedYKey]);

  // Transform observations into chart series
  const { chartData, stats } = useMemo(() => {
    if (!observations || observations.length === 0) {
      return { chartData: [], stats: null };
    }

    const data = observations.map((obs, idx) => {
      const xRaw =
        obs.parameters?.[selectedXKey] ??
        obs.measurements?.[selectedXKey] ??
        obs.runIndex ??
        idx + 1;
      
      const yObsRaw =
        obs.measurements?.[selectedYKey] ??
        obs.parameters?.[selectedYKey] ??
        0;

      const yTheoRaw =
        obs.theoreticalValues?.[selectedYKey] ??
        yObsRaw;

      const xVal = Number(xRaw) || 0;
      const yObs = Number(yObsRaw) || 0;
      const yTheo = Number(yTheoRaw) || 0;

      return {
        x: xVal,
        theoretical: yTheo,
        observed: yObs,
        runIndex: obs.runIndex ?? idx + 1,
        faults: (obs.faultsActive || []).join(', '),
      };
    }).sort((a, b) => a.x - b.x);

    // Calculate Linear Regression statistics (m, c, R²)
    if (data.length >= 2) {
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
      for (const pt of data) {
        sumX += pt.x;
        sumY += pt.observed;
        sumXY += pt.x * pt.observed;
        sumX2 += pt.x * pt.x;
        sumY2 += pt.observed * pt.observed;
      }
      const denom = (n * sumX2 - sumX * sumX);
      const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
      const intercept = (sumY - slope * sumX) / n;

      // R^2 calculation
      const numR = (n * sumXY - sumX * sumY);
      const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      const r2 = denR !== 0 ? Math.pow(numR / denR, 2) : 1;

      return {
        chartData: data,
        stats: {
          slope: Number(slope.toFixed(4)),
          intercept: Number(intercept.toFixed(4)),
          r2: Number(r2.toFixed(4)),
          points: n,
        },
      };
    }

    return {
      chartData: data,
      stats: {
        slope: 0,
        intercept: 0,
        r2: 1,
        points: data.length,
      },
    };
  }, [observations, selectedXKey, selectedYKey]);

  if (!mounted) {
    return (
      <div className={`rounded-2xl border p-8 text-center animate-pulse ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        Loading Empirical vs. Theoretical Plot Engine...
      </div>
    );
  }

  const xLabel = selectedXKey === analysis?.xAxisKey ? analysis.xAxisLabel : selectedXKey.replace('_', ' ').toUpperCase();
  const yLabel = selectedYKey === analysis?.yAxisKey ? analysis.yAxisLabel : selectedYKey.replace('_meas', '').replace('_', ' ').toUpperCase();
  const xUnit = selectedXKey === analysis?.xAxisKey ? (analysis.xAxisUnit || '') : '';
  const yUnit = selectedYKey === analysis?.yAxisKey ? (analysis.yAxisUnit || '') : '';

  return (
    <div className={`rounded-2xl border p-5 space-y-5 shadow-xl transition-all ${
      isDark ? 'bg-slate-900 border-slate-800 shadow-cyan-950/20' : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      
      {/* Header & Axis Selection Toolbar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
            <ChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              Empirical vs. Theoretical Analysis Plot
            </h3>
            <p className="text-[11px] opacity-60">
              Real-time calibration curves and mathematical regression
            </p>
          </div>
        </div>

        {/* Dynamic Axis Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <SlidersHorizontal className="w-3 h-3 text-cyan-500" />
            <span className="text-[10px] font-bold uppercase opacity-60">X:</span>
            <select
              value={selectedXKey}
              onChange={(e) => setSelectedXKey(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer text-cyan-600 dark:text-cyan-400 text-xs"
            >
              {availableXKeys.length > 0 ? (
                availableXKeys.map((k) => (
                  <option key={k} value={k} className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>
                    {k === analysis?.xAxisKey ? `${analysis.xAxisLabel} (${k})` : k}
                  </option>
                ))
              ) : (
                <option value="x">Parameter X</option>
              )}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase opacity-60">Y:</span>
            <select
              value={selectedYKey}
              onChange={(e) => setSelectedYKey(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer text-emerald-600 dark:text-emerald-400 text-xs"
            >
              {availableYKeys.length > 0 ? (
                availableYKeys.map((k) => (
                  <option key={k} value={k} className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>
                    {k === analysis?.yAxisKey ? `${analysis.yAxisLabel} (${k})` : k}
                  </option>
                ))
              ) : (
                <option value="y">Measurement Y</option>
              )}
            </select>
          </div>

          {analysis?.expectedSlopeFormula && (
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <MathFormula formula={analysis.expectedSlopeFormula} className="text-xs" />
            </div>
          )}
        </div>
      </div>

      {/* Regression & Statistics Bar */}
      {stats && stats.points > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase opacity-60 flex items-center space-x-1">
              <Calculator className="w-3 h-3 text-cyan-500" />
              <span>Data Points</span>
            </span>
            <span className="text-sm font-bold text-cyan-500">{stats.points} Recorded</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase opacity-60 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>Regression Slope (m)</span>
            </span>
            <span className="text-sm font-bold text-emerald-500">{stats.slope}</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase opacity-60 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Y-Intercept (c)</span>
            </span>
            <span className="text-sm font-bold text-amber-500">{stats.intercept}</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase opacity-60 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-violet-500" />
              <span>Goodness of Fit R²</span>
            </span>
            <span className="text-sm font-bold text-violet-400">{(stats.r2 * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* Recharts Canvas */}
      <div className="w-full h-80 pt-2">
        {chartData.length === 0 ? (
          <div className={`w-full h-full flex flex-col items-center justify-center text-xs space-y-2 rounded-xl border border-dashed ${
            isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
          }`}>
            <ChartIcon className="w-8 h-8 opacity-40 animate-pulse text-cyan-500" />
            <p>No measurement runs recorded yet.</p>
            <p className="text-[11px] opacity-75">Adjust apparatus parameters and click <strong>Run Experiment</strong> in the Workbench.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#cbd5e1"} opacity={0.5} />
              <XAxis
                dataKey="x"
                stroke={isDark ? "#94a3b8" : "#64748b"}
                fontSize={11}
                unit={xUnit ? ` ${xUnit}` : ''}
                label={{
                  value: `${xLabel} ${xUnit ? `(${xUnit})` : ''}`,
                  position: 'insideBottom',
                  offset: -15,
                  fill: isDark ? '#94a3b8' : '#64748b',
                  fontSize: 11,
                  fontWeight: 600
                }}
              />
              <YAxis
                stroke={isDark ? "#94a3b8" : "#64748b"}
                fontSize={11}
                unit={yUnit ? ` ${yUnit}` : ''}
                label={{
                  value: `${yLabel} ${yUnit ? `(${yUnit})` : ''}`,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fill: isDark ? '#94a3b8' : '#64748b',
                  fontSize: 11,
                  fontWeight: 600
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#090d16' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#cbd5e1',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                }}
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                formatter={(val: any, name: any) => [
                  `${val} ${yUnit}`,
                  name === 'theoretical' ? 'Theoretical Curve' : 'Observed Instrument Reading'
                ]}
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                labelFormatter={(lbl: any) => `${xLabel}: ${lbl} ${xUnit}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              
              <Line
                type="monotone"
                dataKey="theoretical"
                name="Theoretical Curve"
                stroke="#06b6d4"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3.5, fill: '#06b6d4' }}
              />

              <Line
                type="monotone"
                dataKey="observed"
                name="Observed Instrument Readings"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#f43f5e' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Theoretical Description Card */}
      {analysis?.theoreticalRelationshipDescription && (
        <div className={`flex items-start space-x-2.5 text-xs p-3.5 rounded-xl border ${
          isDark ? 'text-slate-300 bg-slate-950/80 border-slate-800' : 'text-slate-700 bg-slate-50 border-slate-200'
        }`}>
          <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{analysis.theoreticalRelationshipDescription}</p>
        </div>
      )}

    </div>
  );
};
