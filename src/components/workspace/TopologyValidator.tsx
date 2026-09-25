'use client';

import React from 'react';
import { TopologyVerificationResult } from '@/types';
import { CheckCircle2, AlertTriangle, XCircle, Info, Sparkles } from 'lucide-react';

interface TopologyValidatorProps {
  topology: TopologyVerificationResult | null;
  theme?: 'dark' | 'light';
}

export const TopologyValidator: React.FC<TopologyValidatorProps> = ({
  topology,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  if (!topology) return null;

  const isSuccess = topology.isValid && topology.errors.length === 0;
  const isWarning = isSuccess && topology.warnings.length > 0;

  return (
    <div className={`p-4 rounded-xl border space-y-2 transition-all ${
      !topology.canSimulate || topology.errors.length > 0
        ? isDark ? 'bg-rose-950/40 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm'
        : isWarning
        ? isDark ? 'bg-amber-950/40 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
        : isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
    }`}>
      
      {/* Title Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {!topology.canSimulate || topology.errors.length > 0 ? (
            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {topology.message}
            </h4>
            {topology.details && (
              <p className="text-[11px] opacity-80 leading-snug">{topology.details}</p>
            )}
          </div>
        </div>

        {topology.circuitTopology && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
            isSuccess
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}>
            {topology.circuitTopology}
          </span>
        )}
      </div>

      {/* Actionable Error Hints */}
      {topology.errors.map((err, i) => (
        <div key={i} className={`p-2 rounded-lg text-xs flex items-start space-x-2 ${
          isDark ? 'bg-slate-950/60 border border-rose-900/50 text-rose-300' : 'bg-white border border-rose-200 text-rose-800'
        }`}>
          <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{err.message}</p>
            {err.hint && <p className="text-[11px] opacity-90 mt-0.5"><strong>Hint:</strong> {err.hint}</p>}
          </div>
        </div>
      ))}

      {/* Actionable Warnings */}
      {topology.warnings.map((warn, i) => (
        <div key={i} className={`p-2 rounded-lg text-xs flex items-start space-x-2 ${
          isDark ? 'bg-slate-950/60 border border-amber-900/50 text-amber-300' : 'bg-white border border-amber-200 text-amber-800'
        }`}>
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{warn.message}</p>
          </div>
        </div>
      ))}

    </div>
  );
};
