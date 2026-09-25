'use client';

import React, { useState } from 'react';
import { ExperimentDefinition, DomainCategory } from '@/types';
import { getAllExperiments } from '@/lib/experiments/registry';
import { Zap, Activity, Sun, Atom, Dna, Play, Lock, Clock, ArrowRight, BookOpen, Compass } from 'lucide-react';

interface ExperimentCatalogProps {
  onSelectExperiment: (experimentId: string) => void;
  theme?: 'dark' | 'light';
}

export const ExperimentCatalog: React.FC<ExperimentCatalogProps> = ({
  onSelectExperiment,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  const allExperiments = getAllExperiments();

  const domains: Array<{ id: string; label: string; icon: any }> = [
    { id: 'ALL', label: 'All Domains', icon: Compass },
    { id: 'ELECTRONICS', label: 'Electronics', icon: Zap },
    { id: 'MECHANICS', label: 'Mechanics', icon: Activity },
    { id: 'QUANTUM', label: 'Quantum Physics', icon: Sun },
    { id: 'NUCLEAR', label: 'Nuclear Physics', icon: Atom },
    { id: 'BIOLOGY', label: 'Molecular Biology', icon: Dna },
  ];

  const filtered = selectedDomain === 'ALL'
    ? allExperiments
    : allExperiments.filter(e => e.domain === selectedDomain);

  const getDomainIcon = (domain: DomainCategory) => {
    switch (domain) {
      case 'ELECTRONICS': return <Zap className="w-5 h-5 text-cyan-500" />;
      case 'MECHANICS': return <Activity className="w-5 h-5 text-emerald-500" />;
      case 'QUANTUM': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'NUCLEAR': return <Atom className="w-5 h-5 text-purple-500" />;
      case 'BIOLOGY': return <Dna className="w-5 h-5 text-rose-500" />;
      default: return <Zap className="w-5 h-5 text-cyan-500" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className={`p-8 rounded-3xl border shadow-xl transition-colors relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-slate-800'
          : 'bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50/50 border-slate-200/90 shadow-slate-200/60'
      }`}>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
            <span>Modular Virtual Laboratory Platform</span>
          </div>

          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Explore Virtual Science & Engineering Labs
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Select an experiment module below to enter a fully interactive laboratory workspace. Assemble real apparatus, configure parameters, run deterministic simulations, inject faults, and analyze scientific outcomes.
          </p>
        </div>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {domains.map((d) => {
          const Icon = d.icon;
          const isActive = selectedDomain === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 shrink-0 ${
                isActive
                  ? isDark
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                    : 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-sm'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{d.label}</span>
            </button>
          );
        })}
      </div>

      {/* Experiment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((exp) => {
          const isAvailable = exp.availability === 'AVAILABLE';
          return (
            <div
              key={exp.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between space-y-4 transition-all group ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/50 shadow-lg'
                  : 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      {getDomainIcon(exp.domain)}
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {exp.domain}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    exp.difficulty === 'BEGINNER'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : exp.difficulty === 'INTERMEDIATE'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      : 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                  }`}>
                    {exp.difficulty}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className={`text-lg font-bold group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    {exp.title}
                  </h3>
                  <p className={`text-xs italic mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {exp.tagline}
                  </p>
                </div>

                <p className={`text-xs line-clamp-3 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {exp.summary}
                </p>

                {/* Duration & Objectives Pill */}
                <div className="flex items-center space-x-3 text-[11px] opacity-70">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{exp.estimatedMinutes} mins</span>
                  </span>
                  <span>•</span>
                  <span>{exp.learningObjectives.length} Objectives</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isAvailable ? (
                  <button
                    onClick={() => onSelectExperiment(exp.id)}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Enter Laboratory</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectExperiment(exp.id)}
                    className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Module Demo</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
