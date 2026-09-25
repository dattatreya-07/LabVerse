'use client';

import React, { useState } from 'react';
import { DomainCategory } from '@/types';
import { getAllExperiments } from '@/lib/experiments/registry';
import { 
  Zap, 
  Activity, 
  Sun, 
  Atom, 
  Dna, 
  Play, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  Compass, 
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GraduationCap
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allExperiments = getAllExperiments();

  const domains: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'ALL', label: 'All Domains', icon: Compass },
    { id: 'ELECTRONICS', label: 'Electronics', icon: Zap },
    { id: 'MECHANICS', label: 'Mechanics', icon: Activity },
    { id: 'QUANTUM', label: 'Quantum Physics', icon: Sun },
    { id: 'NUCLEAR', label: 'Nuclear Physics', icon: Atom },
    { id: 'BIOLOGY', label: 'Molecular Biology', icon: Dna },
  ];

  const filtered = allExperiments.filter((exp) => {
    const matchesDomain = selectedDomain === 'ALL' || exp.domain === selectedDomain;
    const matchesSearch = searchQuery.trim() === '' || 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const getDomainIcon = (domain: DomainCategory) => {
    switch (domain) {
      case 'ELECTRONICS': return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'MECHANICS': return <Activity className="w-5 h-5 text-amber-400" />;
      case 'QUANTUM': return <Sun className="w-5 h-5 text-purple-400" />;
      case 'NUCLEAR': return <Atom className="w-5 h-5 text-rose-400" />;
      case 'BIOLOGY': return <Dna className="w-5 h-5 text-emerald-400" />;
      default: return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getDifficultyBadge = (diff: string) => {
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
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl transition-colors relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 border-slate-800'
          : 'bg-gradient-to-br from-white via-sky-50 to-cyan-50 border-slate-200 shadow-md'
      }`}>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LabVerse Science Catalog</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Explore Interactive Virtual Laboratories
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Browse physics, electronics, mechanics, quantum, and biology lab modules backed by deterministic simulation engines. Select an experiment to review learning objectives, apparatus schemas, and enter the virtual laboratory.
          </p>
        </div>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Search experiments by title, category, or concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500' 
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
            }`}
          />
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {domains.map((d) => {
            const Icon = d.icon;
            const isActive = selectedDomain === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
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
      </div>

      {/* Experiment Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((exp) => {
            const isAvailable = exp.availability === 'AVAILABLE';
            const firstObjective = exp.learningObjectives && exp.learningObjectives.length > 0
              ? typeof exp.learningObjectives[0] === 'string'
                ? exp.learningObjectives[0]
                : exp.learningObjectives[0].description
              : null;

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
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                        {exp.domain}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getDifficultyBadge(exp.difficulty)}`}>
                      {exp.difficulty}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className={`text-lg font-bold group-hover:text-cyan-400 transition-colors ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      {exp.title}
                    </h3>
                    {exp.tagline && (
                      <p className={`text-xs italic mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {exp.tagline}
                      </p>
                    )}
                  </div>

                  <p className={`text-xs line-clamp-3 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {exp.summary}
                  </p>

                  {/* Learning Objectives Preview */}
                  {firstObjective && (
                    <div className="space-y-1.5 pt-1">
                      <div className={`text-[11px] font-semibold flex items-center space-x-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Key Learning Objective:</span>
                      </div>
                      <p className={`text-xs line-clamp-1 italic font-medium ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                        • {firstObjective}
                      </p>
                    </div>
                  )}

                  {/* Duration & Prerequisites */}
                  <div className="flex items-center justify-between text-[11px] font-mono border-t pt-3 border-slate-800/60">
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{exp.estimatedMinutes} mins</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {isAvailable ? (
                        <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Simulation Ready</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Coming Soon</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {isAvailable ? (
                    <button
                      onClick={() => onSelectExperiment(exp.id)}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Select Experiment & Theory</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectExperiment(exp.id)}
                      className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Specification</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className={`p-12 text-center rounded-2xl border ${
          isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
        }`}>
          <AlertCircle className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-base font-bold mb-1">No experiments found</h3>
          <p className="text-xs mb-4">No matching experiment modules for query "{searchQuery}".</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedDomain('ALL'); }}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Reset Catalog Search
          </button>
        </div>
      )}

    </div>
  );
};
