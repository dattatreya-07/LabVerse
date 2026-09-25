'use client';

import React from 'react';
import { LearningMode } from '@/types';
import { Compass, HelpCircle, Trophy, Play } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: LearningMode;
  onChangeMode: (mode: LearningMode) => void;
  theme?: 'dark' | 'light';
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onChangeMode,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const modes: Array<{ id: LearningMode; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }> = [
    { id: 'GUIDED', label: 'Guided Mode', icon: Compass, desc: 'Step-by-step breadcrumbs & checks' },
    { id: 'PRACTICE', label: 'Practice Mode', icon: HelpCircle, desc: 'Self-guided with diagnostic hints' },
    { id: 'CHALLENGE', label: 'Challenge Mode', icon: Trophy, desc: 'Target objectives & tolerances' },
    { id: 'EXPLORATION', label: 'Sandbox', icon: Play, desc: 'Open exploration & custom faults' },
  ];

  return (
    <div className={`p-1.5 rounded-2xl border flex flex-wrap items-center gap-1.5 transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChangeMode(m.id)}
            className={`flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
              isActive
                ? isDark
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold'
                  : 'bg-cyan-600 text-white shadow-md font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={m.desc}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
