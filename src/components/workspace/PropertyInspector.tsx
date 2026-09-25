'use client';

import React from 'react';
import { LabComponent } from '@/types';
import { X, Sliders, Check } from 'lucide-react';

interface PropertyInspectorProps {
  component: LabComponent | null;
  onClose: () => void;
  onUpdateComponent: (updated: LabComponent) => void;
  theme?: 'dark' | 'light';
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  component,
  onClose,
  onUpdateComponent,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  if (!component) return null;

  const handlePropertyChange = (key: string, value: unknown) => {
    const nextProperties = {
      ...component.properties,
      [key]: value,
    };
    onUpdateComponent({
      ...component,
      properties: nextProperties,
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4`}>
      <div className={`w-full max-w-md rounded-2xl border p-6 space-y-5 shadow-2xl transition-colors animate-in fade-in zoom-in-95 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{component.title}</h3>
              <p className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ID: {component.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Property Form */}
        <div className="space-y-4 text-xs">
          {component.type === 'BATTERY' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span>DC Voltage Output:</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  {typeof component.properties?.voltage === 'number' ? component.properties.voltage : 6.0} V
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                value={typeof component.properties?.voltage === 'number' ? component.properties.voltage : 6.0}
                onChange={(e) => handlePropertyChange('voltage', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          )}

          {component.type === 'RESISTOR' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span>Resistance Value:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {typeof component.properties?.resistance === 'number' ? component.properties.resistance : 20.0} Ω
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="1000"
                step="1"
                value={typeof component.properties?.resistance === 'number' ? component.properties.resistance : 20.0}
                onChange={(e) => handlePropertyChange('resistance', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          )}

          {component.type === 'SWITCH' && (
            <div className="flex items-center justify-between py-2 border-y border-slate-800">
              <span className="font-semibold">Switch State:</span>
              <button
                onClick={() => {
                  const isOpen = !component.state?.isOpen;
                  onUpdateComponent({ ...component, state: { ...component.state, isOpen } });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  component.state?.isOpen
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}
              >
                {component.state?.isOpen ? 'OPEN (Disconnected)' : 'CLOSED (Conducting)'}
              </button>
            </div>
          )}

          {/* Position & Orientation Info */}
          <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <p>Position: (X: {component.position.x}, Y: {component.position.y})</p>
            <p>Rotation: {component.rotation || 0}°</p>
            <p>Terminals: {component.terminals.length} connected ports</p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </div>

      </div>
    </div>
  );
};
