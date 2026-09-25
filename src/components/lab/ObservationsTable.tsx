'use client';

import React from 'react';
import { ObservationRecord } from '@/types';
import { formatCurrent } from '@/lib/simulation/engine';
import { Table, Trash2, Download, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ObservationsTableProps {
  observations: ObservationRecord[];
  onDeleteObservation: (id: string) => void;
  onClearObservations: () => void;
  theme?: 'dark' | 'light';
}

export const ObservationsTable: React.FC<ObservationsTableProps> = ({
  observations,
  onDeleteObservation,
  onClearObservations,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const exportCSV = () => {
    if (observations.length === 0) return;

    const headers = ['Run', 'Timestamp', 'Voltage (V)', 'Resistance (Ohm)', 'Theoretical Current (A)', 'Measured Current (A)', 'Fault Status', 'Notes'];
    const rows = observations.map((obs, idx) => [
      idx + 1,
      `"${obs.timestamp}"`,
      obs.voltage,
      obs.resistance,
      obs.theoreticalCurrent,
      obs.measuredCurrent,
      `"${obs.faultType}"`,
      `"${obs.notes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LabVerse_OhmsLaw_Data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`rounded-2xl border p-5 space-y-4 shadow-xl transition-colors ${
      isDark
        ? 'bg-slate-900 border-slate-800'
        : 'bg-white border-slate-200/90 shadow-slate-200/60'
    }`}>
      
      {/* Table Header Controls */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <Table className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-100' : 'text-slate-800'
          }`}>
            Empirical Measurement Log ({observations.length})
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
            <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
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

      {/* Table Content */}
      {observations.length === 0 ? (
        <div className={`py-8 text-center text-xs space-y-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <FileSpreadsheet className="w-8 h-8 mx-auto opacity-50" />
          <p>No measurement runs logged yet. Adjust voltage/resistance and click <strong>Run Simulation</strong>.</p>
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
                <th className="py-2.5 px-3">Voltage</th>
                <th className="py-2.5 px-3">Resistance</th>
                <th className="py-2.5 px-3">Theoretical I</th>
                <th className="py-2.5 px-3">Measured I</th>
                <th className="py-2.5 px-3">Circuit State</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-mono ${isDark ? 'divide-slate-850' : 'divide-slate-200'}`}>
              {observations.map((obs, idx) => (
                <tr key={obs.id} className={`transition-colors ${isDark ? 'hover:bg-slate-850/60' : 'hover:bg-slate-50'}`}>
                  <td className={`py-2.5 px-3 font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>#{idx + 1}</td>
                  <td className={`py-2.5 px-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{obs.timestamp}</td>
                  <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400 font-bold">{obs.voltage.toFixed(1)} V</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{obs.resistance.toFixed(0)} Ω</td>
                  <td className="py-2.5 px-3">{formatCurrent(obs.theoreticalCurrent)}</td>
                  <td className={`py-2.5 px-3 font-bold ${obs.faultType !== 'NORMAL' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-300'}`}>
                    {formatCurrent(obs.measuredCurrent)}
                  </td>
                  <td className="py-2.5 px-3">
                    {obs.faultType === 'NORMAL' ? (
                      <span className={`inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded border ${
                        isDark ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60' : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>NORMAL</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded border ${
                        isDark ? 'text-rose-400 bg-rose-950/60 border-rose-900/60' : 'text-rose-800 bg-rose-50 border-rose-200'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        <span>{obs.faultType}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onDeleteObservation(obs.id)}
                      className={`p-1 rounded transition-colors ${
                        isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                      title="Delete record"
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
