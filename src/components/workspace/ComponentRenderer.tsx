'use client';

import React from 'react';
import { LabComponent, Terminal } from '@/types';
import { getResistorColorBands } from '@/lib/simulation/engine';

interface ComponentRendererProps {
  component: LabComponent;
  isSelected: boolean;
  onSelect: (comp: LabComponent) => void;
  onRotate: (comp: LabComponent) => void;
  onDelete: (id: string) => void;
  onInspect: (comp: LabComponent) => void;
  onTerminalMouseDown: (comp: LabComponent, terminal: Terminal, e: React.MouseEvent) => void;
  onToggleSwitch?: (comp: LabComponent) => void;
  theme?: 'dark' | 'light';
  activeTerminalId?: string | null;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSelected,
  onSelect,
  onRotate,
  onDelete,
  onInspect,
  onTerminalMouseDown,
  onToggleSwitch,
  theme = 'dark',
  activeTerminalId,
}) => {
  const isDark = theme === 'dark';
  const rotation = component.rotation || 0;

  const renderComponentBody = () => {
    switch (component.type) {
      case 'BATTERY':
      case 'DC_SUPPLY': {
        const voltage = typeof component.properties?.voltage === 'number' ? component.properties.voltage : 6.0;
        return (
          <g>
            <rect x="-45" y="-35" width="90" height="70" rx="10" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#0284c7" strokeWidth="3" />
            <line x1="-20" y1="-14" x2="20" y2="-14" stroke="#0284c7" strokeWidth="4" />
            <line x1="-10" y1="-4" x2="10" y2="-4" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="3" />
            <line x1="-20" y1="6" x2="20" y2="6" stroke="#0284c7" strokeWidth="4" />
            <line x1="-10" y1="16" x2="10" y2="16" stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth="3" />
            
            <rect x="-35" y="18" width="70" height="15" rx="4" fill="#0284c7" />
            <text x="0" y="29" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono select-none">
              {voltage.toFixed(1)} V
            </text>
          </g>
        );
      }

      case 'RESISTOR':
      case 'VARIABLE_RESISTOR': {
        const resistance = typeof component.properties?.resistance === 'number' ? component.properties.resistance : 20.0;
        const colorBands = getResistorColorBands(resistance);
        return (
          <g>
            <rect x="-55" y="-18" width="110" height="36" rx="6" fill={isDark ? "#1e293b" : "#ffffff"} stroke="#0284c7" strokeWidth="2.5" />
            <rect x="-35" y="-18" width="10" height="36" fill={colorBands[0].hex} />
            <rect x="-20" y="-18" width="10" height="36" fill={colorBands[1].hex} />
            <rect x="-5" y="-18" width="10" height="36" fill={colorBands[2].hex} />
            <rect x="25" y="-18" width="8" height="36" fill={colorBands[3].hex} />
            <text x="0" y="-23" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono select-none">
              {resistance.toFixed(0)} Ω
            </text>
          </g>
        );
      }

      case 'AMMETER': {
        const displayVal = typeof component.state?.displayValue === 'string' ? component.state.displayValue : '0.00 A';
        const numVal = typeof component.state?.valueNumber === 'number' ? component.state.valueNumber : 0;
        const needleAngle = Math.min(180, Math.max(0, (numVal / 2.5) * 180)) - 90;
        return (
          <g>
            <circle r="42" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#0284c7" strokeWidth="3" />
            <circle r="36" fill={isDark ? "#1e293b" : "#f1f5f9"} />
            {[-60, -30, 0, 30, 60].map((angle, idx) => (
              <line
                key={idx}
                x1={28 * Math.sin((angle * Math.PI) / 180)}
                y1={-28 * Math.cos((angle * Math.PI) / 180)}
                x2={34 * Math.sin((angle * Math.PI) / 180)}
                y2={-34 * Math.cos((angle * Math.PI) / 180)}
                stroke={isDark ? "#64748b" : "#94a3b8"}
                strokeWidth="2"
              />
            ))}
            <line
              x1="0"
              y1="0"
              x2={28 * Math.sin((needleAngle * Math.PI) / 180)}
              y2={-28 * Math.cos((needleAngle * Math.PI) / 180)}
              stroke="#d97706"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle r="4" fill={isDark ? "#f8fafc" : "#0f172a"} />
            <text x="0" y="16" fill={isDark ? "#f8fafc" : "#0f172a"} fontSize="12" fontWeight="bold" textAnchor="middle" className="select-none">A</text>
            <rect x="-42" y="24" width="84" height="18" rx="4" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#0284c7" strokeWidth="1" />
            <text x="0" y="37" fill="#0284c7" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono select-none">
              {displayVal}
            </text>
          </g>
        );
      }

      case 'VOLTMETER': {
        const displayVal = typeof component.state?.displayValue === 'string' ? component.state.displayValue : '0.00 V';
        return (
          <g>
            <circle r="42" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#3b82f6" strokeWidth="3" />
            <circle r="36" fill={isDark ? "#1e293b" : "#f1f5f9"} />
            <text x="0" y="10" fill={isDark ? "#f8fafc" : "#0f172a"} fontSize="14" fontWeight="bold" textAnchor="middle" className="select-none">V</text>
            <rect x="-42" y="20" width="84" height="18" rx="4" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#3b82f6" strokeWidth="1" />
            <text x="0" y="33" fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono select-none">
              {displayVal}
            </text>
          </g>
        );
      }

      case 'GROUND': {
        return (
          <g>
            <line x1="0" y1="-20" x2="0" y2="0" stroke="#0284c7" strokeWidth="3" />
            <line x1="-20" y1="0" x2="20" y2="0" stroke="#0284c7" strokeWidth="4" />
            <line x1="-12" y1="8" x2="12" y2="8" stroke="#0284c7" strokeWidth="3" />
            <line x1="-5" y1="16" x2="5" y2="16" stroke="#0284c7" strokeWidth="2" />
          </g>
        );
      }

      case 'SWITCH': {
        const isOpen = !!component.state?.isOpen;
        return (
          <g onClick={() => onToggleSwitch && onToggleSwitch(component)} className="cursor-pointer">
            <rect x="-40" y="-25" width="80" height="50" rx="8" fill={isDark ? "#0f172a" : "#ffffff"} stroke={isOpen ? "#f43f5e" : "#10b981"} strokeWidth="2.5" />
            <circle cx="0" cy="-15" r="5" fill="#94a3b8" />
            <circle cx="0" cy="15" r="5" fill="#94a3b8" />
            {isOpen ? (
              <line x1="0" y1="15" x2="-25" y2="-12" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
            ) : (
              <line x1="0" y1="-15" x2="0" y2="15" stroke="#10b981" strokeWidth="3.5" />
            )}
            <text x="0" y="33" fill={isOpen ? "#f43f5e" : "#10b981"} fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">
              {isOpen ? 'OPEN' : 'CLOSED'}
            </text>
          </g>
        );
      }

      case 'PENDULUM': {
        const length = typeof component.properties?.length === 'number' ? component.properties.length : 1.0;
        return (
          <g>
            <rect x="-40" y="-12" width="80" height="16" rx="4" fill="#64748b" stroke="#334155" strokeWidth="2" />
            <circle cx="0" cy="-4" r="4" fill="#f8fafc" />
            <line x1="0" y1="0" x2="0" y2={40 * length} stroke={isDark ? "#94a3b8" : "#475569"} strokeWidth="2.5" strokeDasharray="3 3" />
            <circle cx="0" cy={40 * length} r="16" fill="#d97706" stroke="#b45309" strokeWidth="3" />
            <circle cx="-4" cy={40 * length - 4} r="3" fill="#fef3c7" opacity="0.8" />
            <text x="0" y={40 * length + 4} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" className="select-none">m</text>
            <text x="0" y="-20" fill="#0284c7" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono select-none">
              L = {length.toFixed(1)}m
            </text>
          </g>
        );
      }

      case 'STOPWATCH': {
        const displayVal = typeof component.state?.displayValue === 'string' ? component.state.displayValue : '2.01 s';
        return (
          <g>
            <circle r="36" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#0284c7" strokeWidth="3" />
            <rect x="-8" y="-44" width="16" height="10" rx="2" fill="#0284c7" />
            <rect x="-26" y="-12" width="52" height="24" rx="4" fill={isDark ? "#020617" : "#f1f5f9"} stroke="#0284c7" strokeWidth="1" />
            <text x="0" y="4" fill="#0284c7" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono select-none">
              {displayVal}
            </text>
            <text x="0" y="24" fill={isDark ? "#94a3b8" : "#64748b"} fontSize="8" textAnchor="middle" className="font-mono">TIMER</text>
          </g>
        );
      }

      case 'LIGHT_SOURCE': {
        const wavelength = typeof component.properties?.wavelength === 'number' ? component.properties.wavelength : 450;
        return (
          <g>
            <rect x="-45" y="-22" width="90" height="44" rx="8" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#8b5cf6" strokeWidth="2.5" />
            <circle cx="-25" cy="0" r="10" fill="#8b5cf6" opacity="0.3" />
            <circle cx="-25" cy="0" r="6" fill="#8b5cf6" />
            <path d="M 10 -10 L 35 0 L 10 10 Z" fill="#8b5cf6" opacity="0.7" />
            <text x="5" y="-5" fill="#8b5cf6" fontSize="9" fontWeight="bold" className="font-mono select-none">{wavelength}nm</text>
            <text x="5" y="8" fill={isDark ? "#94a3b8" : "#64748b"} fontSize="7" className="select-none">UV/VIS LASER</text>
          </g>
        );
      }

      case 'PHOTO_TUBE': {
        return (
          <g>
            <rect x="-55" y="-30" width="110" height="60" rx="14" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5 3" />
            <rect x="-35" y="-20" width="10" height="40" rx="2" fill="#d97706" />
            <circle cx="25" cy="0" r="14" fill="none" stroke="#3b82f6" strokeWidth="3" />
            <text x="0" y="-35" fill="#8b5cf6" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">PHOTOCELL</text>
          </g>
        );
      }

      case 'ALPHA_SOURCE': {
        const energy = typeof component.properties?.energy === 'number' ? component.properties.energy : 5.5;
        return (
          <g>
            <rect x="-40" y="-25" width="80" height="50" rx="8" fill={isDark ? "#1e293b" : "#ffffff"} stroke="#f43f5e" strokeWidth="2.5" />
            <circle cx="-15" cy="0" r="8" fill="#f43f5e" opacity="0.3" />
            <circle cx="-15" cy="0" r="4" fill="#f43f5e" />
            <line x1="0" y1="0" x2="30" y2="0" stroke="#f43f5e" strokeWidth="3" strokeDasharray="3 3" />
            <text x="0" y="-30" fill="#f43f5e" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">Am-241 (α)</text>
            <text x="0" y="20" fill="#f43f5e" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">{energy.toFixed(1)} MeV</text>
          </g>
        );
      }

      case 'GOLD_FOIL': {
        const thickness = typeof component.properties?.thickness === 'number' ? component.properties.thickness : 400;
        return (
          <g>
            <rect x="-30" y="-40" width="60" height="80" rx="4" fill="#64748b" stroke="#334155" strokeWidth="2" />
            <rect x="-15" y="-30" width="30" height="60" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <text x="0" y="4" fill="#78350f" fontSize="8" fontWeight="bold" textAnchor="middle" className="select-none">Au FOIL</text>
            <text x="0" y="50" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">{thickness}nm</text>
          </g>
        );
      }

      case 'SCATTER_DETECTOR': {
        const displayVal = typeof component.state?.displayValue === 'string' ? component.state.displayValue : 'θ = 15°';
        return (
          <g>
            <circle r="40" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="20" y="-16" width="36" height="32" rx="6" fill="#10b981" stroke="#059669" strokeWidth="2" />
            <text x="38" y="4" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">{displayVal}</text>
          </g>
        );
      }

      case 'ELECTROPHORESIS_TANK': {
        const voltage = typeof component.properties?.voltage === 'number' ? component.properties.voltage : 100;
        const gelPct = typeof component.properties?.gelPct === 'number' ? component.properties.gelPct : 1.0;
        return (
          <g>
            <rect x="-65" y="-35" width="130" height="70" rx="8" fill={isDark ? "#0f172a" : "#f8fafc"} stroke="#10b981" strokeWidth="2.5" />
            <rect x="-45" y="-20" width="90" height="40" rx="4" fill={isDark ? "#1e293b" : "#e2e8f0"} stroke="#10b981" strokeWidth="1" />
            {[-30, -15, 0, 15, 30].map((x, i) => (
              <rect key={i} x={x - 4} y="-16" width="8" height="6" fill="#0284c7" rx="1" />
            ))}
            <rect x="-34" y="2" width="8" height="2" fill="#34d399" />
            <rect x="-19" y="10" width="8" height="2" fill="#34d399" />
            <rect x="-4" y="6" width="8" height="2" fill="#34d399" />
            <text x="0" y="-40" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">AGAROSE GEL ({gelPct}%)</text>
            <text x="0" y="28" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">{voltage}V FIELD</text>
          </g>
        );
      }

      case 'BEAKER': {
        const temp = typeof component.properties?.temperature === 'number' ? component.properties.temperature : 25;
        return (
          <g>
            <path d="M -30 -35 L -30 25 Q -30 35 -20 35 L 20 35 Q 30 35 30 25 L 30 -35" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#10b981" strokeWidth="2.5" />
            <path d="M -26 0 L -26 25 Q -26 32 -18 32 L 18 32 Q 26 32 26 25 L 26 0 Z" fill="#10b981" opacity="0.4" />
            {[-15, 0, 15].map((y, idx) => (
              <line key={idx} x1="-28" y1={y} x2="-20" y2={y} stroke="#10b981" strokeWidth="1.5" />
            ))}
            <text x="0" y="18" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono select-none">{temp}°C</text>
            <text x="0" y="-40" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">REACTION VESSEL</text>
          </g>
        );
      }

      case 'SPECTROPHOTOMETER': {
        const displayVal = typeof component.state?.displayValue === 'string' ? component.state.displayValue : 'A = 0.42';
        return (
          <g>
            <rect x="-50" y="-30" width="100" height="60" rx="8" fill={isDark ? "#0f172a" : "#f1f5f9"} stroke="#10b981" strokeWidth="2.5" />
            <rect x="-35" y="-15" width="70" height="24" rx="4" fill={isDark ? "#020617" : "#ffffff"} stroke="#10b981" strokeWidth="1" />
            <text x="0" y="1" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono select-none">{displayVal}</text>
            <text x="0" y="20" fill={isDark ? "#94a3b8" : "#64748b"} fontSize="7" textAnchor="middle" className="font-mono select-none">UV-VIS SPECTRO</text>
          </g>
        );
      }

      case 'FINANCE_CHART': {
        const sharpe = typeof component.properties?.sharpeRatio === 'number' ? component.properties.sharpeRatio : 1.85;
        return (
          <g>
            <rect x="-55" y="-35" width="110" height="70" rx="8" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#f59e0b" strokeWidth="2.5" />
            <path d="M -40 20 L -20 5 L 0 12 L 20 -15 L 40 -20" fill="none" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="20" cy="-15" r="4" fill="#fbbf24" />
            <text x="0" y="28" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">SHARPE: {sharpe.toFixed(2)}</text>
          </g>
        );
      }

      case 'PORTFOLIO_LEDGER': {
        const varValue = typeof component.properties?.varValue === 'number' ? component.properties.varValue : 2.4;
        return (
          <g>
            <rect x="-45" y="-30" width="90" height="60" rx="6" fill={isDark ? "#0f172a" : "#ffffff"} stroke="#f59e0b" strokeWidth="2" />
            <line x1="-35" y1="-15" x2="35" y2="-15" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="-35" y1="0" x2="35" y2="0" stroke={isDark ? "#334155" : "#e2e8f0"} strokeWidth="1" />
            <line x1="-35" y1="15" x2="35" y2="15" stroke={isDark ? "#334155" : "#e2e8f0"} strokeWidth="1" />
            <text x="0" y="-18" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">RISK LEDGER</text>
            <text x="0" y="25" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono select-none">VaR: {varValue.toFixed(1)}%</text>
          </g>
        );
      }

      default:
        return (
          <rect x="-35" y="-25" width="70" height="50" rx="8" fill={isDark ? "#1e293b" : "#f1f5f9"} stroke="#0284c7" strokeWidth="2" />
        );
    }
  };

  return (
    <g
      transform={`translate(${component.position.x}, ${component.position.y}) rotate(${rotation})`}
      className="cursor-move group"
    >
      {/* Selection Halo */}
      {isSelected && (
        <rect
          x="-70"
          y="-60"
          width="140"
          height="120"
          rx="14"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
      )}

      {/* Main Component Body */}
      <g onClick={(e) => { e.stopPropagation(); onSelect(component); }}>
        {renderComponentBody()}
      </g>

      {/* Terminals Ports */}
      {component.terminals.map((term) => {
        const isCurrentActive = activeTerminalId === `${component.id}:${term.id}`;
        return (
          <g
            key={term.id}
            transform={`translate(${term.position.x}, ${term.position.y})`}
            onMouseDown={(e) => onTerminalMouseDown(component, term, e)}
            className="cursor-crosshair group/term"
          >
            <circle
              r="7"
              fill={term.type === 'POSITIVE' ? '#f43f5e' : term.type === 'NEGATIVE' ? '#0284c7' : '#eab308'}
              stroke="#ffffff"
              strokeWidth="2"
              className={`transition-all hover:scale-150 ${isCurrentActive ? 'animate-ping' : ''}`}
            />
            {term.label && (
              <text
                x="0"
                y="-10"
                fill={term.type === 'POSITIVE' ? '#f43f5e' : term.type === 'NEGATIVE' ? '#0284c7' : '#eab308'}
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                className="select-none pointer-events-none"
              >
                {term.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Floating Action Controls when Selected */}
      {isSelected && (
        <g transform="translate(0, -65)" className="cursor-pointer">
          <circle cx="-30" cy="0" r="11" fill="#0284c7" onClick={(e) => { e.stopPropagation(); onRotate(component); }} />
          <path d="M -34 -3 L -26 -3 M -30 -7 L -26 -3 L -30 1" stroke="#ffffff" strokeWidth="1.5" fill="none" pointerEvents="none" />

          <circle cx="0" cy="0" r="11" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" onClick={(e) => { e.stopPropagation(); onInspect(component); }} />
          <circle cx="0" cy="0" r="4" fill="#38bdf8" pointerEvents="none" />

          <circle cx="30" cy="0" r="11" fill="#f43f5e" onClick={(e) => { e.stopPropagation(); onDelete(component.id); }} />
          <path d="M 26 -4 L 34 4 M 34 -4 L 26 4" stroke="#ffffff" strokeWidth="1.5" pointerEvents="none" />
        </g>
      )}
    </g>
  );
};
