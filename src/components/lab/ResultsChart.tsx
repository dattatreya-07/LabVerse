'use client';

import React from 'react';
import { ObservationRecord } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart as ChartIcon, Info } from 'lucide-react';

interface ResultsChartProps {
  observations: ObservationRecord[];
  currentResistance: number;
  theme?: 'dark' | 'light';
}

export const ResultsChart: React.FC<ResultsChartProps> = ({
  observations,
  currentResistance,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Build chart dataset from observations or fallback voltage sweep (0V to 30V)
  const chartData = observations.length > 0
    ? observations
        .map(obs => ({
          voltage: obs.voltage,
          theoreticalI: Number(obs.theoreticalCurrent.toFixed(3)),
          measuredI: Number(obs.measuredCurrent.toFixed(3)),
          faultType: obs.faultType,
        }))
        .sort((a, b) => a.voltage - b.voltage)
    : [0, 6, 12, 18, 24, 30].map(v => ({
        voltage: v,
        theoreticalI: Number((v / currentResistance).toFixed(3)),
        measuredI: Number((v / currentResistance).toFixed(3)),
        faultType: 'NORMAL',
      }));

  // Calculate empirical slope and resistance for normal runs
  const normalRuns = observations.filter(o => o.faultType === 'NORMAL' && o.voltage > 0);
  let calculatedResistance: number | null = null;
  let errorPercentage: number | null = null;

  if (normalRuns.length > 0) {
    const sumV = normalRuns.reduce((acc, r) => acc + r.voltage, 0);
    const sumI = normalRuns.reduce((acc, r) => acc + r.theoreticalCurrent, 0);
    const avgR = sumV / sumI;
    calculatedResistance = Number(avgR.toFixed(1));
    errorPercentage = Number((Math.abs(avgR - currentResistance) / currentResistance * 100).toFixed(2));
  }

  return (
    <div className={`rounded-2xl border p-5 space-y-4 shadow-xl transition-colors ${
      isDark
        ? 'bg-slate-900 border-slate-800'
        : 'bg-white border-slate-200/90 shadow-slate-200/60'
    }`}>
      
      {/* Chart Title Header */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <ChartIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-100' : 'text-slate-800'
          }`}>
            Current vs. Voltage Linearity (V-I Curve)
          </h3>
        </div>

        {calculatedResistance !== null && (
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Slope (1/R) → R<sub>calc</sub> =</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{calculatedResistance} Ω</span>
            <span className={isDark ? 'text-slate-500' : 'text-slate-300'}>|</span>
            <span className="text-cyan-600 dark:text-cyan-400">Error: {errorPercentage}%</span>
          </div>
        )}
      </div>

      {/* Recharts Canvas */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#cbd5e1"} opacity={0.6} />
            <XAxis
              dataKey="voltage"
              stroke={isDark ? "#94a3b8" : "#64748b"}
              fontSize={11}
              unit="V"
              label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -12, fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
            />
            <YAxis
              stroke={isDark ? "#94a3b8" : "#64748b"}
              fontSize={11}
              unit="A"
              label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', offset: 0, fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
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
              itemStyle={{ color: '#0284c7' }}
              formatter={(val: any, name: any) => [`${val} A`, name === 'theoreticalI' ? 'Theoretical I (V/R)' : 'Measured I']}
              labelFormatter={(lbl: any) => `Voltage: ${lbl} V`}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            
            {/* Theoretical Linear Slope Line */}
            <Line
              type="monotone"
              dataKey="theoreticalI"
              name="Theoretical I (V/R)"
              stroke="#0284c7"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#0284c7' }}
            />

            {/* Measured Data Points Line */}
            <Line
              type="monotone"
              dataKey="measuredI"
              name="Measured Ammeter Reading"
              stroke="#e11d48"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#e11d48' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Analytical Footnote */}
      <div className={`flex items-center space-x-2 text-[11px] p-3 rounded-xl border ${
        isDark ? 'text-slate-400 bg-slate-950 border-slate-850' : 'text-slate-600 bg-slate-50 border-slate-200'
      }`}>
        <Info className="w-4 h-4 text-cyan-500 shrink-0" />
        <p>
          In a normal ohmic circuit, the V-I plot is a straight line passing through (0,0). Open circuit faults flatten the measured curve to 0A, while ammeter calibration faults steepen the measured slope beyond theoretical physics.
        </p>
      </div>

    </div>
  );
};
