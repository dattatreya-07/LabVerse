'use client';

import React, { useState, useEffect } from 'react';
import { Header, NavTab } from '@/components/nav/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ExperimentCatalog } from '@/components/catalog/ExperimentCatalog';
import { ExperimentPrep } from '@/components/prep/ExperimentPrep';
import { LabWorkbench } from '@/components/workspace/LabWorkbench';
import { ObservationLog } from '@/components/analysis/ObservationLog';
import { AnalysisChart } from '@/components/analysis/AnalysisChart';
import { TutorPanel } from '@/components/tutor/TutorPanel';
import { ReportView } from '@/components/report/ReportView';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';

import { ExperimentSession, LearningMode, LabComponent, WireConnection, ObservationRecord, FaultLogEntry } from '@/types';
import { getExperiment } from '@/lib/experiments/registry';
import { loadExperimentSession, saveExperimentSession, clearExperimentSession } from '@/lib/session/storage';

export default function Home() {
  const [selectedExpId, setSelectedExpId] = useState<string>('ohms-law');
  const [session, setSession] = useState<ExperimentSession>(() => loadExperimentSession('ohms-law', 'GUIDED'));
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('labverse_theme') as 'dark' | 'light' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    }
    return 'dark';
  });

  const addToast = (type: 'success' | 'warning' | 'info', title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      description,
    };
    setToasts(prev => [...prev.slice(-3), newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // URL state synchronization on mount & back navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as NavTab | null;
      const expParam = params.get('exp');

      if (expParam && expParam !== selectedExpId) {
        setSelectedExpId(expParam);
        const loaded = loadExperimentSession(expParam, 'GUIDED');
        setSession(loaded);
      }

      if (tabParam && ['dashboard', 'catalog', 'prep', 'lab', 'analysis', 'tutor', 'report'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const syncUrlParams = (tab: NavTab, expId: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      url.searchParams.set('exp', expId);
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    syncUrlParams(tab, selectedExpId);
  };

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
    syncUrlParams('prep', expId);
    addToast('info', `Selected ${getExperiment(expId).title}`, 'Review theory and apparatus setup before entering lab.');
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
    const isCurrentlyActive = session.activeFaults.includes(faultId);
    const activeFaults = isCurrentlyActive
      ? session.activeFaults.filter(f => f !== faultId)
      : [...session.activeFaults, faultId];

    const faultDef = currentExperiment.faults?.find(f => f.id === faultId);
    const action = isCurrentlyActive ? 'REPAIRED' : 'INJECTED';

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

    if (isCurrentlyActive) {
      addToast('success', `Repaired Fault: ${faultDef?.title || faultId}`, 'Circuit restored to normal operations.');
    } else {
      addToast('warning', `Fault Injected: ${faultDef?.title || faultId}`, 'Observe how instrument readings deviate.');
    }
  };

  const handleChangeMode = (mode: LearningMode) => {
    updateSessionState({
      ...session,
      mode,
    });
    addToast('info', `Switched to ${mode} Mode`, `Workspace calibrated for ${mode.toLowerCase()} learning.`);
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

      if (result.success) {
        addToast('success', 'Simulation Executed Successfully', `Recorded Observation #${newObs.runIndex}.`);
      } else {
        addToast('warning', 'Simulation Warning', result.topology.message || 'Circuit topology check flagged issues.');
      }
    } catch (err) {
      console.error('Simulation execution error:', err);
      addToast('warning', 'Simulation Error', 'Check wire connections and component parameters.');
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
      addToast('info', 'Simulation Stopped', 'Circuit power disconnected.');
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
      addToast('info', 'Reset to Default Preset', 'Apparatus layout restored.');
    }
  };

  const handleClearCanvas = () => {
    updateSessionState({
      ...session,
      components: [],
      connections: [],
    });
    addToast('info', 'Canvas Cleared', 'All components and wires removed.');
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
    addToast('info', 'Parameters Reset', 'Default experimental parameters restored.');
  };

  const handleResetSession = () => {
    if (window.confirm(`Reset ${currentExperiment.title} session? All recorded data and apparatus positions will be restored to defaults.`)) {
      const fresh = clearExperimentSession(currentExperiment.id);
      setSession(fresh);
      addToast('info', 'Session Restored', 'Experimental session reset to defaults.');
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
    addToast('info', 'Observation Removed', 'Data record deleted from log.');
  };

  const handleClearObservations = () => {
    updateSessionState({
      ...session,
      observations: [],
    });
    addToast('info', 'Log Cleared', 'All observation records removed.');
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} theme={theme} />

      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        session={session}
        experiment={currentExperiment}
        onResetSession={handleResetSession}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 0: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView
            currentSession={session}
            currentExperiment={currentExperiment}
            onSelectExperiment={handleSelectExperiment}
            onNavigateTab={handleTabChange}
            theme={theme}
          />
        )}

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
            onGoToLab={() => handleTabChange('lab')}
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
            onOpenTutor={() => handleTabChange('tutor')}
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
          <span>LabVerse Science Platform • Phase 2 Production Architecture</span>
          <span className="font-mono text-[11px] opacity-70">Next.js 16 • React 19 • TypeScript • Tailwind v4 • Recharts • jsPDF</span>
        </div>
      </footer>

    </div>
  );
}
