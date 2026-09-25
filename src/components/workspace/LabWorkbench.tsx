'use client';

import React, { useState } from 'react';
import { ExperimentDefinition, LabComponent, WireConnection, SimulationResult, LearningMode, ComponentType } from '@/types';
import { InteractiveCanvas } from './InteractiveCanvas';
import { EquipmentTray } from './EquipmentTray';
import { ParameterControls } from './ParameterControls';
import { PropertyInspector } from './PropertyInspector';
import { TopologyValidator } from './TopologyValidator';
import { LiveGauges } from './LiveGauges';
import { ModeSelector } from './ModeSelector';
import { ChallengeBanner } from './ChallengeBanner';
import { Compass, Bot, CheckCircle2 } from 'lucide-react';

interface LabWorkbenchProps {
  experiment: ExperimentDefinition;
  components: LabComponent[];
  connections: WireConnection[];
  parameters: Record<string, number>;
  activeFaults: string[];
  mode: LearningMode;
  lastResult: SimulationResult | null;
  onUpdateComponents: (comps: LabComponent[]) => void;
  onUpdateConnections: (conns: WireConnection[]) => void;
  onParameterChange: (id: string, value: number) => void;
  onToggleFault: (faultId: string) => void;
  onChangeMode: (mode: LearningMode) => void;
  onRunSimulation: () => void;
  onStopSimulation: () => void;
  onResetToPreset: () => void;
  onClearCanvas: () => void;
  onResetControls: () => void;
  onOpenTutor: () => void;
  theme?: 'dark' | 'light';
}

export const LabWorkbench: React.FC<LabWorkbenchProps> = ({
  experiment,
  components,
  connections,
  parameters,
  activeFaults,
  mode,
  lastResult,
  onUpdateComponents,
  onUpdateConnections,
  onParameterChange,
  onToggleFault,
  onChangeMode,
  onRunSimulation,
  onStopSimulation,
  onResetToPreset,
  onClearCanvas,
  onResetControls,
  onOpenTutor,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [selectedComponent, setSelectedComponent] = useState<LabComponent | null>(null);
  const [selectedWire, setSelectedWire] = useState<WireConnection | null>(null);
  const [inspectingComponent, setInspectingComponent] = useState<LabComponent | null>(null);

  const handleAddComponent = (type: ComponentType) => {
    const eqDef = experiment.equipment.find(e => e.type === type);
    if (!eqDef) return;

    const newComp: LabComponent = {
      id: `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title: eqDef.title,
      domain: eqDef.domain,
      position: { x: 380 + Math.floor(Math.random() * 80), y: 200 + Math.floor(Math.random() * 40) },
      terminals: eqDef.terminals.map(t => ({ ...t })),
      properties: { ...eqDef.defaultProperties },
      state: {},
    };

    onUpdateComponents([...components, newComp]);
  };

  const handleUpdateInspectedComponent = (updated: LabComponent) => {
    const nextComps = components.map(c => (c.id === updated.id ? updated : c));
    onUpdateComponents(nextComps);
    setInspectingComponent(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Learning Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <ModeSelector currentMode={mode} onChangeMode={onChangeMode} theme={theme} />

        <button
          onClick={onOpenTutor}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 shrink-0 ${
            isDark
              ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/40'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300'
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-500" />
          <span>Ask AI Diagnostic Tutor</span>
        </button>
      </div>

      {/* Guided Mode Instructions / Challenge Banner */}
      {mode === 'CHALLENGE' && (
        <ChallengeBanner
          challenges={experiment.challenges}
          activeChallengeId={experiment.challenges?.[0]?.id}
          onSelectChallenge={() => {}}
          latestResult={lastResult}
          theme={theme}
        />
      )}

      {mode === 'GUIDED' && experiment.workspace.guidedSteps && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          isDark ? 'bg-slate-900 border-cyan-900/50 text-slate-200' : 'bg-cyan-50 border-cyan-200 text-cyan-950'
        }`}>
          <div className="flex items-center space-x-2.5">
            <Compass className="w-5 h-5 text-cyan-500 shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[10px] text-cyan-600 dark:text-cyan-400">
                Guided Step 01 / 0{experiment.workspace.guidedSteps.length}
              </span>
              <p className="font-semibold">{experiment.workspace.guidedSteps[0].instruction}</p>
            </div>
          </div>
          <span className="text-[11px] font-mono opacity-70 hidden sm:inline">Follow checklist in Theory & Prep tab</span>
        </div>
      )}

      {/* Live Measurement Gauges Bar */}
      <LiveGauges result={lastResult} theme={theme} />

      {/* Real-time Circuit Topology Validator */}
      <TopologyValidator topology={lastResult?.topology || null} theme={theme} />

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2/3): Interactive Breadboard Canvas & Equipment Tray */}
        <div className="lg:col-span-2 space-y-4">
          <InteractiveCanvas
            components={components}
            connections={connections}
            onUpdateComponents={onUpdateComponents}
            onUpdateConnections={onUpdateConnections}
            onSelectComponent={setSelectedComponent}
            selectedComponentId={selectedComponent?.id || null}
            selectedWireId={selectedWire?.id || null}
            onSelectWire={setSelectedWire}
            onInspectComponent={setInspectingComponent}
            isSimulating={lastResult?.visualState?.isOperating || false}
            electronVelocity={lastResult?.visualState?.electronVelocity || 2}
            theme={theme}
          />

          <EquipmentTray
            allowedEquipment={experiment.equipment}
            onAddComponent={handleAddComponent}
            onResetToPreset={onResetToPreset}
            onClearCanvas={onClearCanvas}
            theme={theme}
          />
        </div>

        {/* Right (1/3): Dynamic Parameter Controls & Quick Diagnostics */}
        <div className="space-y-4">
          <ParameterControls
            parameters={experiment.parameters}
            parameterValues={parameters}
            onParameterChange={onParameterChange}
            faults={experiment.faults}
            activeFaults={activeFaults}
            onToggleFault={onToggleFault}
            isSimulating={lastResult?.visualState?.isOperating || false}
            onRunSimulation={onRunSimulation}
            onStopSimulation={onStopSimulation}
            onResetControls={onResetControls}
            theme={theme}
          />
        </div>

      </div>

      {/* Floating Property Inspector Modal */}
      {inspectingComponent && (
        <PropertyInspector
          component={inspectingComponent}
          onClose={() => setInspectingComponent(null)}
          onUpdateComponent={handleUpdateInspectedComponent}
          theme={theme}
        />
      )}

    </div>
  );
};
