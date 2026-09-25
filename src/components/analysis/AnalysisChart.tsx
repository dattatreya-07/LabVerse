'use client';

import React from 'react';
import { ObservationRecord, AnalysisDefinition } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart as ChartIcon, Info, Sparkles } from 'lucide-react';

interface AnalysisChartProps {
  observations: ObservationRecord[];
  analysis?: AnalysisDefinition;
  theme?: 'dark' | 'light';
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({
  observations,
  analysis,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  if (!analysis) return null;

  const chartData = observations.map((obs) => {
    const xVal = obs.parameters[analysis.xAxisKey] ?? obs.measurements[analysis.xAxisKey] ?? 0;
    const yTheo = obs.theoreticalValues[analysis.yAxisKey] ?? 0;
    const yObs = obs.measurements[analysis.yAxisKey] ?? 0;

    return {
      x: xVal,
      theoretical: yTheo,
      observed: yObs,
      faults: obs.faultsActive.join(', '),
    };
  }).sort((a, b) => a.x - b.x);

  return (
    <div className={`rounded-2xl border p-5 space-y-4 shadow-xl transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <ChartIcon className="w-4 h-4 text-cyan-500" />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-100' : 'text-slate-800'
          }`}>
            Empirical vs. Theoretical Analysis Plot
          </h3>
        </div>

        <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{analysis.expectedSlopeFormula}</span>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="w-full h-72 pt-2">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs opacity-50">
            Record experiment data points to populate analytical curve.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#cbd5e1"} opacity={0.6} />
              <XAxis
                dataKey="x"
                stroke={isDark ? "#94a3b8" : "#64748b"}
                fontSize={11}
                unit={analysis.xAxisUnit}
                label={{ value: analysis.xAxisLabel, position: 'insideBottom', offset: -12, fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke={isDark ? "#94a3b8" : "#64748b"}
                fontSize={11}
                unit={analysis.yAxisUnit}
                label={{ value: analysis.yAxisLabel, angle: -90, position: 'insideLeft', offset: 0, fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(val: any, name: any) => [`${val} ${analysis.yAxisUnit}`, name === 'theoretical' ? 'Theoretical Curve' : 'Observed Data Point']}
                labelFormatter={(lbl: any) => `${analysis.xAxisLabel}: ${lbl} ${analysis.xAxisUnit}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              
              <Line
                type="monotone"
                dataKey="theoretical"
                name="Theoretical Curve"
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#0284c7' }}
              />

              <Line
                type="monotone"
                dataKey="observed"
                name="Observed Instrument Readings"
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#e11d48' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footnote */}
      <div className={`flex items-center space-x-2 text-[11px] p-3 rounded-xl border ${
        isDark ? 'text-slate-400 bg-slate-950 border-slate-850' : 'text-slate-600 bg-slate-50 border-slate-200'
      }`}>
        <Info className="w-4 h-4 text-cyan-500 shrink-0" />
        <p>{analysis.theoreticalRelationshipDescription}</p>
      </div>

    </div>
  );
};
