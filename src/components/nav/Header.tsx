'use client';

import React from 'react';
import { Cpu, RotateCcw, FileText, Bot, Play, LayoutDashboard, BookOpen, Sun, Moon, AlertTriangle, LineChart, Compass } from 'lucide-react';
import { ExperimentSession, ExperimentDefinition } from '@/types';

interface HeaderProps {
  activeTab: 'catalog' | 'prep' | 'lab' | 'analysis' | 'tutor' | 'report';
  setActiveTab: (tab: 'catalog' | 'prep' | 'lab' | 'analysis' | 'tutor' | 'report') => void;
  session: ExperimentSession;
  experiment: ExperimentDefinition;
  onResetSession: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  session,
  experiment,
  onResetSession,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const hasFaults = session.activeFaults.length > 0;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      isDark
        ? 'bg-slate-950/90 border-slate-800 text-slate-100'
        : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Active Module */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
          <div className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
            isDark
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'bg-cyan-50 border-cyan-300 text-cyan-600 shadow-sm'
          }`}>
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400">
                LabVerse
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                isDark
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-800/60'
                  : 'bg-cyan-100 text-cyan-800 border-cyan-300'
              }`}>
                {experiment.domain}
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {experiment.title}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'catalog'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('prep')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'prep'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Theory</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'lab'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
            <span>Virtual Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'analysis'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LineChart className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden lg:inline">Data & Plots</span>
          </button>

          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
              activeTab === 'tutor'
                ? isDark
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">AI Tutor</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping absolute -top-0.5 -right-0.5" />
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'report'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden md:inline">Report</span>
          </button>
        </nav>

        {/* Right Session Status & Theme Toggle */}
        <div className="flex items-center space-x-2.5">
          {hasFaults && (
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Fault Active</span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-300'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="hidden sm:flex flex-col text-right">
            <span className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Session
            </span>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{session.sessionId}</span>
          </div>

          <button
            onClick={onResetSession}
            title="Reset Active Experiment Session"
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 border-slate-300'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
