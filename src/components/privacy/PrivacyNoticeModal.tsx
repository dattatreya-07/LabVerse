'use client';

import React, { useState } from 'react';
import { ShieldCheck, Trash2, Lock, Cpu, Database, CheckCircle2, X } from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearLocalData: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({
  isOpen,
  onClose,
  onClearLocalData,
}) => {
  const [cleared, setCleared] = useState(false);

  if (!isOpen) return null;

  const handleClear = () => {
    onClearLocalData();
    setCleared(true);
    setTimeout(() => {
      setCleared(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-slate-100">LabVerse Privacy & Security Disclosures</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: Data Storage */}
          <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <Database className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-200 text-base mb-1">1. Local & Guest Data Storage</h3>
              <p>
                In <strong>Guest Mode</strong>, all session state, circuit apparatus configurations, parameter tweaks, and empirical observations remain <strong>100% on your local device inside your browser&apos;s localStorage</strong>. No user registration or personal identification is required.
              </p>
            </div>
          </div>

          {/* Section 2: AI Processing */}
          <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <Cpu className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-200 text-base mb-1">2. AI Tutor & External Data Processing</h3>
              <p>
                When you submit queries to the <strong>AI Science Tutor</strong>, only the sanitized apparatus numerical measurements and physics question are transmitted to server-side inference engines (Groq API).
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-400 list-disc list-inside">
                <li>Zero personal student names, email addresses, or school identifiers are collected or sent.</li>
                <li>Inputs are automatically scrubbed for sensitive patterns before submission.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Data Deletion */}
          <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <Lock className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-200 text-base mb-1">3. Complete Student Data Deletion</h3>
              <p>
                You hold total ownership of your local laboratory history. Click the button below to purge all cached sessions, observations, and telemetry from your browser.
              </p>
            </div>
          </div>

          {cleared && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All local browser session records have been purged successfully!</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-t border-slate-800">
          <button
            onClick={handleClear}
            disabled={cleared}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-rose-100 text-xs font-medium transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Purge All Local Data</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            Close Disclosures
          </button>
        </div>
      </div>
    </div>
  );
};
