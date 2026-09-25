'use client';

import React, { useState } from 'react';
import { ChallengeGoal, SimulationResult } from '@/types';
import { Trophy, CheckCircle2, Sparkles, HelpCircle, ArrowRight, Award } from 'lucide-react';

interface ChallengeBannerProps {
  challenges?: ChallengeGoal[];
  activeChallengeId?: string;
  onSelectChallenge?: (id: string) => void;
  latestResult: SimulationResult | null;
  theme?: 'dark' | 'light';
}

export const ChallengeBanner: React.FC<ChallengeBannerProps> = ({
  challenges = [],
  activeChallengeId,
  onSelectChallenge,
  latestResult,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [selectedId, setSelectedId] = useState<string>(activeChallengeId || (challenges[0]?.id ?? 'ch-1'));
  const [showHint, setShowHint] = useState<boolean>(false);

  if (challenges.length === 0) return null;

  const currentChallenge = challenges.find(c => c.id === selectedId) || challenges[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowHint(false);
    if (onSelectChallenge) onSelectChallenge(id);
  };

  // Evaluate success against target metric
  const currentMeas = latestResult?.measurements.find(m => m.id === currentChallenge.targetMetric);
  const currentValue = currentMeas?.observedValue ?? 0;
  const diff = Math.abs(currentValue - currentChallenge.targetValue);
  const isCompleted = latestResult ? diff <= currentChallenge.tolerance : false;
  const progressPct = Math.min(100, Math.max(0, Math.round((1 - diff / (currentChallenge.targetValue || 1)) * 100)));

  return (
    <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
      isCompleted
        ? isDark ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 shadow-lg' : 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-md'
        : isDark ? 'bg-slate-900 border-indigo-900/50 text-slate-200' : 'bg-white border-indigo-200 text-slate-800 shadow-sm'
    }`}>
      
      {/* Challenge Switcher Pills */}
      {challenges.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 shrink-0">Select Challenge:</span>
          {challenges.map((c) => {
            const isSelected = c.id === currentChallenge.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold' : 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold'
                    : isDark ? 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {c.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Challenge Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-xl border shrink-0 ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
          }`}>
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold tracking-tight">{currentChallenge.title}</h3>
              {isCompleted ? (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center space-x-1 animate-bounce">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>SUCCESS! +100 PTS</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Target Evaluation
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {currentChallenge.description}
            </p>
          </div>
        </div>

        {/* Numeric Target vs Current Readout */}
        <div className={`p-3 rounded-xl border font-mono text-xs flex items-center justify-between sm:justify-end space-x-4 shrink-0 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <span className={`text-[10px] uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Target Goal</span>
            <span className="font-bold text-cyan-400">{currentChallenge.targetValue} {currentChallenge.unit}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className={`text-[10px] uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Current Output</span>
            <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
              {currentValue.toFixed(3)} {currentChallenge.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Target Alignment</span>
          <span className="text-cyan-400 font-bold">{progressPct}% Match</span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-200'}`}>
          <div
            className={`h-full transition-all duration-500 ${
              isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Hint Reveal Drawer */}
      <div className="pt-1 flex items-center justify-between">
        <button
          onClick={() => setShowHint(!showHint)}
          className={`text-xs font-semibold flex items-center space-x-1.5 cursor-pointer ${
            isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showHint ? 'Hide Diagnostic Hint' : 'Need a Hint?'}</span>
        </button>

        {isCompleted && (
          <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400">
            <Award className="w-4 h-4" />
            <span>Challenge Criteria Passed</span>
          </div>
        )}
      </div>

      {showHint && (
        <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
          isDark ? 'bg-slate-950/90 border-indigo-900/60 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
        }`}>
          <span className="font-bold block mb-0.5">Guided Hint:</span>
          <p>{currentChallenge.hint}</p>
        </div>
      )}

    </div>
  );
};
