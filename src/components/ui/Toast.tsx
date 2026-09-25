'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} isDark={isDark} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void; isDark: boolean }> = ({
  toast,
  onDismiss,
  isDark,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/40';
      case 'warning':
        return 'border-amber-500/40';
      default:
        return 'border-cyan-500/40';
    }
  };

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start justify-between space-x-3 transition-all animate-in slide-in-from-bottom-5 duration-300 ${getBorderColor()} ${
        isDark ? 'bg-slate-900/95 backdrop-blur-md text-slate-100' : 'bg-white/95 backdrop-blur-md text-slate-900'
      }`}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div>
          <h4 className="text-xs font-bold">{toast.title}</h4>
          {toast.description && (
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {toast.description}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
