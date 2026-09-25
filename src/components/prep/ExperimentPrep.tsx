'use client';

import React from 'react';
import { ExperimentDefinition } from '@/types';
import { BookOpen, CheckSquare, Square, Zap, ShieldAlert, ArrowRight, Play, Trophy } from 'lucide-react';

interface ExperimentPrepProps {
  experiment: ExperimentDefinition;
  completedSteps: number[];
  onToggleStep: (stepId: number) => void;
  onGoToLab: () => void;
  theme?: 'dark' | 'light';
}

export const ExperimentPrep: React.FC<ExperimentPrepProps> = ({
  experiment,
  completedSteps,
  onToggleStep,
  onGoToLab,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const steps = experiment.workspace.guidedSteps || [];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Title Header */}
      <div className={`p-6 sm:p-8 rounded-2xl border space-y-3 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>{experiment.domain} • Conceptual Preparation & Procedure Protocol</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          {experiment.title}
        </h1>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {experiment.theory.corePrinciple}
        </p>
      </div>

      {/* Learning Objectives */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className={`text-base font-bold flex items-center space-x-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <Trophy className="w-4 h-4 text-cyan-500" />
          <span>Learning Objectives</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {experiment.learningObjectives.map((obj) => (
            <div
              key={obj.id}
              className={`p-3.5 rounded-xl border flex items-start space-x-2.5 text-xs ${
                isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
              <span>{obj.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Governing Equations Cards */}
      <div className="space-y-4">
        <h2 className={`text-base font-bold flex items-center space-x-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <Zap className="w-4 h-4 text-cyan-500" />
          <span>Governing Equations & Mathematical Models</span>
        </h2>

        <div className={`p-6 rounded-2xl border text-center space-y-3 transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-cyan-500/30'
            : 'bg-gradient-to-r from-sky-50 via-indigo-50/50 to-sky-50 border-cyan-300 shadow-sm'
        }`}>
          <div className="flex flex-wrap items-center justify-center gap-6 text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-600 dark:from-cyan-400 dark:via-sky-200 dark:to-indigo-300 tracking-widest font-mono">
            {experiment.theory.equations.map((eq, i) => (
              <span key={i} className="px-3 py-1 rounded-xl bg-slate-950/30 border border-cyan-500/20">
                {eq}
              </span>
            ))}
          </div>
          <p className={`text-xs max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {experiment.theory.derivation}
          </p>
        </div>

        {/* Variables Breakdown */}
        {experiment.theory.variableDescriptions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(experiment.theory.variableDescriptions).map(([symbol, desc]) => (
              <div
                key={symbol}
                className={`p-3.5 rounded-xl border space-y-1 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">{symbol}</span>
                <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Rules */}
      {experiment.safety && (
        <div className={`p-5 rounded-xl border space-y-3 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center space-x-2 text-rose-500">
            <ShieldAlert className="w-4 h-4" />
            <span>Safety & Operating Constraints</span>
          </h3>
          <ul className={`space-y-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {experiment.safety.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold mt-0.5">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Guided Procedure Checklist */}
      {steps.length > 0 && (
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold flex items-center space-x-2 ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              <CheckSquare className="w-4 h-4 text-cyan-500" />
              <span>Interactive Guided Procedure Steps</span>
            </h3>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono font-bold">
              {completedSteps.length} / {steps.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const isCompleted = completedSteps.includes(step.stepNumber);
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => onToggleStep(step.stepNumber)}
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
                      <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        STEP 0{step.stepNumber}
                      </span>
                      <h4 className={`text-sm font-bold ${isCompleted ? 'text-cyan-600 dark:text-cyan-300' : isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {step.title}
                      </h4>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{step.instruction}</p>
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
              <span>Enter Virtual Laboratory Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
