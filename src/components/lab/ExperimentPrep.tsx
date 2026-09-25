'use client';

import React from 'react';
import { BookOpen, CheckSquare, Square, Zap, ShieldAlert, Cpu, ArrowRight, Play } from 'lucide-react';

interface ExperimentPrepProps {
  completedSteps: number[];
  onToggleStep: (stepId: number) => void;
  onGoToLab: () => void;
  theme?: 'dark' | 'light';
}

export const ExperimentPrep: React.FC<ExperimentPrepProps> = ({
  completedSteps,
  onToggleStep,
  onGoToLab,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const steps = [
    {
      id: 1,
      title: 'Baseline Setup & Parameter Selection',
      desc: 'Set initial DC voltage to 6.0 V and load resistance to 20.0 Ω in normal circuit state.',
    },
    {
      id: 2,
      title: 'Execute Normal Run & Measure Baseline Current',
      desc: 'Run the simulation. Verify that theoretical current equals physical and measured current (0.30 A).',
    },
    {
      id: 3,
      title: 'Sweep Voltage to Plot Linearity (V-I Curve)',
      desc: 'Increase voltage in increments (6V, 12V, 18V, 24V, 30V) and observe linear current response.',
    },
    {
      id: 4,
      title: 'Inject Open Circuit Fault & Diagnose Discontinuity',
      desc: 'Switch fault mode to Open Circuit. Observe that current drops to 0.00 A despite applied voltage.',
    },
    {
      id: 5,
      title: 'Inject Ammeter Calibration Fault & Verify Instrument Error',
      desc: 'Switch to Meter Fault mode. Compare erroneous meter reading (2.5x) against true theoretical I = V/R.',
    },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Title Header */}
      <div className={`p-6 rounded-2xl border space-y-2 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Experiment Preparation & Theory Guide</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          Ohm's Law Verification & Fault Diagnosis Protocol
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Master the mathematical foundation, apparatus topology, safety rules, and procedure before operating the virtual circuit.
        </p>
      </div>

      {/* Governing Equations Cards */}
      <div className="space-y-4">
        <h2 className={`text-lg font-bold flex items-center space-x-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <Zap className="w-5 h-5 text-cyan-500" />
          <span>Governing Equation & Parameter Relationships</span>
        </h2>

        <div className={`p-6 rounded-2xl border text-center space-y-3 transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-cyan-500/30'
            : 'bg-gradient-to-r from-sky-50 via-indigo-50/50 to-sky-50 border-cyan-300 shadow-sm'
        }`}>
          <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-600 dark:from-cyan-400 dark:via-sky-200 dark:to-indigo-300 tracking-widest font-mono">
            V = I × R
          </div>
          <p className={`text-xs sm:text-sm max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            The electrical current (I) flowing through a conductor is directly proportional to the applied potential difference (V) and inversely proportional to the resistance (R).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border space-y-1 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">VOLTAGE (V)</span>
            <p className={`text-lg font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>V = I × R</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Potential difference across circuit terminals, measured in Volts (V).</p>
          </div>

          <div className={`p-4 rounded-xl border space-y-1 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">CURRENT (I)</span>
            <p className={`text-lg font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>I = V / R</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Flow rate of electric charge through the conductor, measured in Amperes (A).</p>
          </div>

          <div className={`p-4 rounded-xl border space-y-1 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">RESISTANCE (R)</span>
            <p className={`text-lg font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>R = V / I</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Opposition to electrical charge movement, measured in Ohms (Ω).</p>
          </div>
        </div>
      </div>

      {/* Apparatus & Safety */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className={`p-5 rounded-xl border space-y-3 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center space-x-2 ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}>
            <Cpu className="w-4 h-4 text-cyan-500" />
            <span>Virtual Apparatus Checklist</span>
          </h3>
          <ul className={`space-y-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span><strong>Variable DC Voltage Source:</strong> Adjustable 0.0 V to 30.0 V.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span><strong>Precision Ohmic Resistor:</strong> Adjustable 1 Ω to 1000 Ω with color band representation.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span><strong>Series Digital Ammeter:</strong> Displays measured current in Amperes (A) or Milliamperes (mA).</span>
            </li>
          </ul>
        </div>

        <div className={`p-5 rounded-xl border space-y-3 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center space-x-2 ${
            isDark ? 'text-rose-300' : 'text-rose-700'
          }`}>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Safety & Error Analysis Guidelines</span>
          </h3>
          <ul className={`space-y-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold mt-0.5">•</span>
              <span><strong>Joule Power Dissipation (P = V × I):</strong> High current through low resistance generates heat. Virtual limits enforce safe power levels.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold mt-0.5">•</span>
              <span><strong>Open Circuit Faults:</strong> Discontinuous wire paths result in zero physical electron flow.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold mt-0.5">•</span>
              <span><strong>Meter Calibration Errors:</strong> Instruments can experience gain drift; always cross-verify measured current against theoretical V/R.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Interactive Step-by-Step Guided Procedure */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-bold flex items-center space-x-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <CheckSquare className="w-5 h-5 text-cyan-500" />
            <span>Interactive Guided Procedure Steps</span>
          </h3>
          <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono font-bold">
            {completedSteps.length} / {steps.length} Steps Completed
          </span>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                onClick={() => onToggleStep(step.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                  isCompleted
                    ? isDark
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-slate-200'
                      : 'bg-cyan-50 border-cyan-300 text-slate-900 font-medium'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-cyan-500" />
                  ) : (
                    <Square className={`w-5 h-5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">STEP 0{step.id}</span>
                    <h4 className={`text-sm font-bold ${isCompleted ? 'text-cyan-600 dark:text-cyan-300' : isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {step.title}
                    </h4>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onGoToLab}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Proceed to Virtual Circuit Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
