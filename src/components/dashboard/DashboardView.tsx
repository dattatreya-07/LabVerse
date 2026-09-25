'use client';

import React from 'react';
import { 
  Play, 
  BookOpen, 
  LineChart, 
  Bot, 
  Compass, 
  Cpu, 
  Activity, 
  Clock, 
  Award, 
  CheckCircle2, 
  Atom, 
  Flame, 
  FileText,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { ExperimentDefinition, ExperimentSession } from '@/types';
import { EXPERIMENT_CATALOG } from '@/lib/experiments/registry';

interface DashboardViewProps {
  currentSession: ExperimentSession;
  currentExperiment: ExperimentDefinition;
  onSelectExperiment: (expId: string) => void;
  onNavigateTab: (tab: 'catalog' | 'prep' | 'lab' | 'analysis' | 'tutor' | 'report') => void;
  theme: 'dark' | 'light';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentSession,
  currentExperiment,
  onSelectExperiment,
  onNavigateTab,
  theme,
}) => {
  const isDark = theme === 'dark';

  const availableExperiments = EXPERIMENT_CATALOG.filter(e => e.availability === 'AVAILABLE');
  const comingSoonExperiments = EXPERIMENT_CATALOG.filter(e => e.availability !== 'AVAILABLE');

  // Compute progress for current experiment
  const steps = currentExperiment.workspace.guidedSteps || [];
  const totalSteps = steps.length;
  const completedSteps = currentSession.completedSteps?.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const observationCount = currentSession.observations.length;

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'ELECTRONICS':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'MECHANICS':
        return <Activity className="w-5 h-5 text-amber-400" />;
      case 'QUANTUM':
      case 'OPTICS':
        return <Atom className="w-5 h-5 text-purple-400" />;
      case 'NUCLEAR':
        return <Flame className="w-5 h-5 text-rose-400" />;
      default:
        return <Layers className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'INTRODUCTORY':
      case 'BEGINNER':
        return isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INTERMEDIATE':
        return isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ADVANCED':
        return isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Welcome Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border relative overflow-hidden transition-all ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border-slate-800 shadow-xl' 
          : 'bg-gradient-to-r from-white via-cyan-50/40 to-sky-50 border-slate-200 shadow-md'
      }`}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LabVerse Virtual Laboratory Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interactive Science Workspaces & Simulation Platform
            </h1>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Conduct realistic physics, electronics, mechanics, and quantum optics experiments powered by deterministic physics engines. Build circuits, collect empirical data, and generate publication-ready lab reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('lab')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch Virtual Lab</span>
            </button>
            <button
              onClick={() => onNavigateTab('catalog')}
              className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Browse All Labs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Session Overview & Continue Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Lab Card (2 columns) */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col justify-between space-y-6 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Current Session</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${getDifficultyColor(currentExperiment.difficulty)}`}>
                {currentExperiment.difficulty}
              </span>
            </div>

            <h2 className="text-xl font-bold mb-2">{currentExperiment.title}</h2>
            <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {currentExperiment.summary}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Procedure Progress</span>
                <span className="text-cyan-400 font-mono">{completedSteps} / {totalSteps} Steps ({progressPercent}%)</span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className={`pt-4 border-t grid grid-cols-3 gap-4 text-center ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
            <div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mode</div>
              <div className="font-bold text-sm capitalize text-cyan-400 mt-0.5">{currentSession.mode.toLowerCase()}</div>
            </div>
            <div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Apparatus</div>
              <div className="font-bold text-sm mt-0.5">{currentSession.components.length} Items</div>
            </div>
            <div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Observations</div>
              <div className="font-bold text-sm text-emerald-400 mt-0.5">{observationCount} Runs</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => onNavigateTab('lab')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Resume Workspace</span>
            </button>
            <button
              onClick={() => onNavigateTab('prep')}
              className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>View Theory</span>
            </button>
          </div>
        </div>

        {/* Quick Launch & Stats (1 column) */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <h3 className="text-base font-bold mb-1 flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Platform Modules</span>
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Available simulation domains and interactive tools.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateTab('analysis')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                  isDark ? 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <LineChart className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Data Plotting</div>
                    <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {observationCount} recorded data points
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </button>

              <button
                onClick={() => onNavigateTab('tutor')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                  isDark ? 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">RAG AI Tutor</div>
                    <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Interactive theory assistant
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </button>

              <button
                onClick={() => onNavigateTab('report')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                  isDark ? 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Academic Lab Report</div>
                    <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Export official PDF reports
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Available Experiments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center space-x-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Available Science Laboratories</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Select an experiment to launch into the virtual laboratory workspace.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('catalog')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableExperiments.map((exp) => {
            const isSelected = exp.id === currentExperiment.id;
            const expSteps = exp.workspace.guidedSteps || [];
            return (
              <div
                key={exp.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-slate-900 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                      : 'bg-white border-cyan-400 shadow-md ring-1 ring-cyan-300'
                    : isDark
                    ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getDomainIcon(exp.domain)}
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">{exp.domain}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getDifficultyColor(exp.difficulty)}`}>
                      {exp.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold mb-1.5">{exp.title}</h3>
                  <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {exp.summary}
                  </p>

                  <div className="flex items-center space-x-4 mt-3 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{exp.estimatedMinutes} mins</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{expSteps.length} steps</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {isSelected ? (
                    <button
                      onClick={() => onNavigateTab('lab')}
                      className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Currently Active Lab</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectExperiment(exp.id)}
                      className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      }`}
                    >
                      <span>Select Experiment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Pipeline */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Upcoming Simulation Pipelines</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comingSoonExperiments.map((exp) => (
            <div
              key={exp.id}
              className={`p-4 rounded-xl border opacity-75 flex items-center justify-between ${
                isDark ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                  {getDomainIcon(exp.domain)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{exp.title}</div>
                  <div className="text-[11px] text-slate-500">{exp.domain} • {exp.estimatedMinutes} mins</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-slate-700 bg-slate-800 text-slate-400">
                Coming Soon
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
