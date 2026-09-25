'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  RotateCcw, 
  FileText, 
  Bot, 
  Play, 
  BookOpen, 
  Sun, 
  Moon, 
  AlertTriangle, 
  LineChart, 
  Compass, 
  LayoutDashboard,
  Menu,
  X,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { ExperimentSession, ExperimentDefinition } from '@/types';

export type NavTab = 'dashboard' | 'catalog' | 'prep' | 'lab' | 'analysis' | 'tutor' | 'report';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  session: ExperimentSession;
  experiment: ExperimentDefinition;
  onResetSession: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenPrivacy?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  session,
  experiment,
  onResetSession,
  theme,
  onToggleTheme,
  onOpenPrivacy,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';
  const hasFaults = session.activeFaults.length > 0;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'catalog', label: 'Catalog', icon: <Compass className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'prep', label: 'Theory', icon: <BookOpen className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'lab', label: 'Virtual Lab', icon: <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" /> },
    { id: 'analysis', label: 'Data & Plots', icon: <LineChart className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <Bot className="w-3.5 h-3.5 text-indigo-400" />, badge: 'AI' },
    { id: 'report', label: 'Report', icon: <FileText className="w-3.5 h-3.5 text-cyan-400" /> },
  ];

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      isDark
        ? 'bg-slate-950/90 border-slate-800 text-slate-100'
        : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Active Module */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
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

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                  isActive
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Session Status & Theme Toggle */}
        <div className="flex items-center space-x-2.5">
          {hasFaults && (
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Fault Active</span>
            </div>
          )}

          {/* Student / Session Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
            <UserCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">{session.mode}</span>
          </div>

          {/* Privacy & Security Disclosures Button */}
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-cyan-600 border-slate-300'
              }`}
              title="Privacy & Student Data Security Disclosures"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
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

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b p-4 space-y-2 transition-all ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
        }`}>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
