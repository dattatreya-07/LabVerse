'use client';

import React, { useState, useRef } from 'react';
import { LabComponent, WireConnection, Terminal } from '@/types';
import { ComponentRenderer } from './ComponentRenderer';
import { WireRenderer } from './WireRenderer';
import { createWire } from '@/lib/connection/connection-engine';

interface InteractiveCanvasProps {
  components: LabComponent[];
  connections: WireConnection[];
  onUpdateComponents: (comps: LabComponent[]) => void;
  onUpdateConnections: (conns: WireConnection[]) => void;
  onSelectComponent: (comp: LabComponent | null) => void;
  selectedComponentId: string | null;
  selectedWireId: string | null;
  onSelectWire: (wire: WireConnection | null) => void;
  onInspectComponent: (comp: LabComponent) => void;
  isSimulating: boolean;
  electronVelocity?: number;
  theme?: 'dark' | 'light';
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  components,
  connections,
  onUpdateComponents,
  onUpdateConnections,
  onSelectComponent,
  selectedComponentId,
  selectedWireId,
  onSelectWire,
  onInspectComponent,
  isSimulating,
  electronVelocity = 2,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Dragging state for components
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Wiring state (Rubberband wire)
  const [wiringStart, setWiringStart] = useState<{ comp: LabComponent; terminal: Terminal } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Convert client mouse event to SVG coordinate space
  const getSVGCoordinates = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 440 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDownOnCanvas = (e: React.MouseEvent) => {
    const coords = getSVGCoordinates(e);

    // Check if clicked near an existing component
    const clickedComp = components.find(c => {
      const dx = Math.abs(c.position.x - coords.x);
      const dy = Math.abs(c.position.y - coords.y);
      return dx < 50 && dy < 40;
    });

    if (clickedComp) {
      setDraggingCompId(clickedComp.id);
      setDragOffset({
        x: coords.x - clickedComp.position.x,
        y: coords.y - clickedComp.position.y,
      });
      onSelectComponent(clickedComp);
      onSelectWire(null);
    } else {
      onSelectComponent(null);
      onSelectWire(null);
      setWiringStart(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getSVGCoordinates(e);
    setMousePos(coords);

    if (draggingCompId) {
      const nextComponents = components.map(c => {
        if (c.id === draggingCompId) {
          // Snap to 10px grid
          const nextX = Math.round((coords.x - dragOffset.x) / 10) * 10;
          const nextY = Math.round((coords.y - dragOffset.y) / 10) * 10;
          return {
            ...c,
            position: {
              x: Math.max(60, Math.min(740, nextX)),
              y: Math.max(50, Math.min(390, nextY)),
            },
          };
        }
        return c;
      });
      onUpdateComponents(nextComponents);
    }
  };

  const handleMouseUp = () => {
    setDraggingCompId(null);
  };

  // Terminal connection handling
  const handleTerminalMouseDown = (comp: LabComponent, terminal: Terminal, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!wiringStart) {
      // Start wiring from this terminal
      setWiringStart({ comp, terminal });
      onSelectComponent(null);
    } else {
      // End wiring at this terminal
      if (wiringStart.comp.id === comp.id && wiringStart.terminal.id === terminal.id) {
        // Cancel if same terminal
        setWiringStart(null);
        return;
      }

      // Check if wire already exists
      const existing = connections.some(
        w =>
          (w.fromComponentId === wiringStart.comp.id &&
            w.fromTerminalId === wiringStart.terminal.id &&
            w.toComponentId === comp.id &&
            w.toTerminalId === terminal.id) ||
          (w.fromComponentId === comp.id &&
            w.fromTerminalId === terminal.id &&
            w.toComponentId === wiringStart.comp.id &&
            w.toTerminalId === wiringStart.terminal.id)
      );

      if (!existing) {
        const newWire = createWire(
          wiringStart.comp.id,
          wiringStart.terminal.id,
          comp.id,
          terminal.id,
          wiringStart.terminal.type === 'POSITIVE' ? '#f43f5e' : wiringStart.terminal.type === 'NEGATIVE' ? '#0284c7' : '#eab308'
        );
        onUpdateConnections([...connections, newWire]);
      }

      setWiringStart(null);
    }
  };

  const handleRotateComponent = (comp: LabComponent) => {
    const currentRot = comp.rotation || 0;
    const nextRot = (currentRot + 90) % 360;
    const nextComps = components.map(c => (c.id === comp.id ? { ...c, rotation: nextRot } : c));
    onUpdateComponents(nextComps);
  };

  const handleDeleteComponent = (id: string) => {
    const nextComps = components.filter(c => c.id !== id);
    const nextWires = connections.filter(w => w.fromComponentId !== id && w.toComponentId !== id);
    onUpdateComponents(nextComps);
    onUpdateConnections(nextWires);
    onSelectComponent(null);
  };

  const handleDeleteWire = (id: string) => {
    const nextWires = connections.filter(w => w.id !== id);
    onUpdateConnections(nextWires);
    onSelectWire(null);
  };

  const handleToggleSwitch = (comp: LabComponent) => {
    const nextComps = components.map(c => {
      if (c.id === comp.id) {
        const isOpen = !c.state?.isOpen;
        return {
          ...c,
          state: { ...c.state, isOpen },
        };
      }
      return c;
    });
    onUpdateComponents(nextComps);
  };

  return (
    <div className={`relative rounded-2xl border p-2 sm:p-4 shadow-xl overflow-hidden select-none transition-colors ${
      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      
      {/* Wiring Banner Prompt */}
      {wiringStart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-cyan-600 text-white font-bold text-xs shadow-lg animate-bounce flex items-center space-x-2">
          <span>Click target terminal to complete wire connection</span>
          <button
            onClick={() => setWiringStart(null)}
            className="ml-2 bg-slate-950/40 hover:bg-slate-950/80 px-2 py-0.5 rounded-full text-[10px]"
          >
            Cancel
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 800 440"
        onMouseDown={handleMouseDownOnCanvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-auto max-h-[440px] rounded-xl cursor-default"
      >
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Breadboard Grid Pattern */}
          <pattern id="lab-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={isDark ? "#334155" : "#cbd5e1"} opacity="0.7" />
          </pattern>
        </defs>

        {/* Canvas Background Grid */}
        <rect width="800" height="440" fill={isDark ? "#090d16" : "#f8fafc"} />
        <rect width="800" height="440" fill="url(#lab-grid)" />

        {/* Outer Workbench Guide Border */}
        <rect x="10" y="10" width="780" height="420" rx="14" fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="2" strokeDasharray="6 6" />

        {/* Wires Layer */}
        {connections.map((conn) => (
          <WireRenderer
            key={conn.id}
            connection={conn}
            components={components}
            isSelected={selectedWireId === conn.id}
            onSelectWire={onSelectWire}
            onDeleteWire={handleDeleteWire}
            isSimulating={isSimulating}
            electronVelocity={electronVelocity}
            theme={theme}
          />
        ))}

        {/* Interactive Rubberband Wire during Dragging */}
        {wiringStart && (
          <path
            d={`M ${wiringStart.comp.position.x + wiringStart.terminal.position.x} ${
              wiringStart.comp.position.y + wiringStart.terminal.position.y
            } Q ${(wiringStart.comp.position.x + wiringStart.terminal.position.x + mousePos.x) / 2} ${
              (wiringStart.comp.position.y + wiringStart.terminal.position.y + mousePos.y) / 2 + 30
            }, ${mousePos.x} ${mousePos.y}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="4 4"
            className="animate-pulse pointer-events-none"
          />
        )}

        {/* Components Layer */}
        {components.map((comp) => (
          <ComponentRenderer
            key={comp.id}
            component={comp}
            isSelected={selectedComponentId === comp.id}
            onSelect={onSelectComponent}
            onRotate={handleRotateComponent}
            onDelete={handleDeleteComponent}
            onInspect={onInspectComponent}
            onTerminalMouseDown={handleTerminalMouseDown}
            onToggleSwitch={handleToggleSwitch}
            theme={theme}
            activeTerminalId={wiringStart ? `${wiringStart.comp.id}:${wiringStart.terminal.id}` : null}
          />
        ))}
      </svg>
    </div>
  );
};
