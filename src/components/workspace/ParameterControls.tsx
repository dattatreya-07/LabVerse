'use client';

import React from 'react';
import { ParameterDefinition, FaultDefinition } from '@/types';
import { Play, Square, RotateCcw, AlertTriangle, ShieldCheck, Sliders, Zap } from 'lucide-react';

interface ParameterControlsProps {
  parameters: ParameterDefinition[];
  parameterValues: Record<string, number>;
  onParameterChange: (id: string, value: number) => void;
  faults?: FaultDefinition[];
  activeFaults: string[];
  onToggleFault: (faultId: string) => void;
  isSimulating: boolean;
  onRunSimulation: () => void;
  onStopSimulation: () => void;
  onResetControls: () => void;
  theme?: 'dark' | 'light';
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  parameters,
  parameterValues,
  onParameterChange,
  faults = [],
  activeFaults,
  onToggleFault,
  isSimulating,
  onRunSimulation,
  onStopSimulation,
  onResetControls,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-2xl border p-5 space-y-6 shadow-xl transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center space-x-2 ${
          isDark ? 'text-slate-100' : 'text-slate-800'
        }`}>
          <Sliders className="w-4 h-4 text-cyan-500" />
          <span>Experiment Parameters</span>
        </h3>

        <button
          onClick={onResetControls}
          className={`text-xs transition-colors flex items-center space-x-1 ${
            isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'
          }`}
          title="Reset Parameters to Default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Dynamic Parameters List */}
      <div className="space-y-4">
        {parameters.map((param) => {
          const val = parameterValues[param.id] ?? param.defaultValue;
          return (
            <div key={param.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className={`font-semibold flex items-center space-x-1.5 ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  <Zap className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{param.label}</span>
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={val}
                    onChange={(e) => onParameterChange(param.id, parseFloat(e.target.value) || param.min)}
                    className={`w-20 px-2 py-1 rounded font-mono font-bold text-center text-xs focus:outline-none focus:border-cyan-500 border ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-cyan-400'
                        : 'bg-slate-50 border-slate-300 text-cyan-700'
                    }`}
                  />
                  <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{param.unit}</span>
                </div>
              </div>

              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={val}
                onChange={(e) => onParameterChange(param.id, parseFloat(e.target.value))}
                className={`w-full accent-cyan-500 h-2 rounded cursor-pointer ${
                  isDark ? 'bg-slate-950' : 'bg-slate-200'
                }`}
              />

              {param.description && (
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {param.description} (Range: {param.min} - {param.max} {param.unit})
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Fault Injection Selector */}
      {faults.length > 0 && (
        <div className={`space-y-2.5 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <label className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Fault Injection & Troubleshooting</span>
            </label>
            {activeFaults.length === 0 ? (
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Normal State
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 animate-pulse">
                Fault Injected
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {faults.map((fault) => {
              const isActive = activeFaults.includes(fault.id);
              return (
                <button
                  key={fault.id}
                  onClick={() => onToggleFault(fault.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                    isActive
                      ? isDark
                        ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-sm'
                      : isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[11px]">{fault.title}</span>
                    <AlertTriangle className={`w-3.5 h-3.5 ${isActive ? 'text-rose-500' : 'opacity-40'}`} />
                  </div>
                  <p className={`text-[9px] line-clamp-1 mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {fault.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Execution Controls */}
      <div className="pt-2 flex items-center gap-3">
        {!isSimulating ? (
          <button
            onClick={onRunSimulation}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center space-x-2 uppercase tracking-wider"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Experiment</span>
          </button>
        ) : (
          <button
            onClick={onStopSimulation}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 uppercase tracking-wider"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Halt / Record Run</span>
          </button>
        )}
      </div>

    </div>
  );
};
