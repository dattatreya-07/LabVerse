'use client';

import React, { useState } from 'react';
import { useWebSerial } from '@/hooks/useWebSerial';
import { 
  Cpu, 
  Usb, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Activity, 
  RefreshCw, 
  Send, 
  Zap, 
  Terminal, 
  ShieldAlert 
} from 'lucide-react';

interface HardwareSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParameter: (paramId: string, value: number) => void;
  theme?: 'dark' | 'light';
}

export const HardwareSyncModal: React.FC<HardwareSyncModalProps> = ({
  isOpen,
  onClose,
  onApplyParameter,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [commandInput, setCommandInput] = useState<string>('');
  const [receivedLogs, setReceivedLogs] = useState<Array<{ time: string; text: string }>>([]);
  const [autoMap, setAutoMap] = useState<boolean>(true);

  const { status, errorMessage, lastData, isSupported, connect, disconnect, sendCommand } = useWebSerial((data) => {
    setReceivedLogs(prev => [
      { time: new Date().toLocaleTimeString(), text: data.raw },
      ...prev.slice(0, 40),
    ]);

    if (autoMap) {
      for (const [key, val] of Object.entries(data.parameters)) {
        onApplyParameter(key, val);
      }
    }
  });

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    await sendCommand(commandInput.trim());
    setCommandInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-2xl rounded-[24px] border p-6 sm:p-8 space-y-6 shadow-2xl transition-all ${
        isDark ? 'bg-[#141B24] border-[#2A3644] text-white' : 'bg-white border-[#E8E2DC] text-[#0F151D]'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-[#2A3644] border-[#E8E2DC]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF7448]/10 border border-[#FF7448]/20 flex items-center justify-center text-[#FF7448]">
              <Usb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center space-x-2">
                <span>Hardware Bridge (WebSerial API)</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  status === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : status === 'connecting'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                }`}>
                  {status.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Stream real-time sensor & potentiometer telemetry from Arduino / ESP32 into virtual experiments.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800/40 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Support Check */}
        {!isSupported && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">WebSerial Not Supported In This Browser</p>
              <p className="mt-1 opacity-90">
                The WebSerial API is supported on Chromium-based browsers (Google Chrome, Microsoft Edge, Opera, Brave). Please switch browsers to connect physical USB microcontrollers.
              </p>
            </div>
          </div>
        )}

        {/* Connection Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Baud Rate</label>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(Number(e.target.value))}
              disabled={status === 'connected'}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono font-medium border bg-[#0D1219] dark:bg-[#0D1219] border-[#2A3644] focus:outline-none focus:ring-1 focus:ring-[#FF7448]"
            >
              <option value={9600}>9600 Baud</option>
              <option value={19200}>19200 Baud</option>
              <option value={38400}>38400 Baud</option>
              <option value={57600}>57600 Baud</option>
              <option value={115200}>115200 Baud (Standard)</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end gap-3">
            {status !== 'connected' ? (
              <button
                onClick={() => connect(baudRate)}
                disabled={!isSupported || status === 'connecting'}
                className="btn-pill-primary h-10 px-6 text-xs flex-1 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Usb className="w-4 h-4" />
                <span>{status === 'connecting' ? 'Connecting...' : 'Connect USB Device'}</span>
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="px-6 h-10 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-bold transition-all flex-1 cursor-pointer flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Disconnect Hardware</span>
              </button>
            )}

            <button
              onClick={() => setAutoMap(!autoMap)}
              className={`h-10 px-4 rounded-full border text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                autoMap
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Auto-Sync: {autoMap ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Live Telemetry Terminal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>LIVE SERIAL LOG</span>
            </span>
            <span className="text-[10px] text-emerald-400">
              {status === 'connected' ? 'STREAMING ACTIVE' : 'AWAITING PORT'}
            </span>
          </div>

          <div className="h-40 rounded-xl bg-[#0A0E14] border border-[#2A3644] p-3 font-mono text-[11px] text-emerald-400/90 overflow-y-auto space-y-1 select-text">
            {receivedLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600">
                <span>No serial data received yet. Click &quot;Connect USB Device&quot; to begin.</span>
              </div>
            ) : (
              receivedLogs.map((log, idx) => (
                <div key={idx} className="leading-snug">
                  <span className="text-slate-500 mr-2">[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Send Command Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            disabled={status !== 'connected'}
            placeholder={status === 'connected' ? 'Send command to Arduino (e.g. SET:V=5.0)...' : 'Connect port to send commands'}
            className="flex-1 px-4 py-2 rounded-full border text-xs font-mono bg-[#0D1219] border-[#2A3644] focus:outline-none focus:ring-1 focus:ring-[#FF7448] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status !== 'connected' || !commandInput.trim()}
            className="btn-pill-primary h-9 px-4 text-xs cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        {/* Code Snippet for Arduino */}
        <div className="p-3.5 rounded-xl bg-[#0D1219] border border-[#2A3644] text-[11px] font-mono text-slate-400 space-y-1.5">
          <p className="font-bold text-slate-200">Example Arduino / ESP32 C++ Code:</p>
          <pre className="text-emerald-400 overflow-x-auto">
{`void loop() {
  float voltage = analogRead(A0) * (5.0 / 1023.0);
  Serial.print("voltage:"); Serial.println(voltage);
  delay(100);
}`}
          </pre>
        </div>

      </div>
    </div>
  );
};
