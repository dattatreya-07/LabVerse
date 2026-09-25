'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LabComponent, WireConnection, Terminal } from '@/types';
import { ComponentRenderer } from './ComponentRenderer';
import { WireRenderer } from './WireRenderer';
import { createWire } from '@/lib/connection/connection-engine';
import { duplicateComponent } from '@/lib/circuit/circuit-document-engine';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Undo2, 
  Redo2, 
  Copy, 
  Trash2, 
  Grid, 
  Hand, 
  MousePointer, 
  X,
  RotateCw,
  Sparkles
} from 'lucide-react';

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

interface HistoryItem {
  components: LabComponent[];
  connections: WireConnection[];
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

  // Pan & Zoom State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Grid Snapping
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Dragging state for components
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Wiring state (Rubberband wire)
  const [wiringStart, setWiringStart] = useState<{ comp: LabComponent; terminal: Terminal } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Push to history when state changes from user action
  const pushStateToHistory = (newComps: LabComponent[], newConns: WireConnection[]) => {
    const nextItem: HistoryItem = {
      components: newComps.map(c => ({ ...c })),
      connections: newConns.map(w => ({ ...w })),
    };
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, nextItem]);
    setHistoryIndex(nextHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onUpdateComponents(prev.components);
      onUpdateConnections(prev.connections);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onUpdateComponents(next.components);
      onUpdateConnections(next.connections);
    }
  };

  // Sync initial state to history on mount or preset load
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ components, connections }]);
      setHistoryIndex(0);
    }
  }, []);

  // Keyboard shortcut listener (Ctrl+Z, Ctrl+Y, Escape, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        setWiringStart(null);
        onSelectComponent(null);
        onSelectWire(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponentId) {
          handleDeleteComponent(selectedComponentId);
        } else if (selectedWireId) {
          handleDeleteWire(selectedWireId);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, selectedWireId, historyIndex, history]);

  // Convert client mouse event to SVG coordinate space taking pan & zoom into account
  const getSVGCoordinates = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 800;
    const rawY = ((e.clientY - rect.top) / rect.height) * 440;
    
    // Reverse transform zoom & pan
    const x = (rawX - pan.x) / zoom;
    const y = (rawY - pan.y) / zoom;
    return { x, y };
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const nextZoom = Math.min(2.5, Math.max(0.5, zoom * zoomFactor));
    setZoom(nextZoom);
  };

  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDownOnCanvas = (e: React.MouseEvent) => {
    // If middle mouse button or Pan Mode active, start panning
    if (e.button === 1 || isPanMode) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const coords = getSVGCoordinates(e);

    // Check if clicked near an existing component
    const clickedComp = components.find(c => {
      const dx = Math.abs(c.position.x - coords.x);
      const dy = Math.abs(c.position.y - coords.y);
      return dx < 55 && dy < 45;
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
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const coords = getSVGCoordinates(e);
    setMousePos(coords);

    if (draggingCompId) {
      const nextComponents = components.map(c => {
        if (c.id === draggingCompId) {
          const rawX = coords.x - dragOffset.x;
          const rawY = coords.y - dragOffset.y;
          const gridStep = snapToGrid ? 10 : 1;
          const nextX = Math.round(rawX / gridStep) * gridStep;
          const nextY = Math.round(rawY / gridStep) * gridStep;
          return {
            ...c,
            position: {
              x: Math.max(40, Math.min(760, nextX)),
              y: Math.max(40, Math.min(400, nextY)),
            },
          };
        }
        return c;
      });
      onUpdateComponents(nextComponents);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (draggingCompId) {
      setDraggingCompId(null);
      pushStateToHistory(components, connections);
    }
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
        setWiringStart(null);
        return;
      }

      // Check if wire already exists between these 2 terminals
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
        const wireColor = 
          wiringStart.terminal.type === 'POSITIVE' ? '#ef4444' : 
          wiringStart.terminal.type === 'NEGATIVE' ? '#0284c7' : '#eab308';

        const newWire = createWire(
          wiringStart.comp.id,
          wiringStart.terminal.id,
          comp.id,
          terminal.id,
          wireColor
        );

        const nextConnections = [...connections, newWire];
        onUpdateConnections(nextConnections);
        pushStateToHistory(components, nextConnections);
      }

      setWiringStart(null);
    }
  };

  const handleRotateComponent = (comp: LabComponent) => {
    const currentRot = comp.rotation || 0;
    const nextRot = (currentRot + 90) % 360;
    const nextComps = components.map(c => (c.id === comp.id ? { ...c, rotation: nextRot } : c));
    onUpdateComponents(nextComps);
    pushStateToHistory(nextComps, connections);
  };

  const handleDuplicateSelected = () => {
    if (!selectedComponentId) return;
    const { updatedNodes, newNodeId } = duplicateComponent(components, selectedComponentId);
    if (newNodeId) {
      onUpdateComponents(updatedNodes);
      const newComp = updatedNodes.find(n => n.id === newNodeId) || null;
      onSelectComponent(newComp);
      pushStateToHistory(updatedNodes, connections);
    }
  };

  const handleDeleteComponent = (id: string) => {
    const nextComps = components.filter(c => c.id !== id);
    const nextWires = connections.filter(w => w.fromComponentId !== id && w.toComponentId !== id);
    onUpdateComponents(nextComps);
    onUpdateConnections(nextWires);
    onSelectComponent(null);
    pushStateToHistory(nextComps, nextWires);
  };

  const handleDeleteWire = (id: string) => {
    const nextWires = connections.filter(w => w.id !== id);
    onUpdateConnections(nextWires);
    onSelectWire(null);
    pushStateToHistory(components, nextWires);
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
    pushStateToHistory(nextComps, connections);
  };

  const selectedCompObj = components.find(c => c.id === selectedComponentId);

  return (
    <div className={`relative rounded-2xl border shadow-xl overflow-hidden select-none transition-colors ${
      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      
      {/* Top Floating Canvas Toolbar */}
      <div className={`absolute top-3 left-3 z-30 p-1.5 rounded-xl border flex items-center space-x-1 backdrop-blur-md transition-all ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-700 shadow-md'
      }`}>
        {/* Undo / Redo */}
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          title="Undo (Ctrl+Z)"
          className={`p-1.5 rounded-lg border transition-colors ${
            historyIndex > 0 
              ? isDark ? 'hover:bg-slate-800 text-slate-200 border-slate-700' : 'hover:bg-slate-100 text-slate-800 border-slate-300'
              : 'opacity-40 border-transparent cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          title="Redo (Ctrl+Y)"
          className={`p-1.5 rounded-lg border transition-colors ${
            historyIndex < history.length - 1
              ? isDark ? 'hover:bg-slate-800 text-slate-200 border-slate-700' : 'hover:bg-slate-100 text-slate-800 border-slate-300'
              : 'opacity-40 border-transparent cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-700/40 my-auto" />

        {/* Zoom Controls */}
        <button
          onClick={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
          title="Zoom In"
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark ? 'hover:bg-slate-800 border-slate-700' : 'hover:bg-slate-100 border-slate-300'
          }`}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.15))}
          title="Zoom Out"
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark ? 'hover:bg-slate-800 border-slate-700' : 'hover:bg-slate-100 border-slate-300'
          }`}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Fit / Reset View (1.0x)"
          className={`p-1.5 rounded-lg border text-[11px] font-mono font-bold transition-colors ${
            isDark ? 'hover:bg-slate-800 border-slate-700 text-cyan-400' : 'hover:bg-slate-100 border-slate-300 text-cyan-600'
          }`}
        >
          {Math.round(zoom * 100)}%
        </button>

        <div className="h-4 w-px bg-slate-700/40 my-auto" />

        {/* Pan Mode Toggle */}
        <button
          onClick={() => setIsPanMode(!isPanMode)}
          title={isPanMode ? 'Switch to Select/Drag Mode' : 'Switch to Pan Mode'}
          className={`p-1.5 rounded-lg border transition-colors ${
            isPanMode
              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
              : isDark ? 'hover:bg-slate-800 border-slate-700' : 'hover:bg-slate-100 border-slate-300'
          }`}
        >
          {isPanMode ? <Hand className="w-3.5 h-3.5" /> : <MousePointer className="w-3.5 h-3.5" />}
        </button>

        {/* Snap Grid Toggle */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          title={`Grid Snap: ${snapToGrid ? 'ON (10px)' : 'OFF'}`}
          className={`p-1.5 rounded-lg border transition-colors ${
            snapToGrid
              ? isDark ? 'bg-slate-800 text-cyan-400 border-cyan-500/40' : 'bg-cyan-50 text-cyan-700 border-cyan-300'
              : 'opacity-50 border-transparent'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Selected Component Operations */}
        {selectedCompObj && (
          <>
            <div className="h-4 w-px bg-slate-700/40 my-auto" />
            <button
              onClick={() => handleRotateComponent(selectedCompObj)}
              title="Rotate 90°"
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark ? 'hover:bg-slate-800 text-cyan-400 border-slate-700' : 'hover:bg-slate-100 text-cyan-600 border-slate-300'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDuplicateSelected}
              title="Duplicate Component"
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark ? 'hover:bg-slate-800 text-amber-400 border-slate-700' : 'hover:bg-slate-100 text-amber-600 border-slate-300'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteComponent(selectedCompObj.id)}
              title="Delete Component"
              className="p-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Wiring Banner Prompt */}
      {wiringStart && (
        <div className="absolute top-3 right-3 z-30 px-4 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg animate-pulse flex items-center space-x-2">
          <span>Click target terminal to complete wire</span>
          <button
            onClick={() => setWiringStart(null)}
            className="ml-2 bg-slate-950/20 hover:bg-slate-950/50 text-slate-950 p-1 rounded-full text-[10px]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main SVG Canvas Workspace */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 440"
        onMouseDown={handleMouseDownOnCanvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheelZoom}
        className={`w-full h-auto max-h-[440px] rounded-xl ${
          isPanMode ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
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

        {/* Pan and Zoom Transformation Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          
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

        </g>
      </svg>

    </div>
  );
};
