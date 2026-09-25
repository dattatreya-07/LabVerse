'use client';

import React, { useState } from 'react';
import { 
  ExperimentDefinition, 
  LabComponent, 
  WireConnection, 
  SimulationResult, 
  LearningMode, 
  ComponentType,
  SessionGrade
} from '@/types';
import { InteractiveCanvas } from './InteractiveCanvas';
import { EquipmentTray } from './EquipmentTray';
import { ParameterControls } from './ParameterControls';
import { PropertyInspector } from './PropertyInspector';
import { TopologyValidator } from './TopologyValidator';
import { LiveGauges } from './LiveGauges';
import { ModeSelector } from './ModeSelector';
import { ChallengeBanner } from './ChallengeBanner';
import { 
  Compass, 
  Bot, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckSquare, 
  Square 
} from 'lucide-react';

interface LabWorkbenchProps {
  experiment: ExperimentDefinition;
  components: LabComponent[];
  connections: WireConnection[];
  parameters: Record<string, number>;
  activeFaults: string[];
  mode: LearningMode;
  lastResult: SimulationResult | null;
  completedSteps?: number[];
  isCompleted?: boolean;
  grade?: SessionGrade;
  observationCount?: number;
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
  onToggleStep?: (stepId: number) => void;
  onCompleteSession?: () => void;
  onNavigateToReport?: () => void;
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
  completedSteps = [1],
  isCompleted = false,
  grade,
  observationCount = 0,
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
  onToggleStep,
  onCompleteSession,
  onNavigateToReport,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [selectedComponent, setSelectedComponent] = useState<LabComponent | null>(null);
  const [selectedWire, setSelectedWire] = useState<WireConnection | null>(null);
  const [inspectingComponent, setInspectingComponent] = useState<LabComponent | null>(null);

  const guidedSteps = experiment.workspace.guidedSteps || [];
  const totalSteps = guidedSteps.length || 1;
  const stepsDone = completedSteps.length;
  const progressPct = Math.min(100, Math.round((stepsDone / totalSteps) * 100));

  const handleAddComponent = (type: ComponentType) => {
    const eqDef = experiment.equipment.find(e => e.type === type);
    if (!eqDef) return;

    const newComp: LabComponent = {
      id: `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
      
      {/* 1. TOP LEARNING MODE SWITCHER & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <ModeSelector currentMode={mode} onChangeMode={onChangeMode} theme={theme} />

        <div className="flex items-center space-x-3">
          {/* Complete Lab Session Action Button */}
          {onCompleteSession && (
            <button
              onClick={onCompleteSession}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-md'
              }`}
            >
              {isCompleted ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Award className="w-4 h-4" />}
              <span>{isCompleted ? 'Lab Evaluated & Completed' : 'Complete & Submit Lab'}</span>
            </button>
          )}

          <button
            onClick={onOpenTutor}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer ${
              isDark
                ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/40'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-500" />
            <span>Ask AI Tutor</span>
          </button>
        </div>
      </div>

      {/* 2. LAB COMPLETION GRADE BANNER (IF COMPLETED) */}
      {isCompleted && grade && (
        <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          isDark 
            ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border-emerald-500/40 shadow-xl' 
            : 'bg-gradient-to-r from-emerald-50 via-white to-cyan-50 border-emerald-300 shadow-md'
        }`}>
          <div className="flex items-start space-x-3.5">
            <div className={`p-3 rounded-2xl border ${
              isDark ? 'bg-emerald-950 border-emerald-700 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-700'
            }`}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                  isDark ? 'bg-emerald-950 text-emerald-400 border-emerald-700' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  OFFICIAL GRADE: {grade.score} / {grade.maxScore} PTS ({grade.accuracyPercentage}% ACCURACY)
                </span>
                <span className="text-xs text-emerald-500 font-bold">• {grade.status}</span>
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Laboratory Session Completed Successfully
              </h3>
              <p className={`text-xs mt-0.5 leading-relaxed max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {grade.feedback}
              </p>
            </div>
          </div>

          {onNavigateToReport && (
            <button
              onClick={onNavigateToReport}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <span>View Certified Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 3. CHALLENGE MODE BANNER */}
      {mode === 'CHALLENGE' && (
        <ChallengeBanner
          challenges={experiment.challenges}
          activeChallengeId={experiment.challenges?.[0]?.id}
          onSelectChallenge={() => {}}
          latestResult={lastResult}
          theme={theme}
        />
      )}

      {/* 4. GUIDED MODE STEP TRACKER PROTOCOL */}
      {mode === 'GUIDED' && guidedSteps.length > 0 && (
        <div className={`p-4 rounded-2xl border space-y-3 text-xs transition-colors ${
          isDark ? 'bg-slate-900 border-cyan-900/50 text-slate-200' : 'bg-cyan-50 border-cyan-200 text-cyan-950'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-cyan-500 dark:text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-cyan-600 dark:text-cyan-400 block">
                  Guided Learning Protocol ({stepsDone}/{totalSteps} Steps • {progressPct}%)
                </span>
                <h4 className="font-bold text-sm">
                  {guidedSteps[0]?.title || 'Experimental Procedure'}
                </h4>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
                isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-cyan-100 text-cyan-800 border-cyan-300'
              }`}>
                {observationCount} Observations Logged
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {guidedSteps.map((step) => {
              const isDone = completedSteps.includes(step.stepNumber);
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => onToggleStep && onToggleStep(step.stepNumber)}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-all ${
                    isDone 
                      ? isDark ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-medium' : 'bg-cyan-100 border-cyan-300 text-cyan-900 font-semibold'
                      : isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-cyan-500 shrink-0" />
                  ) : (
                    <Square className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  )}
                  <span className="text-[11px] truncate">Step {step.stepNumber}: {step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. PRACTICE MODE */}
      {mode === 'PRACTICE' && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <span className="font-bold text-cyan-600 dark:text-cyan-400 block text-[10px] uppercase tracking-wider">Practice Sandbox</span>
              <span>Free-form experimentation. Adjust parameters, inject faults, and test hypotheses.</span>
            </div>
          </div>
          <span className="text-[11px] font-mono opacity-80">{observationCount} Runs Recorded</span>
        </div>
      )}

      {/* 6. Live Measurement Gauges Bar */}
      <LiveGauges result={lastResult} theme={theme} />

      {/* 7. Real-time Circuit Topology Validator */}
      <TopologyValidator topology={lastResult?.topology || null} theme={theme} />

      {/* 8. Main Workspace Split Grid */}
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

      {/* 9. Floating Property Inspector Modal */}
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
