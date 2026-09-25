'use client';

import React from 'react';
import { Play, Activity, Cpu, AlertTriangle, ShieldCheck, CheckCircle2, Lock, ArrowRight, BookOpen, Bot } from 'lucide-react';
import { SessionState } from '@/types';

interface DashboardProps {
  session: SessionState;
  onStartLab: () => void;
  onOpenPrep: () => void;
  onOpenReport: () => void;
  theme?: 'dark' | 'light';
}

export const Dashboard: React.FC<DashboardProps> = ({
  session,
  onStartLab,
  onOpenPrep,
  onOpenReport,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Header */}
      <div className={`relative overflow-hidden rounded-2xl p-6 sm:p-10 border shadow-2xl transition-colors ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-slate-800'
          : 'bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/40 border-slate-200/90 shadow-slate-200/50'
      }`}>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-semibold ${
            isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-100 border-cyan-300 text-cyan-800'
          }`}>
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>Interactive AI-Guided Virtual Lab</span>
          </div>

          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            Don't just perform the experiment.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400">
              Understand what happens when it goes wrong.
            </span>
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed max-w-2xl ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            LabVerse combines real-time physical simulation, fault injection, and grounded RAG AI tutoring to give engineering students authentic diagnostic experience.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartLab}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Ohm's Law Lab</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenPrep}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Theory & Procedure</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-xl border flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div>
            <p className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Lab</p>
            <p className={`text-lg font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Ohm's Law (V=IR)</p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Fully Functional MVP</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-5 rounded-xl border flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div>
            <p className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recorded Runs</p>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{session.observations.length}</p>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Data points collected</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-5 rounded-xl border flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div>
            <p className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fault Injections</p>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{session.faultLog.length}</p>
            <span className="text-[11px] text-rose-500 font-medium">Diagnostic events</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-5 rounded-xl border flex items-center justify-between transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div>
            <p className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>AI Tutor Engine</p>
            <p className={`text-sm font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>RAG Grounded</p>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">Offline/Groq Ready</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500">
            <Bot className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3): Available & Upcoming Experiments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold flex items-center space-x-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <Cpu className="w-5 h-5 text-cyan-500" />
              <span>Laboratory Modules</span>
            </h2>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phase 1 Release</span>
          </div>

          {/* Active Card: Ohm's Law */}
          <div className={`group relative overflow-hidden rounded-2xl p-6 shadow-lg border transition-all ${
            isDark
              ? 'bg-slate-900 border-cyan-500/40 hover:border-cyan-400'
              : 'bg-white border-cyan-300 shadow-slate-200/60 hover:border-cyan-400'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                  }`}>
                    MODULE 01 • ACTIVE
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>DC Electrical Circuits</span>
                </div>
                <h3 className={`text-2xl font-bold transition-colors ${
                  isDark ? 'text-slate-100 group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-cyan-600'
                }`}>
                  Ohm's Law & Circuit Diagnostics
                </h3>
                <p className={`text-xs sm:text-sm max-w-xl leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Manipulate voltage and resistance, measure current response, observe physical V-I linearity, inject open circuit or meter calibration faults, and diagnose using RAG AI tutoring.
                </p>
                <div className={`flex flex-wrap gap-2 pt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>SVG Circuit Simulator</span>
                  <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>Open & Meter Faults</span>
                  <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>PDF Report Export</span>
                </div>
              </div>

              <button
                onClick={onStartLab}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 whitespace-nowrap shrink-0"
              >
                <span>Start Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Locked / Coming Soon Cards */}
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Upcoming Modules (Coming Soon)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border opacity-70 flex items-start justify-between ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kirchhoff's Laws</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Multi-loop node analysis and mesh current balancing.</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>Phase 2</span>
              </div>

              <div className={`p-4 rounded-xl border opacity-70 flex items-start justify-between ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>RLC AC Transient Circuits</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Resonance frequency and phase shift angle.</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>Phase 2</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1/3): Session Progress */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm'
          }`}>
            <h3 className={`text-base font-bold flex items-center justify-between ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <span>Current Session Progress</span>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">{session.sessionId}</span>
            </h3>

            <div className={`space-y-3 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Student ID:</span>
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{session.studentName}</span>
              </div>

              <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Current Input:</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-300 font-bold">
                  {session.currentInput.voltage}V / {session.currentInput.resistance}Ω
                </span>
              </div>

              <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Last Theoretical I:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {session.lastResult ? `${session.lastResult.theoreticalCurrent} A` : 'N/A'}
                </span>
              </div>

              <div className={`flex justify-between py-1.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Active Circuit Status:</span>
                <span className={`font-semibold ${session.currentInput.faultType === 'NORMAL' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {session.currentInput.faultType}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={onStartLab}
                className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                  isDark
                    ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
                    : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Open Virtual Lab Workspace</span>
              </button>

              <button
                onClick={onOpenReport}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs border transition-all flex items-center justify-center space-x-2 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span>View & Export PDF Report</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
