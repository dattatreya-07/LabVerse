'use client';

import React from 'react';
import { SimulationResult } from '@/types';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface LiveGaugesProps {
  result: SimulationResult | null;
  theme?: 'dark' | 'light';
}

export const LiveGauges: React.FC<LiveGaugesProps> = ({ result, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  if (!result || result.measurements.length === 0) {
    return (
      <div className={`p-4 rounded-xl border text-center text-xs ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
      }`}>
        Assemble apparatus and click <strong>Run Experiment</strong> to observe live measurements.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {result.measurements.map((meas) => {
        const isFaulted = Math.abs(meas.observedValue - meas.theoreticalValue) > 0.01;
        return (
          <div
            key={meas.id}
            className={`p-3.5 rounded-xl border space-y-1 transition-all ${
              isFaulted
                ? isDark
                  ? 'bg-rose-950/40 border-rose-800/80 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                  : 'bg-rose-50 border-rose-300 shadow-sm'
                : isDark
                ? 'bg-slate-900 border-slate-800'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{meas.label}</span>
              {isFaulted ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>

            <div className={`text-xl font-extrabold font-mono ${
              isFaulted
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-cyan-600 dark:text-cyan-400'
            }`}>
              {meas.observedValue.toFixed(meas.precision ?? 2)}{' '}
              <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {meas.unit}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] opacity-70">
              <span>Theo: {meas.theoreticalValue.toFixed(meas.precision ?? 2)} {meas.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
