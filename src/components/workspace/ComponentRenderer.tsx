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
            <rect x="-35" y="-10" width="70" height="16" rx="4" fill="#64748b" />
            <line x1="0" y1="0" x2="0" y2={45 * length} stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="0" cy={45 * length} r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y={45 * length + 4} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" className="select-none">m</text>
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
          x="-65"
          y="-55"
          width="130"
          height="110"
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
        <g transform="translate(0, -60)" className="cursor-pointer">
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
