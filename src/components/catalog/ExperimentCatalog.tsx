'use client';

import React, { useState, useEffect } from 'react';
import { DomainCategory } from '@/types';
import { getAllExperiments } from '@/lib/experiments/registry';
import { 
  Zap, 
  Activity, 
  Sun, 
  Atom, 
  Dna, 
  TrendingUp, 
  FlaskConical, 
  Play, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  Compass, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  GraduationCap, 
  Radio 
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const domParam = new URLSearchParams(window.location.search).get('domain');
      if (domParam) {
        setSelectedDomain(domParam.toUpperCase());
      }
    }
  }, []);

  const allExperiments = getAllExperiments();

  const domains: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'ALL', label: 'All Domains', icon: Compass },
    { id: 'PHYSICS', label: 'Physics', icon: Activity },
    { id: 'ECE', label: 'ECE & Antenna', icon: Radio },
    { id: 'ELECTRONICS', label: 'Electronics', icon: Zap },
    { id: 'CHEMISTRY', label: 'Chemistry', icon: FlaskConical },
    { id: 'BIOLOGY', label: 'Biology', icon: Dna },
    { id: 'FINANCE', label: 'Finance', icon: TrendingUp },
  ];

  const filtered = allExperiments.filter((exp) => {
    let matchesDomain = selectedDomain === 'ALL' || exp.domain.toUpperCase() === selectedDomain.toUpperCase();
    if (selectedDomain === 'PHYSICS') {
      matchesDomain = ['PHYSICS', 'MECHANICS', 'QUANTUM', 'NUCLEAR'].includes(exp.domain.toUpperCase());
    }
    const matchesSearch = searchQuery.trim() === '' || 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.tagline && exp.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const getDomainIcon = (domain: DomainCategory) => {
    switch (domain) {
      case 'ECE': return <Radio className="w-5 h-5 text-[#FF7448]" />;
      case 'ELECTRONICS': return <Zap className="w-5 h-5 text-[#FF7448]" />;
      case 'MECHANICS': return <Activity className="w-5 h-5 text-[#FF7448]" />;
      case 'QUANTUM': return <Sun className="w-5 h-5 text-[#FF7448]" />;
      case 'NUCLEAR': return <Atom className="w-5 h-5 text-[#FF7448]" />;
      case 'BIOLOGY': return <Dna className="w-5 h-5 text-[#FF7448]" />;
      case 'CHEMISTRY': return <FlaskConical className="w-5 h-5 text-[#FF7448]" />;
      case 'FINANCE': return <TrendingUp className="w-5 h-5 text-[#FF7448]" />;
      default: return <Zap className="w-5 h-5 text-[#FF7448]" />;
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'INTRODUCTORY':
      case 'BEGINNER':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'INTERMEDIATE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'ADVANCED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-[#FF7448]/10 text-[#FF7448] border-[#FF7448]/20';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-10 rounded-[28px] border transition-all card-nomu ${
        isDark ? 'bg-[#141B24] border-[#2A3644]' : 'bg-white border-[#E8E2DC]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20">
              <Compass className="w-3.5 h-3.5" />
              <span>EXPLORE EXPERIMENTS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Virtual Science & Engineering Catalog
            </h1>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-[#4A5568]'}`}>
              Choose from 8 authentic laboratory simulations across 6 scientific disciplines.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7448]/30 transition-all bg-[#FFF9F6] dark:bg-[#0D1219] border-[#E8E2DC] dark:border-[#2A3644]"
            />
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-2 pt-6 overflow-x-auto no-scrollbar">
          {domains.map((d) => {
            const isSelected = selectedDomain === d.id;
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF7448] text-white shadow-sm font-bold'
                    : isDark
                    ? 'bg-[#0D1219] text-slate-400 hover:text-slate-200 border border-[#2A3644]'
                    : 'bg-[#FFF9F6] text-slate-700 hover:text-[#0F151D] border border-[#E8E2DC]'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((exp) => (
          <div
            key={exp.id}
            className={`p-6 rounded-[24px] border transition-all duration-200 flex flex-col justify-between space-y-5 card-nomu ${
              isDark ? 'bg-[#141B24] border-[#2A3644]' : 'bg-white border-[#E8E2DC]'
            }`}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20 uppercase">
                  {exp.domain}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(exp.difficulty)}`}>
                  {exp.difficulty}
                </span>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF9F6] dark:bg-[#0D1219] border border-[#E8E2DC] dark:border-[#2A3644] flex items-center justify-center shrink-0 mt-0.5">
                  {getDomainIcon(exp.domain)}
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    {exp.title}
                  </h3>
                  <p className="text-[11px] font-mono text-[#FF7448] mt-0.5">
                    {exp.estimatedMinutes} Mins • Guided & Sandbox
                  </p>
                </div>
              </div>

              <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-slate-400' : 'text-[#4A5568]'}`}>
                {exp.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onSelectExperiment(exp.id)}
                className="btn-pill-primary h-9 px-4 text-xs cursor-pointer w-full"
              >
                <span>Launch Virtual Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
