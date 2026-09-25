'use client';

import React from 'react';
import { ObservationRecord, ParameterDefinition } from '@/types';
import { Table, Trash2, Download, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ObservationLogProps {
  observations: ObservationRecord[];
  parameters: ParameterDefinition[];
  onDeleteObservation: (id: string) => void;
  onClearObservations: () => void;
  theme?: 'dark' | 'light';
}

export const ObservationLog: React.FC<ObservationLogProps> = ({
  observations,
  parameters,
  onDeleteObservation,
  onClearObservations,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const exportCSV = () => {
    if (observations.length === 0) return;

    // Collect all parameter and measurement keys
    const paramKeys = Object.keys(observations[0].parameters);
    const measKeys = Object.keys(observations[0].measurements);

    const headers = ['Run #', 'Timestamp', ...paramKeys, ...measKeys, 'Faults', 'Notes'];
    const rows = observations.map((obs, idx) => [
      idx + 1,
      `"${obs.timestamp}"`,
      ...paramKeys.map(k => obs.parameters[k] ?? ''),
      ...measKeys.map(k => obs.measurements[k] ?? ''),
      `"${obs.faultsActive.join('; ')}"`,
      `"${obs.notes || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LabVerse_Experiment_Data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`rounded-2xl border p-5 space-y-4 shadow-xl transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <Table className="w-4 h-4 text-cyan-500" />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-100' : 'text-slate-800'
          }`}>
            Empirical Measurement Log ({observations.length} Runs)
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            disabled={observations.length === 0}
            className={`px-3 py-1.5 rounded-lg disabled:opacity-40 text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onClearObservations}
            disabled={observations.length === 0}
            className={`px-3 py-1.5 rounded-lg disabled:opacity-40 text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
              isDark
                ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-900/60'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Table Data */}
      {observations.length === 0 ? (
        <div className={`py-8 text-center text-xs space-y-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <FileSpreadsheet className="w-8 h-8 mx-auto opacity-50" />
          <p>No measurement runs recorded yet. Adjust parameters and click <strong>Run Experiment</strong>.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <thead className={`font-mono text-[10px] uppercase tracking-wider border-b ${
              isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="py-2.5 px-3">Run #</th>
                <th className="py-2.5 px-3">Time</th>
                {Object.keys(observations[0].parameters).map(k => (
                  <th key={k} className="py-2.5 px-3 uppercase">{k}</th>
                ))}
                {Object.keys(observations[0].measurements).map(k => (
                  <th key={k} className="py-2.5 px-3 uppercase">{k.replace('_meas', '')}</th>
                ))}
                <th className="py-2.5 px-3">Fault State</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-mono ${isDark ? 'divide-slate-850' : 'divide-slate-200'}`}>
              {observations.map((obs, idx) => (
                <tr key={obs.id} className={`transition-colors ${isDark ? 'hover:bg-slate-850/60' : 'hover:bg-slate-50'}`}>
                  <td className="py-2.5 px-3 font-bold opacity-60">#{idx + 1}</td>
                  <td className="py-2.5 px-3 text-[11px] opacity-70">{obs.timestamp}</td>
                  {Object.keys(obs.parameters).map(k => (
                    <td key={k} className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400 font-bold">
                      {obs.parameters[k]}
                    </td>
                  ))}
                  {Object.keys(obs.measurements).map(k => (
                    <td key={k} className="py-2.5 px-3 font-semibold">
                      {obs.measurements[k]}
                    </td>
                  ))}
                  <td className="py-2.5 px-3">
                    {obs.faultsActive.length === 0 ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>NORMAL</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{obs.faultsActive.join(', ')}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onDeleteObservation(obs.id)}
                      className={`p-1 rounded transition-colors ${
                        isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                      title="Delete run record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
