'use client';

import React from 'react';
import { ChallengeGoal, SimulationResult } from '@/types';
import { Trophy, CheckCircle, Target, Sparkles } from 'lucide-react';

interface ChallengeBannerProps {
  challenges?: ChallengeGoal[];
  activeChallengeId?: string;
  onSelectChallenge: (id: string) => void;
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

  if (challenges.length === 0) return null;

  const currentChallenge = challenges.find(c => c.id === activeChallengeId) || challenges[0];

  // Evaluate success against target
  const currentMeas = latestResult?.measurements.find(m => m.id === currentChallenge.targetMetric);
  const currentValue = currentMeas?.observedValue ?? 0;
  const diff = Math.abs(currentValue - currentChallenge.targetValue);
  const isCompleted = latestResult ? diff <= currentChallenge.tolerance : false;
  const progressPct = Math.min(100, Math.max(0, (1 - diff / (currentChallenge.targetValue || 1)) * 100));

  return (
    <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
      isCompleted
        ? isDark ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-md'
        : isDark ? 'bg-slate-900 border-indigo-900/50 text-slate-200' : 'bg-white border-indigo-200 text-slate-800 shadow-sm'
    }`}>
      
      {/* Challenge Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg border ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
          }`}>
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Active Challenge: {currentChallenge.title}
              </span>
              {isCompleted && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center space-x-1 animate-bounce">
                  <CheckCircle className="w-3 h-3" />
                  <span>GOAL ACHIEVED!</span>
                </span>
              )}
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{currentChallenge.description}</p>
          </div>
        </div>

        {/* Challenge Goal Metric Badge */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Target:</span>
          <span className="font-bold text-cyan-500">
            {currentChallenge.targetValue} {currentChallenge.unit}
          </span>
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Current:</span>
          <span className={`font-bold ${isCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
            {currentValue.toFixed(3)} {currentChallenge.unit}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-200'}`}>
          <div
            className={`h-full transition-all duration-500 ${
              isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className={`text-[10px] italic flex items-center space-x-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <Sparkles className="w-3 h-3 text-cyan-500" />
          <span>Hint: {currentChallenge.hint}</span>
        </p>
      </div>

    </div>
  );
};
