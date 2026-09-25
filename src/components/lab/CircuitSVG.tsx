'use client';

import React from 'react';
import { CircuitInput, SimulationResult, FaultType } from '@/types';
import { getResistorColorBands, formatCurrent } from '@/lib/simulation/engine';
import { AlertTriangle, Zap, CheckCircle2, XCircle } from 'lucide-react';

interface CircuitSVGProps {
  input: CircuitInput;
  result: SimulationResult | null;
  theme?: 'dark' | 'light';
}

export const CircuitSVG: React.FC<CircuitSVGProps> = ({ input, result, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const voltage = input.voltage;
  const resistance = input.resistance;
  const faultType = input.faultType;

  const colorBands = getResistorColorBands(resistance);
  const isClosed = result ? result.isCircuitClosed : faultType !== 'OPEN_CIRCUIT';
  const circuitCurrent = result ? result.circuitCurrent : (voltage / resistance);
  const measuredCurrent = result ? result.measuredCurrent : circuitCurrent;

  // Particle animation speed (duration in seconds) based on current magnitude
  const animDuration = circuitCurrent > 0 ? Math.max(0.6, 4 / (circuitCurrent * 2 + 0.1)) : 0;

  // Needle angle for ammeter dial (0 to 180 deg for 0 to 2.5 A)
  const needleAngle = Math.min(180, Math.max(0, (measuredCurrent / 2.5) * 180)) - 90;

  return (
    <div className={`relative rounded-2xl p-4 sm:p-6 shadow-xl overflow-hidden space-y-4 border transition-colors ${
      isDark
        ? 'bg-slate-950 border-slate-800'
        : 'bg-white border-slate-200/90 shadow-slate-200/60'
    }`}>
      
      {/* Status Overlay Header */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
        isDark ? 'border-slate-850' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isClosed ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {faultType === 'NORMAL' && 'Normal Series Circuit'}
            {faultType === 'OPEN_CIRCUIT' && 'Open Circuit Fault (Discontinuity)'}
            {faultType === 'METER_FAULT' && 'Ammeter Calibration Fault (+150%)'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">V = {voltage.toFixed(1)}V</span>
          <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>|</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">R = {resistance.toFixed(0)}Ω</span>
          <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>|</span>
          <span className="text-amber-600 dark:text-amber-300 font-semibold">
            I<sub>meas</sub> = {formatCurrent(measuredCurrent)}
          </span>
        </div>
      </div>

      {/* SVG Circuit Canvas */}
      <div className={`w-full flex items-center justify-center rounded-xl border p-2 sm:p-4 transition-colors ${
        isDark
          ? 'bg-slate-900/60 border-slate-800'
          : 'bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50/40 border-slate-200 shadow-inner'
      }`}>
        <svg
          viewBox="0 0 800 440"
          className="w-full h-auto max-h-[380px] drop-shadow-md select-none"
        >
          <defs>
            {/* Glowing Wire Filter */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Electron Flow Path */}
            <path
              id="circuit-path"
              d="M 120 220 L 120 70 L 680 70 L 680 370 L 120 370 Z"
              fill="none"
            />
          </defs>

          {/* MAIN CIRCUIT WIRES */}
          {/* Base Wire Track */}
          <rect
            x="110" y="60" width="580" height="320" rx="10" fill="none"
            stroke={isDark ? "#334155" : "#cbd5e1"} strokeWidth="8"
          />
          
          {/* Active Conducting Wire Overlay */}
          <path
            d="M 120 220 L 120 70 L 680 70 L 680 370 L 120 370 Z"
            fill="none"
            stroke={isClosed && voltage > 0 ? "#0284c7" : isDark ? "#475569" : "#94a3b8"}
            strokeWidth="4"
            filter={isClosed && voltage > 0 ? "url(#glow-cyan)" : undefined}
          />

          {/* ANIMATED ELECTRON PARTICLES */}
          {isClosed && voltage > 0 && (
            <g>
              {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((offset, i) => (
                <circle key={i} r="4.5" fill={isDark ? "#38bdf8" : "#0284c7"} filter="url(#glow-cyan)">
                  <animateMotion
                    path="M 120 220 L 120 70 L 680 70 L 680 370 L 120 370 Z"
                    dur={`${animDuration}s`}
                    repeatCount="indefinite"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    begin={`${offset * animDuration}s`}
                  />
                </circle>
              ))}
            </g>
          )}

          {/* COMPONENT 1: VARIABLE DC BATTERY (Left Branch: X=120, Y=220) */}
          <g transform="translate(120, 220)">
            <circle r="36" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#0284c7" strokeWidth="3" />
            <line x1="-16" y1="-14" x2="16" y2="-14" stroke="#0284c7" strokeWidth="4" />
            <line x1="-8" y1="-4" x2="8" y2="-4" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="3" />
            <line x1="-16" y1="6" x2="16" y2="6" stroke="#0284c7" strokeWidth="4" />
            <line x1="-8" y1="16" x2="8" y2="16" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="3" />

            <text x="-48" y="-2" fill="#0284c7" fontSize="16" fontWeight="bold" textAnchor="end">+</text>
            <text x="-48" y="18" fill={isDark ? "#94a3b8" : "#64748b"} fontSize="16" fontWeight="bold" textAnchor="end">-</text>

            <rect x="-42" y="44" width="84" height="24" rx="6" fill="#0284c7" />
            <text x="0" y="60" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
              {voltage.toFixed(1)} V DC
            </text>
          </g>

          {/* COMPONENT 2: RESISTOR (Top Branch: X=400, Y=70) */}
          <g transform="translate(400, 70)">
            <rect x="-70" y="-18" width="140" height="36" rx="6" fill={isDark ? "#1e293b" : "#ffffff"} stroke="#0284c7" strokeWidth="2.5" />
            
            {/* Ceramic color code bands */}
            <rect x="-45" y="-18" width="12" height="36" fill={colorBands[0].hex} />
            <rect x="-25" y="-18" width="12" height="36" fill={colorBands[1].hex} />
            <rect x="-5" y="-18" width="12" height="36" fill={colorBands[2].hex} />
            <rect x="35" y="-18" width="10" height="36" fill={colorBands[3].hex} />

            {/* Label Badge */}
            <rect x="-40" y="-46" width="80" height="22" rx="5" fill={isDark ? "#0f172a" : "#f8fafc"} stroke="#0284c7" strokeWidth="1.5" />
            <text x="0" y="-31" fill="#0284c7" fontSize="12" fontWeight="bold" textAnchor="middle">
              {resistance.toFixed(0)} Ω
            </text>
          </g>

          {/* COMPONENT 3: SWITCH / OPEN CIRCUIT FAULT GAP (Right Branch: X=680, Y=220) */}
          <g transform="translate(680, 220)">
            <circle cx="0" cy="-30" r="6" fill={isDark ? "#f8fafc" : "#0f172a"} />
            <circle cx="0" cy="30" r="6" fill={isDark ? "#f8fafc" : "#0f172a"} />

            {faultType === 'OPEN_CIRCUIT' ? (
              <g>
                <line x1="0" y1="30" x2="-35" y2="-20" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
                <rect x="15" y="-12" width="100" height="24" rx="6" fill="#881337" stroke="#f43f5e" />
                <text x="65" y="4" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  OPEN CIRCUIT
                </text>
              </g>
            ) : (
              <line x1="0" y1="-30" x2="0" y2="30" stroke="#10b981" strokeWidth="4" />
            )}
          </g>

          {/* COMPONENT 4: DIGITAL & ANALOG AMMETER (Bottom Branch: X=400, Y=370) */}
          <g transform="translate(400, 370)">
            <circle r="44" fill={isDark ? "#0f172a" : "#ffffff"} stroke={faultType === 'METER_FAULT' ? '#f43f5e' : '#0284c7'} strokeWidth="3.5" />
            <circle r="38" fill={isDark ? "#1e293b" : "#f1f5f9"} />

            {/* Dial Marks */}
            {[-60, -30, 0, 30, 60].map((angle, idx) => (
              <line
                key={idx}
                x1={30 * Math.sin((angle * Math.PI) / 180)}
                y1={-30 * Math.cos((angle * Math.PI) / 180)}
                x2={36 * Math.sin((angle * Math.PI) / 180)}
                y2={-36 * Math.cos((angle * Math.PI) / 180)}
                stroke={isDark ? "#64748b" : "#94a3b8"}
                strokeWidth="2"
              />
            ))}

            {/* Rotating Meter Needle */}
            <line
              x1="0"
              y1="0"
              x2={32 * Math.sin((needleAngle * Math.PI) / 180)}
              y2={-32 * Math.cos((needleAngle * Math.PI) / 180)}
              stroke={faultType === 'METER_FAULT' ? '#f43f5e' : '#d97706'}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle r="5" fill={isDark ? "#f8fafc" : "#0f172a"} />

            <text x="0" y="16" fill={isDark ? "#f8fafc" : "#0f172a"} fontSize="13" fontWeight="extrabold" textAnchor="middle">
              A
            </text>

            {/* Digital Readout Box Below Meter */}
            <rect x="-55" y="52" width="110" height="26" rx="6" fill={faultType === 'METER_FAULT' ? (isDark ? '#450a0a' : '#ffe4e6') : (isDark ? '#0f172a' : '#ffffff')} stroke={faultType === 'METER_FAULT' ? '#f43f5e' : '#0284c7'} strokeWidth="1.5" />
            <text x="0" y="69" fill={faultType === 'METER_FAULT' ? '#e11d48' : '#0284c7'} fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
              {formatCurrent(measuredCurrent)}
            </text>
          </g>

          {/* CONNECTION NODES */}
          <circle cx="120" cy="70" r="5" fill="#0284c7" />
          <circle cx="680" cy="70" r="5" fill="#0284c7" />
          <circle cx="680" cy="370" r="5" fill="#0284c7" />
          <circle cx="120" cy="370" r="5" fill="#0284c7" />
        </svg>
      </div>

      {/* Dynamic Fault Explanation Banner */}
      {faultType !== 'NORMAL' && (
        <div className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
          faultType === 'OPEN_CIRCUIT'
            ? isDark ? 'bg-rose-950/60 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-800'
            : isDark ? 'bg-amber-950/60 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 animate-bounce" />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-0.5">
              {faultType === 'OPEN_CIRCUIT' ? 'Discontinuity Fault Detected' : 'Instrument Calibration Fault Detected'}
            </span>
            <p className="leading-relaxed">
              {result?.faultExplanation || (faultType === 'OPEN_CIRCUIT' ? 'Wire path is broken. Current is 0.00A.' : 'Ammeter reads 2.5x higher than true physical current.')}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
