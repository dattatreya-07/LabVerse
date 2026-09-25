'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/nav/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ExperimentPrep } from '@/components/lab/ExperimentPrep';
import { CircuitSVG } from '@/components/lab/CircuitSVG';
import { LabControls } from '@/components/lab/LabControls';
import { LiveReadings } from '@/components/lab/LiveReadings';
import { ObservationsTable } from '@/components/lab/ObservationsTable';
import { ResultsChart } from '@/components/lab/ResultsChart';
import { TutorPanel } from '@/components/tutor/TutorPanel';
import { ReportView } from '@/components/report/ReportView';

import { SessionState, CircuitInput, FaultType, ObservationRecord, FaultLogEntry } from '@/types';
import { loadSession, saveSession, clearSession, DEFAULT_INPUT } from '@/lib/session/storage';
import { runSimulation } from '@/lib/simulation/engine';
import { Bot, Play } from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prep' | 'lab' | 'tutor' | 'report'>('dashboard');
  const [input, setInput] = useState<CircuitInput>(DEFAULT_INPUT);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load session & theme preference from localStorage on mount
  useEffect(() => {
    const loaded = loadSession();
    setSession(loaded);
    if (loaded.currentInput) {
      setInput(loaded.currentInput);
    }

    const savedTheme = localStorage.getItem('labverse_theme') as 'dark' | 'light' | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('labverse_theme', nextTheme);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="animate-pulse text-sm text-cyan-400 font-mono">Initializing LabVerse Virtual Engine...</div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  const updateSessionState = (newSession: SessionState) => {
    setSession(newSession);
    saveSession(newSession);
  };

  const handleRunSimulation = () => {
    try {
      const result = runSimulation(input);
      
      const newObs: ObservationRecord = {
        id: `obs-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        voltage: result.voltage,
        resistance: result.resistance,
        theoreticalCurrent: result.theoreticalCurrent,
        measuredCurrent: result.measuredCurrent,
        faultType: result.faultType,
        notes: result.faultExplanation || 'Normal measurement run',
      };

      const updatedSession: SessionState = {
        ...session,
        currentInput: input,
        lastResult: result,
        observations: [newObs, ...session.observations],
      };

      updateSessionState(updatedSession);
    } catch (err) {
      console.error('Simulation execution error:', err);
    }
  };

  const handleInjectFault = (fault: FaultType) => {
    const newInput: CircuitInput = { ...input, faultType: fault };
    setInput(newInput);

    const result = runSimulation(newInput);

    const logEntry: FaultLogEntry = {
      id: `fault-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      faultType: fault,
      action: fault === 'NORMAL' ? 'REPAIRED' : 'INJECTED',
      details: result.faultExplanation || `Fault mode changed to ${fault}`,
    };

    const updatedSession: SessionState = {
      ...session,
      currentInput: newInput,
      lastResult: result,
      faultLog: [logEntry, ...session.faultLog],
    };

    updateSessionState(updatedSession);
  };

  const handleResetControls = () => {
    setInput(DEFAULT_INPUT);
    const result = runSimulation(DEFAULT_INPUT);
    updateSessionState({
      ...session,
      currentInput: DEFAULT_INPUT,
      lastResult: result,
    });
  };

  const handleResetSession = () => {
    if (window.confirm('Reset lab session? All observations and fault logs will be cleared.')) {
      const fresh = clearSession();
      setSession(fresh);
      setInput(fresh.currentInput);
    }
  };

  const handleToggleStep = (stepId: number) => {
    const currentSteps = session.completedSteps || [];
    const nextSteps = currentSteps.includes(stepId)
      ? currentSteps.filter(id => id !== stepId)
      : [...currentSteps, stepId];

    updateSessionState({
      ...session,
      completedSteps: nextSteps,
    });
  };

  const handleDeleteObservation = (id: string) => {
    const nextObs = session.observations.filter(o => o.id !== id);
    updateSessionState({
      ...session,
      observations: nextObs,
    });
  };

  const handleClearObservations = () => {
    updateSessionState({
      ...session,
      observations: [],
    });
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Fixed Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        session={session}
        onResetSession={handleResetSession}
        activeFault={input.faultType}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard
            session={session}
            onStartLab={() => setActiveTab('lab')}
            onOpenPrep={() => setActiveTab('prep')}
            onOpenReport={() => setActiveTab('report')}
            theme={theme}
          />
        )}

        {/* TAB 2: PREPARATION & THEORY */}
        {activeTab === 'prep' && (
          <ExperimentPrep
            completedSteps={session.completedSteps || []}
            onToggleStep={handleToggleStep}
            onGoToLab={() => setActiveTab('lab')}
            theme={theme}
          />
        )}

        {/* TAB 3: VIRTUAL LABORATORY WORKSPACE */}
        {activeTab === 'lab' && (
          <div className="space-y-6 pb-12">
            
            {/* Top Workspace Bar */}
            <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div>
                <h1 className={`text-lg font-bold flex items-center space-x-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  <Play className="w-4 h-4 text-cyan-500 fill-cyan-500/20" />
                  <span>Ohm's Law Virtual Circuit Workspace</span>
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Adjust voltage and resistance, run simulation, inspect waveforms, inject fault anomalies.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('tutor')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                  isDark
                    ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/40'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}
              >
                <Bot className="w-4 h-4 text-indigo-500" />
                <span>Ask AI Tutor</span>
              </button>
            </div>

            {/* Live Meter Gauges Bar */}
            <LiveReadings result={session.lastResult} theme={theme} />

            {/* Split Grid: Left Circuit SVG & Chart, Right Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (2/3): Interactive Circuit SVG & V-I Linearity Chart */}
              <div className="lg:col-span-2 space-y-6">
                <CircuitSVG input={input} result={session.lastResult} theme={theme} />
                <ResultsChart observations={session.observations} currentResistance={input.resistance} theme={theme} />
                <ObservationsTable
                  observations={session.observations}
                  onDeleteObservation={handleDeleteObservation}
                  onClearObservations={handleClearObservations}
                  theme={theme}
                />
              </div>

              {/* Right Column (1/3): Lab Controls & Quick Diagnostics */}
              <div className="space-y-6">
                <LabControls
                  input={input}
                  onChangeInput={(newIn) => setInput(newIn)}
                  onRunSimulation={handleRunSimulation}
                  onResetControls={handleResetControls}
                  onInjectFault={handleInjectFault}
                  theme={theme}
                />

                {/* AI Diagnostic Quick Widget */}
                <div className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 flex items-center space-x-1.5">
                      <Bot className="w-4 h-4 text-indigo-500" />
                      <span>Troubleshooting Assistant</span>
                    </h4>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Active</span>
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Experiencing unexpected current readings or zero electron flow? Let the grounded AI tutor analyze your circuit data.
                  </p>

                  <button
                    onClick={() => setActiveTab('tutor')}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Open AI Tutor Diagnostic Panel</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: AI TUTOR PANEL */}
        {activeTab === 'tutor' && (
          <div className="max-w-4xl mx-auto">
            <TutorPanel
              currentInput={input}
              lastResult={session.lastResult}
              activeStep={session.completedSteps?.[session.completedSteps.length - 1] || 1}
              theme={theme}
            />
          </div>
        )}

        {/* TAB 5: PDF REPORT PREVIEW & EXPORT */}
        {activeTab === 'report' && (
          <ReportView session={session} theme={theme} />
        )}

      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${
        isDark ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LabVerse AI Virtual Laboratory System • Phase 1 MVP</span>
          <span className="font-mono text-[11px] opacity-70">Built with Next.js 16, TypeScript, Tailwind CSS & Recharts</span>
        </div>
      </footer>

    </div>
  );
}
