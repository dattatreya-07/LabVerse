'use client';

import React from 'react';
import { SimulationResult } from '@/types';
import { formatCurrent } from '@/lib/simulation/engine';
import { Zap, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface LiveReadingsProps {
  result: SimulationResult | null;
  theme?: 'dark' | 'light';
}

export const LiveReadings: React.FC<LiveReadingsProps> = ({ result, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  if (!result) {
    return (
      <div className={`p-6 rounded-2xl border text-center text-xs transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
      }`}>
        No simulation run executed yet. Click <strong>Run Simulation</strong> to record readings.
      </div>
    );
  }

  const { voltage, resistance, theoreticalCurrent, measuredCurrent, faultType } = result;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Gauge 1: Applied Voltage */}
      <div className={`p-4 rounded-xl border space-y-1 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <span className={`text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span>Applied Voltage (V)</span>
          <Zap className="w-3.5 h-3.5 text-cyan-500" />
        </span>
        <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
          {voltage.toFixed(2)} <span className={`text-sm font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>V</span>
        </div>
        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>DC Voltage Source</p>
      </div>

      {/* Gauge 2: Set Resistance */}
      <div className={`p-4 rounded-xl border space-y-1 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <span className={`text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span>Resistance (R)</span>
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
        </span>
        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
          {resistance.toFixed(0)} <span className={`text-sm font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ω</span>
        </div>
        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ohmic Resistor Element</p>
      </div>

      {/* Gauge 3: Theoretical Current (I = V/R) */}
      <div className={`p-4 rounded-xl border space-y-1 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <span className={`text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span>Theoretical Current</span>
          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>V / R</span>
        </span>
        <div className={`text-2xl font-extrabold font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          {formatCurrent(theoreticalCurrent)}
        </div>
        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Physical calculation</p>
      </div>

      {/* Gauge 4: Ammeter Measured Reading */}
      <div className={`p-4 rounded-xl border space-y-1 transition-colors ${
        faultType !== 'NORMAL'
          ? isDark ? 'bg-rose-950/40 border-rose-800/80 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'bg-rose-50 border-rose-300 shadow-sm'
          : isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between text-amber-600 dark:text-amber-300">
          <span>Measured Current</span>
          {faultType !== 'NORMAL' ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          )}
        </span>
        <div className={`text-2xl font-extrabold font-mono ${faultType !== 'NORMAL' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {formatCurrent(measuredCurrent)}
        </div>
        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Digital Ammeter Display</p>
      </div>

    </div>
  );
};
