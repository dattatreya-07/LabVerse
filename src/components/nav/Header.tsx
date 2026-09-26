'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  LogOut,
  User
} from 'lucide-react';
import { ExperimentSession, ExperimentDefinition } from '@/types';

export type NavTab = 'catalog' | 'prep' | 'lab' | 'analysis' | 'tutor' | 'report';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  session: ExperimentSession;
  experiment: ExperimentDefinition;
  onResetSession: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenPrivacy?: () => void;
  onGoHome?: () => void;
  isAuthenticated?: boolean;
  userDisplayName?: string;
  onSignOut?: () => void;
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
  onGoHome,
  isAuthenticated,
  userDisplayName,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';
  const hasFaults = session.activeFaults.length > 0;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'catalog', label: 'Explore Labs', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'prep', label: 'Theory & 3D', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'lab', label: 'Virtual Lab', icon: <Play className="w-3.5 h-3.5 fill-current" /> },
    { id: 'analysis', label: 'Data & Plots', icon: <LineChart className="w-3.5 h-3.5" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <Bot className="w-3.5 h-3.5" />, badge: 'Groq' },
    { id: 'report', label: 'Report', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className={`sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2 transition-colors ${
      isDark ? 'bg-[#0D1219]/90' : 'bg-[#FFF9F6]/90'
    } backdrop-blur-md`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 h-14 rounded-full border shadow-sm flex items-center justify-between transition-all ${
        isDark ? 'bg-[#141B24] border-[#2A3644] text-[#F8FAFC]' : 'bg-white border-[#E8E2DC] text-[#0F151D]'
      }`}>
        
        {/* Brand Logo & Active Module */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onGoHome || (() => setActiveTab('catalog'))}>
          <div className="w-7 h-7 rounded-full bg-[#FF7448] flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm tracking-tight font-mono">
              LABVERSE
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20 uppercase tracking-wider hidden sm:inline">
              {experiment.domain}
            </span>
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-[#FF7448] text-white shadow-sm font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-[#1B232E]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#FFF9F6]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7448] animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Session Status & User Auth & Theme Toggle */}
        <div className="flex items-center space-x-2">
          {hasFaults && (
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Fault Active</span>
            </div>
          )}

          {/* User Status / Sign Out */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-1.5">
              <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20 text-xs font-semibold">
                <User className="w-3 h-3" />
                <span>{userDisplayName || 'Researcher'}</span>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className={`p-1.5 rounded-full border transition-all flex items-center justify-center cursor-pointer text-slate-500 hover:text-rose-500 ${
                    isDark ? 'border-[#2A3644] hover:bg-rose-950/40' : 'border-[#E8E2DC] hover:bg-rose-50'
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className={`hidden sm:inline-flex px-3 py-1 rounded-full border text-xs font-semibold transition-all ${
                isDark
                  ? 'border-[#2A3644] hover:bg-[#1B232E] text-slate-300'
                  : 'border-[#E8E2DC] hover:bg-[#F5F1ED] text-slate-700'
              }`}
            >
              Sign In
            </Link>
          )}

          {/* Privacy & Security Disclosures Button */}
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className={`p-1.5 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                isDark
                  ? 'bg-[#1B232E] hover:bg-[#2A3644] text-[#FF7448] border-[#2A3644]'
                  : 'bg-[#FFF9F6] hover:bg-[#F9F1EC] text-[#FF7448] border-[#E8E2DC]'
              }`}
              title="Privacy & Student Data Security"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
              isDark
                ? 'bg-[#1B232E] hover:bg-[#2A3644] text-amber-300 border-[#2A3644]'
                : 'bg-[#FFF9F6] hover:bg-[#F9F1EC] text-[#0F151D] border-[#E8E2DC]'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onResetSession}
            title="Reset Active Session"
            className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#1B232E] hover:bg-[#2A3644] text-slate-400 hover:text-rose-400 border-[#2A3644]'
                : 'bg-[#FFF9F6] hover:bg-[#F9F1EC] text-slate-600 hover:text-rose-600 border-[#E8E2DC]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-1.5 rounded-full border transition-colors cursor-pointer ${
              isDark ? 'bg-[#1B232E] border-[#2A3644] text-slate-300' : 'bg-[#FFF9F6] border-[#E8E2DC] text-slate-700'
            }`}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden mt-2 p-3 rounded-2xl border shadow-lg space-y-1 transition-all ${
          isDark ? 'bg-[#141B24] border-[#2A3644]' : 'bg-white border-[#E8E2DC]'
        }`}>
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF7448] text-white font-bold'
                      : isDark
                      ? 'bg-[#1B232E] text-slate-400 hover:text-slate-200'
                      : 'bg-[#FFF9F6] text-slate-600 hover:text-slate-900'
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
