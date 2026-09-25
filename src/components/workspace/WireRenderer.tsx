'use client';

import React from 'react';
import { LabComponent, WireConnection } from '@/types';

interface WireRendererProps {
  connection: WireConnection;
  components: LabComponent[];
  isSelected: boolean;
  onSelectWire: (wire: WireConnection) => void;
  onDeleteWire: (id: string) => void;
  isSimulating: boolean;
  electronVelocity?: number;
  theme?: 'dark' | 'light';
}

export const WireRenderer: React.FC<WireRendererProps> = ({
  connection,
  components,
  isSelected,
  onSelectWire,
  onDeleteWire,
  isSimulating,
  electronVelocity = 2,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const fromComp = components.find(c => c.id === connection.fromComponentId);
  const toComp = components.find(c => c.id === connection.toComponentId);

  if (!fromComp || !toComp) return null;

  const fromTerm = fromComp.terminals.find(t => t.id === connection.fromTerminalId);
  const toTerm = toComp.terminals.find(t => t.id === connection.toTerminalId);

  if (!fromTerm || !toTerm) return null;

  // Calculate absolute coordinates in canvas
  const x1 = fromComp.position.x + fromTerm.position.x;
  const y1 = fromComp.position.y + fromTerm.position.y;
  const x2 = toComp.position.x + toTerm.position.x;
  const y2 = toComp.position.y + toTerm.position.y;

  // Smooth Bezier Curve
  const dx = Math.abs(x2 - x1) * 0.5;
  const dy = Math.abs(y2 - y1) * 0.5;
  const pathData = `M ${x1} ${y1} C ${x1 + (x2 > x1 ? dx : -dx)} ${y1 + (y2 > y1 ? dy : -dy)}, ${x2 - (x2 > x1 ? dx : -dx)} ${y2 - (y2 > y1 ? dy : -dy)}, ${x2} ${y2}`;

  const wireColor = connection.color || '#0284c7';
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const animDuration = electronVelocity > 0 ? Math.max(0.5, 4 / electronVelocity) : 0;

  return (
    <g className="cursor-pointer group">
      {/* Hit Area for easy mouse click */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="18"
        onClick={(e) => { e.stopPropagation(); onSelectWire(connection); }}
      />

      {/* Shadow Base Wire */}
      <path
        d={pathData}
        fill="none"
        stroke={isDark ? "#0f172a" : "#cbd5e1"}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Main Insulated Wire */}
      <path
        d={pathData}
        fill="none"
        stroke={wireColor}
        strokeWidth="4"
        strokeLinecap="round"
        className={`transition-all ${isSelected ? 'stroke-amber-400 stroke-[5px]' : ''}`}
      />

      {/* Animated Glowing Electron Flow Particles */}
      {isSimulating && electronVelocity > 0 && (
        <g>
          {[0, 0.25, 0.5, 0.75].map((offset, i) => (
            <circle key={i} r="3.5" fill="#38bdf8" filter="url(#glow-cyan)">
              <animateMotion
                path={pathData}
                dur={`${animDuration}s`}
                repeatCount="indefinite"
                begin={`${offset * animDuration}s`}
              />
            </circle>
          ))}
        </g>
      )}

      {/* Terminal Contact Connection Pins */}
      <circle cx={x1} cy={y1} r="4" fill="#f8fafc" stroke={wireColor} strokeWidth="2" />
      <circle cx={x2} cy={y2} r="4" fill="#f8fafc" stroke={wireColor} strokeWidth="2" />

      {/* Wire Disconnect / Delete Badge when Selected */}
      {isSelected && (
        <g transform={`translate(${midX}, ${midY})`} onClick={(e) => { e.stopPropagation(); onDeleteWire(connection.id); }}>
          <circle r="11" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" className="cursor-pointer hover:scale-125 transition-transform" />
          <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" pointerEvents="none" />
        </g>
      )}
    </g>
  );
};
