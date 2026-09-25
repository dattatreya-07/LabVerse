'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ExperimentDefinition,
  LabComponent,
  WireConnection,
  SimulationResult,
  TutorResponse,
  SourceReference
} from '@/types';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RotateCcw,
  Loader2,
  X,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  HelpCircle,
  Zap
} from 'lucide-react';
import { MathFormula } from '@/components/ui/MathFormula';

export type RobotMood = 'idle' | 'happy' | 'thinking' | 'warning' | 'error';

interface LiveRobotTutorProps {
  experiment: ExperimentDefinition;
  components: LabComponent[];
  connections: WireConnection[];
  parameters: Record<string, number>;
  activeFaults: string[];
  lastResult: SimulationResult | null;
  theme?: 'dark' | 'light';
  onOpenWorkbench?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor' | 'system';
  text: string;
  mood?: RobotMood;
  sources?: SourceReference[];
  isCuratedFallback?: boolean;
  timestamp: string;
}

export const LiveRobotTutor: React.FC<LiveRobotTutorProps> = ({
  experiment,
  components,
  connections,
  parameters,
  activeFaults,
  lastResult,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Modal & Chat state
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mood, setMood] = useState<RobotMood>('idle');
  const [speechBubble, setSpeechBubble] = useState<{ text: string; mood: RobotMood; title?: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Chat message history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedConnCountRef = useRef<number>(-1);
  const lastResultTimestampRef = useRef<string>('');

  // Audio synthesize sound effects using Web Audio API
  const playChime = useCallback((type: 'success' | 'alert' | 'pop') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'alert') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.12); // F4
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  // Show a speech bubble notification above the robot avatar
  const triggerSpeechBubble = useCallback((text: string, newMood: RobotMood, title?: string, sound: 'success' | 'alert' | 'pop' = 'pop') => {
    setMood(newMood);
    setSpeechBubble({ text, mood: newMood, title });
    playChime(sound);

    if (!isOpen) {
      setUnreadCount((prev) => prev + 1);
    }

    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }

    // Keep bubble on screen for 7 seconds, then transition back to idle if not error
    speechTimeoutRef.current = setTimeout(() => {
      setSpeechBubble(null);
      if (newMood !== 'error') {
        setMood('idle');
      }
    }, 7000);
  }, [isOpen, playChime]);

  // Welcome message when experiment loads
  useEffect(() => {
    const welcomeText = `Hello! I'm your **LabBot AI Assistant** for **${experiment.title}** 🤖.\n\nI monitor your circuits, 3D apparatus, connections, and simulation measurements in real time. If something is wired incorrectly or a hardware fault triggers, I will alert you instantly!`;
    const welcomeMsg: ChatMessage = {
      id: `welcome-${experiment.id}-${Date.now()}`,
      sender: 'tutor',
      text: welcomeText,
      mood: 'happy',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
    triggerSpeechBubble(`Hi! I'm monitoring your ${experiment.title} workspace. Let me know if you need help!`, 'happy', 'LabBot Active', 'pop');
  }, [experiment.id, experiment.title, triggerSpeechBubble]);

  // Real-time Connection & Topology Watcher
  useEffect(() => {
    if (components.length === 0) return;
    
    // Only check if connections or components count changed
    if (lastAnalyzedConnCountRef.current === connections.length) return;
    lastAnalyzedConnCountRef.current = connections.length;

    try {
      const topo = experiment.validateTopology(components, connections);

      if (!topo.isValid || (topo.errors && topo.errors.length > 0)) {
        const errorMsg = topo.errors?.[0] || topo.message || 'Circuit topology incomplete or invalid connection.';
        triggerSpeechBubble(
          `⚠️ ${errorMsg}`,
          'error',
          'Connection Issue Detected',
          'alert'
        );

        // Add to chat history
        const sysMsg: ChatMessage = {
          id: `topo-err-${Date.now()}`,
          sender: 'system',
          text: `⚠️ **Wiring Alert**: ${errorMsg}`,
          mood: 'error',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, sysMsg]);
      } else if (connections.length > 0) {
        // Successful connection
        triggerSpeechBubble(
          `✅ Valid circuit connection detected! Ready to simulate.`,
          'happy',
          'Circuit Connected',
          'success'
        );
      }
    } catch (err) {
      console.error('Topology validation check error:', err);
    }
  }, [connections, components, experiment, parameters, activeFaults, triggerSpeechBubble]);

  // Real-time Simulation Results & Faults Watcher
  useEffect(() => {
    if (!lastResult || !lastResult.timestamp || lastResult.timestamp === lastResultTimestampRef.current) return;
    lastResultTimestampRef.current = lastResult.timestamp;

    if (lastResult.success) {
      // Find primary measurement reading
      const primaryMeas = lastResult.measurements[0];
      const measText = primaryMeas ? `${primaryMeas.label}: ${primaryMeas.observedValue} ${primaryMeas.unit}` : 'Converged';

      if (lastResult.warnings && lastResult.warnings.length > 0) {
        const warnMsg = lastResult.warnings[0].message;
        triggerSpeechBubble(
          `⚠️ Anomaly: ${warnMsg}`,
          'warning',
          'Hardware Anomaly',
          'alert'
        );
      } else if (activeFaults.length > 0) {
        triggerSpeechBubble(
          `🚨 Active Fault Triggered (${activeFaults.join(', ')}). Measurements reflect physical hardware degradation!`,
          'warning',
          'Fault Active',
          'alert'
        );
      } else {
        triggerSpeechBubble(
          `🎉 Great job! Experiment ran successfully with ${measText}. Data point logged to plots!`,
          'happy',
          'Simulation Successful',
          'success'
        );
      }
    } else {
      triggerSpeechBubble(
        `❌ Simulation Failed: ${lastResult.topology?.message || 'Check wire terminals and component ratings.'}`,
        'error',
        'Simulation Error',
        'alert'
      );
    }
  }, [lastResult, activeFaults, triggerSpeechBubble]);

  // Scroll to bottom when new chat messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Send message to Groq-powered AI Tutor
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);
    setMood('thinking');

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          experimentId: experiment.id,
          components,
          connections,
          parameters,
          activeFaults,
          latestResult: lastResult,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data: TutorResponse = await res.json();

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: data.answer,
        sources: data.sources,
        isCuratedFallback: data.isCuratedFallback,
        mood: 'happy',
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorMsg]);
      setMood('happy');
      playChime('pop');
    } catch (err) {
      console.error('Robot tutor request error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'tutor',
        text: "⚠️ **Tutor Service Notice**: I'm unable to connect to the reasoning server right now. Check your internet connection or verify `.env.local` settings.",
        isCuratedFallback: true,
        mood: 'warning',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setMood('warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
    setSpeechBubble(null);
  };

  const quickPrompts = [
    { label: "⚡ Check Wiring", query: "Can you inspect my component placement and wire connections for any errors or open circuits?" },
    { label: "🔍 Diagnose Reading", query: "Why is the current observed measurement what it is? Is it consistent with theoretical formulas?" },
    { label: "📐 Explain Formula", query: `Explain how the governing equation applies to my active inputs.` },
    { label: "🚨 Active Faults", query: "Are there any active faults or calibration drifts affecting my experiment?" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* 1. Interactive Speech Notification Bubble */}
      {!isOpen && speechBubble && (
        <div className="pointer-events-auto mb-3 max-w-xs sm:max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div
            onClick={handleOpenChat}
            className={`p-3.5 rounded-2xl shadow-2xl border cursor-pointer transition-all hover:scale-102 flex items-start space-x-3 ${
              speechBubble.mood === 'error'
                ? 'bg-rose-950/90 border-rose-600 text-rose-100 shadow-rose-950/50 backdrop-blur-md'
                : speechBubble.mood === 'warning'
                ? 'bg-amber-950/90 border-amber-600 text-amber-100 shadow-amber-950/50 backdrop-blur-md'
                : speechBubble.mood === 'happy'
                ? 'bg-emerald-950/90 border-emerald-600 text-emerald-100 shadow-emerald-950/50 backdrop-blur-md'
                : isDark
                ? 'bg-slate-900/95 border-cyan-500/40 text-slate-100 shadow-cyan-950/50 backdrop-blur-md'
                : 'bg-white/95 border-cyan-500/40 text-slate-800 shadow-slate-300/80 backdrop-blur-md'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {speechBubble.mood === 'error' ? (
                <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                </div>
              ) : speechBubble.mood === 'warning' ? (
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              ) : speechBubble.mood === 'happy' ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              {speechBubble.title && (
                <div className="text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>{speechBubble.title}</span>
                  <span className="text-[9px] opacity-70">Click to chat →</span>
                </div>
              )}
              <p className="text-xs leading-relaxed line-clamp-3 font-medium">
                {speechBubble.text}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSpeechBubble(null);
              }}
              className="text-xs opacity-60 hover:opacity-100 p-0.5 -mt-1 -mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Floating Live Chat Window */}
      {isOpen && (
        <div className={`pointer-events-auto mb-3 rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95 ${
          isExpanded
            ? 'w-[90vw] sm:w-[540px] h-[80vh] max-h-[700px]'
            : 'w-[92vw] sm:w-[400px] h-[520px]'
        } ${
          isDark
            ? 'bg-slate-900/95 border-slate-700/80 shadow-cyan-950/40 backdrop-blur-xl text-slate-100'
            : 'bg-white/95 border-slate-200 shadow-slate-400/40 backdrop-blur-xl text-slate-800'
        }`}>
          
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/90 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2.5">
              <div className={`relative w-9 h-9 rounded-2xl flex items-center justify-center border shadow-inner ${
                mood === 'error'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : mood === 'warning'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : mood === 'happy'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
              }`}>
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
              </div>

              <div>
                <h4 className="text-xs font-bold flex items-center space-x-1.5">
                  <span>LabBot AI Live Assistant</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-mono border border-cyan-500/30">
                    Groq LLaMA
                  </span>
                </h4>
                <p className="text-[10px] opacity-60 flex items-center space-x-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Monitoring: {experiment.title}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-200 text-slate-600'
                }`}
                title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-200 text-slate-600'
                }`}
                title={isExpanded ? "Collapse view" : "Expand view"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark ? 'border-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400' : 'border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600'
                }`}
                title="Close chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Diagnostics Strip */}
          <div className={`px-3 py-2 border-b flex items-center space-x-1.5 overflow-x-auto text-[10px] no-scrollbar shrink-0 ${
            isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-100/60 border-slate-200'
          }`}>
            <Sparkles className="w-3 h-3 text-cyan-500 shrink-0" />
            <span className="opacity-60 shrink-0 font-semibold uppercase">Quick Prompts:</span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                disabled={isLoading}
                className={`px-2 py-0.5 rounded-md border whitespace-nowrap transition-all font-medium cursor-pointer shrink-0 disabled:opacity-40 ${
                  isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-cyan-500/50'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-cyan-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[88%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {msg.sender === 'user' ? (
                    <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  ) : msg.sender === 'system' ? (
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border shadow ${
                      msg.mood === 'error'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : msg.mood === 'warning'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : msg.mood === 'happy'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    }`}>
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`p-3 rounded-2xl shadow-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : msg.sender === 'system'
                      ? isDark
                        ? 'bg-amber-950/40 border border-amber-800/60 text-amber-200 rounded-tl-none'
                        : 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-none'
                      : isDark
                      ? 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none'
                      : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {/* Message Text with simple markdown formatting */}
                    <div className="whitespace-pre-wrap font-sans text-xs">
                      {msg.text.split('\n').map((line, lIdx) => {
                        // Check for bold notation
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          return (
                            <p key={lIdx} className="my-1">
                              {parts.map((p, pIdx) =>
                                pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-cyan-400 dark:text-cyan-300">{p}</strong> : p
                              )}
                            </p>
                          );
                        }
                        return <p key={lIdx} className="my-0.5">{line}</p>;
                      })}
                    </div>

                    <span className="block text-[9px] opacity-50 mt-1.5 text-right font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-2 animate-pulse">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500 text-cyan-400 flex items-center justify-center shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className={`p-3 rounded-2xl rounded-tl-none border text-xs flex items-center space-x-2 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-spin" />
                  <span>LabBot is analyzing workspace parameters with Groq...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Box */}
          <div className={`p-3 border-t shrink-0 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask LabBot about wiring, formulas, or faults..."
                disabled={isLoading}
                className={`flex-1 px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                }`}
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white shadow-md transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Send query"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>

        </div>
      )}

      {/* 3. Floating Animated Robot Avatar Button (Bottom-Right) */}
      <div className="pointer-events-auto relative group">
        <button
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              handleOpenChat();
            }
          }}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer ${
            mood === 'error'
              ? 'bg-gradient-to-br from-rose-600 to-red-900 border-rose-400 text-white shadow-rose-600/50 animate-bounce'
              : mood === 'warning'
              ? 'bg-gradient-to-br from-amber-600 to-orange-900 border-amber-400 text-white shadow-amber-600/50'
              : mood === 'happy'
              ? 'bg-gradient-to-br from-emerald-600 to-teal-900 border-emerald-400 text-white shadow-emerald-600/50'
              : isDark
              ? 'bg-gradient-to-br from-cyan-600 via-indigo-700 to-slate-900 border-cyan-400 text-white shadow-cyan-500/40'
              : 'bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 border-cyan-300 text-white shadow-blue-500/40'
          }`}
          title="LabBot AI Assistant - Click to chat"
        >
          {/* Animated Glow Halo */}
          <span className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
            mood === 'error' ? 'bg-rose-500' : mood === 'warning' ? 'bg-amber-500' : mood === 'happy' ? 'bg-emerald-500' : 'bg-cyan-400'
          }`} />

          {/* SVG Animated Robot Face */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Robot Antenna */}
            <div className="flex flex-col items-center -mt-1.5">
              <span className={`w-2 h-2 rounded-full shadow-sm transition-colors ${
                mood === 'error' ? 'bg-rose-300 animate-ping' : mood === 'warning' ? 'bg-amber-300' : mood === 'happy' ? 'bg-emerald-300' : 'bg-cyan-300 animate-pulse'
              }`} />
              <span className="w-0.5 h-1.5 bg-slate-300 opacity-80" />
            </div>

            {/* Robot Visor / Eyes */}
            <div className="w-8 h-4.5 rounded-lg bg-slate-950/80 border border-white/30 flex items-center justify-center space-x-1.5 px-1 shadow-inner">
              {mood === 'error' ? (
                <>
                  <span className="text-[10px] text-rose-400 font-black">!</span>
                  <span className="text-[10px] text-rose-400 font-black">!</span>
                </>
              ) : mood === 'warning' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </>
              ) : mood === 'happy' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                </>
              ) : mood === 'thinking' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-cyan-400 shadow" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-cyan-400 shadow" />
                </>
              )}
            </div>

            {/* Robot Mouth / Status LED */}
            <div className="w-3.5 h-1 rounded-full bg-white/40 mt-1" />
          </div>

          {/* Unread Alert Badge */}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-950 shadow-lg animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

    </div>
  );
};
