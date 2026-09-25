'use client';

import React from 'react';
import { CircuitInput, FaultType } from '@/types';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Zap, Sliders } from 'lucide-react';
import { VOLTAGE_MIN, VOLTAGE_MAX, RESISTANCE_MIN, RESISTANCE_MAX } from '@/lib/simulation/engine';

interface LabControlsProps {
  input: CircuitInput;
  onChangeInput: (newInput: CircuitInput) => void;
  onRunSimulation: () => void;
  onResetControls: () => void;
  onInjectFault: (fault: FaultType) => void;
  theme?: 'dark' | 'light';
}

export const LabControls: React.FC<LabControlsProps> = ({
  input,
  onChangeInput,
  onRunSimulation,
  onResetControls,
  onInjectFault,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const handleVoltageChange = (v: number) => {
    const clamped = Math.max(VOLTAGE_MIN, Math.min(VOLTAGE_MAX, v));
    onChangeInput({ ...input, voltage: clamped });
  };

  const handleResistanceChange = (r: number) => {
    const clamped = Math.max(RESISTANCE_MIN, Math.min(RESISTANCE_MAX, r));
    onChangeInput({ ...input, resistance: clamped });
  };

  return (
    <div className={`rounded-2xl border p-5 space-y-6 shadow-xl transition-colors ${
      isDark
        ? 'bg-slate-900 border-slate-800'
        : 'bg-white border-slate-200/90 shadow-slate-200/60'
    }`}>
      
      {/* Panel Header */}
      <div className={`flex items-center justify-between border-b pb-3 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center space-x-2 ${
          isDark ? 'text-slate-100' : 'text-slate-800'
        }`}>
          <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Interactive Circuit Parameters</span>
        </h3>
        <button
          onClick={onResetControls}
          className={`text-xs transition-colors flex items-center space-x-1 ${
            isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Control 1: Voltage Slider & Numeric Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className={`font-semibold flex items-center space-x-1.5 ${
            isDark ? 'text-slate-200' : 'text-slate-700'
          }`}>
            <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Applied DC Voltage (V)</span>
          </label>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min={VOLTAGE_MIN}
              max={VOLTAGE_MAX}
              step="0.5"
              value={input.voltage}
              onChange={(e) => handleVoltageChange(parseFloat(e.target.value) || 0)}
              className={`w-16 px-2 py-1 rounded font-mono font-bold text-center text-xs focus:outline-none focus:border-cyan-500 border ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-cyan-400'
                  : 'bg-slate-50 border-slate-300 text-cyan-700'
              }`}
            />
            <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>V</span>
          </div>
        </div>

        <input
          type="range"
          min={VOLTAGE_MIN}
          max={VOLTAGE_MAX}
          step="0.5"
          value={input.voltage}
          onChange={(e) => handleVoltageChange(parseFloat(e.target.value))}
          className={`w-full accent-cyan-500 h-2 rounded cursor-pointer ${
            isDark ? 'bg-slate-950' : 'bg-slate-200'
          }`}
        />

        {/* Quick Voltage Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[3, 6, 12, 18, 24, 30].map((v) => (
            <button
              key={v}
              onClick={() => handleVoltageChange(v)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                input.voltage === v
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : isDark
                  ? 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {v}V
            </button>
          ))}
        </div>
      </div>

      {/* Control 2: Resistance Slider & Numeric Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className={`font-semibold flex items-center space-x-1.5 ${
            isDark ? 'text-slate-200' : 'text-slate-700'
          }`}>
            <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Circuit Resistance (R)</span>
          </label>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min={RESISTANCE_MIN}
              max={RESISTANCE_MAX}
              step="1"
              value={input.resistance}
              onChange={(e) => handleResistanceChange(parseFloat(e.target.value) || 1)}
              className={`w-20 px-2 py-1 rounded font-mono font-bold text-center text-xs focus:outline-none focus:border-emerald-500 border ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-emerald-400'
                  : 'bg-slate-50 border-slate-300 text-emerald-700'
              }`}
            />
            <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ω</span>
          </div>
        </div>

        <input
          type="range"
          min={RESISTANCE_MIN}
          max={RESISTANCE_MAX}
          step="1"
          value={input.resistance}
          onChange={(e) => handleResistanceChange(parseFloat(e.target.value))}
          className={`w-full accent-emerald-500 h-2 rounded cursor-pointer ${
            isDark ? 'bg-slate-950' : 'bg-slate-200'
          }`}
        />

        {/* Quick Resistance Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[10, 20, 50, 100, 250, 500, 1000].map((r) => (
            <button
              key={r}
              onClick={() => handleResistanceChange(r)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                input.resistance === r
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : isDark
                  ? 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {r}Ω
            </button>
          ))}
        </div>
      </div>

      {/* Fault Injection Selector */}
      <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <label className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Fault Injection Mode</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => onInjectFault('NORMAL')}
            className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex flex-col justify-between ${
              input.faultType === 'NORMAL'
                ? isDark
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-sm'
                : isDark
                ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Normal Circuit</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className={`text-[10px] font-normal mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Clean physics (I = V/R)
            </span>
          </button>

          <button
            onClick={() => onInjectFault('OPEN_CIRCUIT')}
            className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex flex-col justify-between ${
              input.faultType === 'OPEN_CIRCUIT'
                ? isDark
                  ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  : 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-sm'
                : isDark
                ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Open Circuit</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <span className={`text-[10px] font-normal mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Broken wire (0A current)
            </span>
          </button>

          <button
            onClick={() => onInjectFault('METER_FAULT')}
            className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex flex-col justify-between ${
              input.faultType === 'METER_FAULT'
                ? isDark
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-sm'
                : isDark
                ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Meter Fault</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className={`text-[10px] font-normal mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Meter miscalibrated (2.5x)
            </span>
          </button>
        </div>
      </div>

      {/* Primary Action Button: Run Experiment */}
      <div className="pt-2">
        <button
          onClick={onRunSimulation}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center space-x-2 uppercase tracking-wider"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run Simulation & Log Reading</span>
        </button>
      </div>

    </div>
  );
};
