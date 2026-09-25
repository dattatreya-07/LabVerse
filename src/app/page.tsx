'use client';

import React, { useState } from 'react';
import { Header } from '@/components/nav/Header';
import { ExperimentCatalog } from '@/components/catalog/ExperimentCatalog';
import { ExperimentPrep } from '@/components/prep/ExperimentPrep';
import { LabWorkbench } from '@/components/workspace/LabWorkbench';
import { ObservationLog } from '@/components/analysis/ObservationLog';
import { AnalysisChart } from '@/components/analysis/AnalysisChart';
import { TutorPanel } from '@/components/tutor/TutorPanel';
import { ReportView } from '@/components/report/ReportView';

import { ExperimentSession, LearningMode, LabComponent, WireConnection, ObservationRecord, FaultLogEntry } from '@/types';
import { getExperiment } from '@/lib/experiments/registry';
import { loadExperimentSession, saveExperimentSession, clearExperimentSession } from '@/lib/session/storage';

export default function Home() {
  const [selectedExpId, setSelectedExpId] = useState<string>('ohms-law');
  const [session, setSession] = useState<ExperimentSession>(() => loadExperimentSession('ohms-law', 'GUIDED'));
  const [activeTab, setActiveTab] = useState<'catalog' | 'prep' | 'lab' | 'analysis' | 'tutor' | 'report'>('lab');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('labverse_theme') as 'dark' | 'light' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    }
    return 'dark';
  });

  const currentExperiment = getExperiment(selectedExpId);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('labverse_theme', nextTheme);
  };

  const handleSelectExperiment = (expId: string) => {
    setSelectedExpId(expId);
    const loaded = loadExperimentSession(expId, 'GUIDED');
    setSession(loaded);
    setActiveTab('prep');
  };

  const isDark = theme === 'dark';

  const updateSessionState = (newSession: ExperimentSession) => {
    setSession(newSession);
    saveExperimentSession(newSession);
  };

  const handleUpdateComponents = (comps: LabComponent[]) => {
    const updated = {
      ...session,
      components: comps,
    };
    updateSessionState(updated);
  };

  const handleUpdateConnections = (conns: WireConnection[]) => {
    const updated = {
      ...session,
      connections: conns,
    };
    updateSessionState(updated);
  };

  const handleParameterChange = (paramId: string, value: number) => {
    const nextParams = {
      ...session.parameters,
      [paramId]: value,
    };

    // If components on board have matching property, sync them
    const nextComps = session.components.map(c => {
      if (paramId === 'voltage' && (c.type === 'BATTERY' || c.type === 'DC_SUPPLY')) {
        return { ...c, properties: { ...c.properties, voltage: value } };
      }
      if (paramId === 'resistance' && (c.type === 'RESISTOR' || c.type === 'VARIABLE_RESISTOR')) {
        return { ...c, properties: { ...c.properties, resistance: value } };
      }
      return c;
    });

    const updated = {
      ...session,
      parameters: nextParams,
      components: nextComps,
    };
    updateSessionState(updated);
  };

  const handleToggleFault = (faultId: string) => {
    const activeFaults = session.activeFaults.includes(faultId)
      ? session.activeFaults.filter(f => f !== faultId)
      : [...session.activeFaults, faultId];

    const faultDef = currentExperiment.faults?.find(f => f.id === faultId);
    const action = session.activeFaults.includes(faultId) ? 'REPAIRED' : 'INJECTED';

    const logEntry: FaultLogEntry = {
      id: `fault-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      faultId,
      faultTitle: faultDef?.title || faultId,
      action,
      details: faultDef?.description || `Fault state updated: ${action}`,
    };

    const updated = {
      ...session,
      activeFaults,
      faultLog: [logEntry, ...session.faultLog],
    };
    updateSessionState(updated);
  };

  const handleChangeMode = (mode: LearningMode) => {
    updateSessionState({
      ...session,
      mode,
    });
  };

  const handleRunSimulation = () => {
    try {
      const simInput = {
        experimentId: currentExperiment.id,
        components: session.components,
        connections: session.connections,
        parameters: session.parameters,
        activeFaults: session.activeFaults,
      };

      const result = currentExperiment.simulate(simInput);

      // Create empirical observation record
      const measMap: Record<string, number> = {};
      const theoMap: Record<string, number> = {};

      result.measurements.forEach(m => {
        measMap[m.id] = m.observedValue;
        theoMap[m.id] = m.theoreticalValue;
      });

      const newObs: ObservationRecord = {
        id: `obs-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        runIndex: session.observations.length + 1,
        parameters: { ...session.parameters },
        measurements: measMap,
        theoreticalValues: theoMap,
        faultsActive: [...session.activeFaults],
        circuitTopology: result.topology.circuitTopology,
        notes: result.topology.message,
      };

      const updated = {
        ...session,
        lastResult: result,
        observations: [newObs, ...session.observations],
      };
      updateSessionState(updated);
    } catch (err) {
      console.error('Simulation execution error:', err);
    }
  };

  const handleStopSimulation = () => {
    if (session.lastResult) {
      const halted = {
        ...session.lastResult,
        visualState: {
          ...session.lastResult.visualState,
          isOperating: false,
          electronVelocity: 0,
        },
      };
      updateSessionState({
        ...session,
        lastResult: halted,
      });
    }
  };

  const handleResetToPreset = () => {
    const defaultPreset = currentExperiment.workspace.defaultPreset;
    if (defaultPreset) {
      const resetComps = defaultPreset.components.map(c => ({ ...c }));
      const resetConns = defaultPreset.connections.map(w => ({ ...w }));
      updateSessionState({
        ...session,
        components: resetComps,
        connections: resetConns,
      });
    }
  };

  const handleClearCanvas = () => {
    updateSessionState({
      ...session,
      components: [],
      connections: [],
    });
  };

  const handleResetControls = () => {
    const defaultParams: Record<string, number> = {};
    currentExperiment.parameters.forEach(p => {
      defaultParams[p.id] = p.defaultValue;
    });

    updateSessionState({
      ...session,
      parameters: defaultParams,
      activeFaults: [],
    });
  };

  const handleResetSession = () => {
    if (window.confirm(`Reset ${currentExperiment.title} session? All recorded data and apparatus positions will be restored to defaults.`)) {
      const fresh = clearExperimentSession(currentExperiment.id);
      setSession(fresh);
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
      
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        session={session}
        experiment={currentExperiment}
        onResetSession={handleResetSession}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: EXPERIMENT CATALOG */}
        {activeTab === 'catalog' && (
          <ExperimentCatalog
            onSelectExperiment={handleSelectExperiment}
            theme={theme}
          />
        )}

        {/* TAB 2: THEORY & PREPARATION */}
        {activeTab === 'prep' && (
          <ExperimentPrep
            experiment={currentExperiment}
            completedSteps={session.completedSteps || []}
            onToggleStep={handleToggleStep}
            onGoToLab={() => setActiveTab('lab')}
            theme={theme}
          />
        )}

        {/* TAB 3: VIRTUAL LABORATORY WORKSPACE */}
        {activeTab === 'lab' && (
          <LabWorkbench
            experiment={currentExperiment}
            components={session.components}
            connections={session.connections}
            parameters={session.parameters}
            activeFaults={session.activeFaults}
            mode={session.mode}
            lastResult={session.lastResult}
            onUpdateComponents={handleUpdateComponents}
            onUpdateConnections={handleUpdateConnections}
            onParameterChange={handleParameterChange}
            onToggleFault={handleToggleFault}
            onChangeMode={handleChangeMode}
            onRunSimulation={handleRunSimulation}
            onStopSimulation={handleStopSimulation}
            onResetToPreset={handleResetToPreset}
            onClearCanvas={handleClearCanvas}
            onResetControls={handleResetControls}
            onOpenTutor={() => setActiveTab('tutor')}
            theme={theme}
          />
        )}

        {/* TAB 4: DATA & PLOTS */}
        {activeTab === 'analysis' && (
          <div className="space-y-6 pb-12">
            <AnalysisChart
              observations={session.observations}
              analysis={currentExperiment.analysis}
              theme={theme}
            />

            <ObservationLog
              observations={session.observations}
              onDeleteObservation={handleDeleteObservation}
              onClearObservations={handleClearObservations}
              theme={theme}
            />
          </div>
        )}

        {/* TAB 5: AI TUTOR PANEL */}
        {activeTab === 'tutor' && (
          <div className="max-w-4xl mx-auto">
            <TutorPanel
              experiment={currentExperiment}
              components={session.components}
              connections={session.connections}
              parameters={session.parameters}
              activeFaults={session.activeFaults}
              lastResult={session.lastResult}
              theme={theme}
            />
          </div>
        )}

        {/* TAB 6: OFFICIAL PDF REPORT */}
        {activeTab === 'report' && (
          <ReportView
            session={session}
            experiment={currentExperiment}
            theme={theme}
          />
        )}

      </main>

      {/* Global Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${
        isDark ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LabVerse Modular Experiment Platform • Phase 1 & 2 Platform Architecture</span>
          <span className="font-mono text-[11px] opacity-70">Next.js 16 • React 19 • TypeScript • Tailwind v4 • Recharts • jsPDF</span>
        </div>
      </footer>

    </div>
  );
}
