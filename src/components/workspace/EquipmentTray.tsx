'use client';

import React from 'react';
import { EquipmentDefinition, ComponentType } from '@/types';
import { 
  Battery, 
  Activity, 
  Gauge, 
  ToggleRight, 
  Plus, 
  RotateCcw, 
  Sparkles,
  Lightbulb,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface EquipmentTrayProps {
  allowedEquipment: EquipmentDefinition[];
  onAddComponent: (type: ComponentType) => void;
  onResetToPreset: () => void;
  onClearCanvas: () => void;
  theme?: 'dark' | 'light';
}

export const EquipmentTray: React.FC<EquipmentTrayProps> = ({
  allowedEquipment,
  onAddComponent,
  onResetToPreset,
  onClearCanvas,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const getIcon = (type: ComponentType) => {
    switch (type) {
      case 'BATTERY':
      case 'DC_SUPPLY':
        return <Battery className="w-5 h-5 text-cyan-400" />;
      case 'RESISTOR':
      case 'VARIABLE_RESISTOR':
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'AMMETER':
      case 'VOLTMETER':
        return <Gauge className="w-5 h-5 text-amber-400" />;
      case 'SWITCH':
        return <ToggleRight className="w-5 h-5 text-indigo-400" />;
      case 'BULB':
      case 'LED':
        return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      default:
        return <Plus className="w-5 h-5 text-cyan-400" />;
    }
  };

  // Supported components in current Ohm's law solver
  const supportedTypes: ComponentType[] = ['BATTERY', 'DC_SUPPLY', 'RESISTOR', 'VARIABLE_RESISTOR', 'AMMETER', 'SWITCH'];

  return (
    <div className={`rounded-2xl border p-4 space-y-3 transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2.5 gap-2 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Apparatus Component Palette
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
            isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            Click to add to board
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onResetToPreset}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 cursor-pointer ${
              isDark
                ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200'
            }`}
            title="Load Preloaded Ohm's Law Series Circuit Setup"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Ohm&apos;s Law Preset</span>
          </button>

          <button
            onClick={onClearCanvas}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 border-slate-300'
            }`}
            title="Clear all components on canvas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Board</span>
          </button>
        </div>
      </div>

      {/* Equipment Palette Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {allowedEquipment.map((eq) => {
          const isSolverSupported = supportedTypes.includes(eq.type);

          return (
            <button
              key={eq.type}
              onClick={() => onAddComponent(eq.type)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between group cursor-pointer hover:scale-[1.02] ${
                isDark
                  ? 'bg-slate-950/80 hover:bg-slate-850 border-slate-800 hover:border-cyan-500/50 shadow-sm'
                  : 'bg-slate-50 hover:bg-cyan-50/50 border-slate-200 hover:border-cyan-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  {getIcon(eq.type)}
                </div>

                {isSolverSupported ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Solver Ready</span>
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                    <HelpCircle className="w-2.5 h-2.5" />
                    <span>Visual</span>
                  </span>
                )}
              </div>

              <div className="mt-2">
                <p className={`text-xs font-bold ${isDark ? 'text-slate-200 group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-cyan-700'}`}>
                  {eq.title}
                </p>
                <p className={`text-[10px] line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {eq.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};
