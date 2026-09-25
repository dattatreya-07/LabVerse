'use client';

import React from 'react';
import { ExperimentSession, ExperimentDefinition } from '@/types';
import { generateGenericPDFReport } from '@/lib/report/pdf-generator';
import { FileText, Download, ShieldCheck, AlertTriangle, Cpu, Award, CheckCircle2 } from 'lucide-react';

interface ReportViewProps {
  session: ExperimentSession;
  experiment: ExperimentDefinition;
  theme?: 'dark' | 'light';
}

export const ReportView: React.FC<ReportViewProps> = ({ session, experiment, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const grade = session.grade;
  const isCompleted = session.isCompleted;

  const handleExport = () => {
    generateGenericPDFReport(session, experiment);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Top Banner Controls */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Official Laboratory Document Preview</span>
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {experiment.title} • Laboratory Report
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Compiled from live session data • Domain: {experiment.domain} • Session: {session.sessionId}
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Official PDF Report</span>
        </button>
      </div>

      {/* Official Grade Card (If Evaluated) */}
      {isCompleted && grade && (
        <div className={`p-6 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
          isDark 
            ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border-emerald-500/40 shadow-xl' 
            : 'bg-gradient-to-r from-emerald-50 via-white to-cyan-50 border-emerald-300 shadow-md'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-emerald-950 border-emerald-700 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-700'
            }`}>
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase ${
                isDark ? 'bg-emerald-950 text-emerald-400 border-emerald-700' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                CERTIFICATE OF COMPLETION • {grade.status}
              </span>
              <h3 className={`text-lg font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Overall Grade: {grade.score} / {grade.maxScore} Points ({grade.accuracyPercentage}% Scientific Accuracy)
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{grade.feedback}</p>
            </div>
          </div>

          <div className="hidden sm:block text-right font-mono text-xs text-slate-400">
            <div>Evaluated On</div>
            <div className="font-semibold text-slate-200">{new Date(grade.evaluatedAt).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      {/* Report Document Sheet Preview */}
      <div className={`rounded-2xl border p-6 sm:p-10 space-y-8 shadow-2xl transition-colors ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/60'
      }`}>
        
        {/* Report Header */}
        <div className={`flex flex-wrap items-center justify-between border-b pb-6 gap-4 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border text-cyan-600 dark:text-cyan-400 ${
              isDark ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
            }`}>
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>LabVerse AI Virtual Laboratory</h2>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Department of {experiment.domain} Science & Engineering</p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>SYSTEM VERIFIED REPORT</span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border text-xs ${
          isDark ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <span className={`uppercase tracking-wider font-semibold block text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Session ID</span>
            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm">{session.sessionId}</span>
          </div>
          <div>
            <span className={`uppercase tracking-wider font-semibold block text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Researcher</span>
            <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{session.studentName}</span>
          </div>
          <div>
            <span className={`uppercase tracking-wider font-semibold block text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Start Timestamp</span>
            <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{new Date(session.startTime).toLocaleString()}</span>
          </div>
        </div>

        {/* Section 1: Objective & Governing Model */}
        <div className="space-y-3">
          <h3 className={`text-base font-bold border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-200'}`}>
            1. Executive Objective & Governing Formula
          </h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {experiment.learningObjectives.map(o => typeof o === 'string' ? o : o.description).join(' ')}
          </p>
          <div className={`p-4 rounded-xl border text-center font-mono text-cyan-600 dark:text-cyan-300 text-sm font-bold ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-sky-50 border-cyan-200'
          }`}>
            {experiment.report.governingFormulaLatex}
          </div>
        </div>

        {/* Section 2: Observations Dataset */}
        <div className="space-y-3">
          <h3 className={`text-base font-bold border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-200'}`}>
            2. Empirical Observations Dataset ({session.observations.length} Runs)
          </h3>

          {session.observations.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No observation runs recorded in session. Run the simulation to log data points.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full text-left text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <thead className={`font-mono text-[10px] uppercase border-b ${
                  isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <tr>
                    <th className="py-2 px-3">Run #</th>
                    <th className="py-2 px-3">Time</th>
                    {Object.keys(session.observations[0].parameters).map(k => (
                      <th key={k} className="py-2 px-3 uppercase">{k}</th>
                    ))}
                    {Object.keys(session.observations[0].measurements).map(k => (
                      <th key={k} className="py-2 px-3 uppercase">{k.replace('_meas', '')}</th>
                    ))}
                    <th className="py-2 px-3">Fault State</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono text-xs ${isDark ? 'divide-slate-850' : 'divide-slate-200'}`}>
                  {session.observations.map((obs, idx) => (
                    <tr key={obs.id}>
                      <td className={`py-2 px-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>#{idx + 1}</td>
                      <td className={`py-2 px-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{obs.timestamp}</td>
                      {Object.keys(obs.parameters).map(k => (
                        <td key={k} className="py-2 px-3 text-cyan-600 dark:text-cyan-400 font-bold">{obs.parameters[k]}</td>
                      ))}
                      {Object.keys(obs.measurements).map(k => (
                        <td key={k} className="py-2 px-3 font-semibold">{obs.measurements[k]}</td>
                      ))}
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          obs.faultsActive.length === 0
                            ? isDark ? 'bg-emerald-950 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                            : isDark ? 'bg-rose-950 text-rose-400' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {obs.faultsActive.length === 0 ? 'NORMAL' : obs.faultsActive.join(', ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Fault Incident Log */}
        <div className="space-y-3">
          <h3 className={`text-base font-bold border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-200'}`}>
            3. Fault Diagnostics & Incident Log
          </h3>

          {session.faultLog.length === 0 ? (
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No fault anomalies injected during session.</p>
          ) : (
            <div className="space-y-2">
              {session.faultLog.map((log) => (
                <div key={log.id} className={`p-3 rounded-xl border text-xs flex items-start space-x-3 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-rose-600 dark:text-rose-300 font-bold">[{log.timestamp}] {log.action} - {log.faultTitle}</span>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Analytical Conclusion */}
        <div className={`space-y-2 pt-2 border-t text-xs ${
          isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
        }`}>
          <h3 className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>4. Final Verification Statement</h3>
          <p className="leading-relaxed">
            {experiment.report.expectedConclusionTemplate}
          </p>
        </div>

      </div>

    </div>
  );
};
