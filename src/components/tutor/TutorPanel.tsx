'use client';

import React, { useState } from 'react';
import { CircuitInput, SimulationResult, TutorResponse, TutorSource } from '@/types';
import { Bot, Send, User, Sparkles, BookOpen, RotateCcw, Loader2 } from 'lucide-react';

interface TutorPanelProps {
  currentInput: CircuitInput;
  lastResult: SimulationResult | null;
  activeStep?: number;
  theme?: 'dark' | 'light';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  sources?: TutorSource[];
  isCuratedFallback?: boolean;
  timestamp: string;
}

export const TutorPanel: React.FC<TutorPanelProps> = ({
  currentInput,
  lastResult,
  activeStep,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'tutor',
      text: `Hello! I am your **LabVerse AI Tutor**. I analyze your live Ohm's Law circuit state ($V=${currentInput.voltage}\\text{V}, R=${currentInput.resistance}\\ \\Omega$) and help you troubleshoot faults, understand equation mechanics, and interpret V-I graphs.\n\nAsk me anything or select a diagnostic quick prompt below!`,
      isCuratedFallback: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    { label: "Why is current 0A?", query: "Why is my measured current zero even though voltage is applied?" },
    { label: "Is ammeter accurate?", query: "Why is the ammeter display reading different from theoretical V/R?" },
    { label: "Calculate expected I", query: `Calculate the theoretical current for V=${currentInput.voltage}V and R=${currentInput.resistance}Ω.` },
    { label: "Explain V=IR slope", query: "Explain how the slope of the V-I curve relates to resistance." },
  ];

  const handleSend = async (queryText?: string) => {
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

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          experimentId: 'ohms-law',
          currentStep: activeStep,
          circuitInput: currentInput,
          lastResult: lastResult,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: TutorResponse = await res.json();

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: data.answer,
        sources: data.sources,
        isCuratedFallback: data.isCuratedFallback,
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error('Failed to contact tutor service:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'tutor',
        text: "⚠️ **Tutor Service Unavailable**: Unable to reach the server handler. Please verify network connection or try again.",
        isCuratedFallback: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl border p-5 space-y-4 shadow-xl flex flex-col h-[640px] transition-colors ${
      isDark
        ? 'bg-slate-900 border-slate-800'
        : 'bg-white border-slate-200/90 shadow-slate-200/60'
    }`}>
      
      {/* Tutor Panel Header */}
      <div className={`flex items-center justify-between border-b pb-3 shrink-0 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-500 border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold flex items-center space-x-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <span>LabVerse AI Tutor</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isDark ? 'bg-cyan-950 text-cyan-400 border-cyan-800' : 'bg-cyan-50 text-cyan-700 border-cyan-300'
              }`}>
                RAG Grounded
              </span>
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Context-Aware Circuit Diagnostics & Physics Assistant
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className={`p-1.5 rounded transition-colors ${
            isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Clear Chat History"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Diagnostic Prompts Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className={`text-[10px] font-semibold uppercase tracking-wider shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Prompts:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            disabled={isLoading}
            className={`px-2.5 py-1 rounded-lg text-[11px] border whitespace-nowrap transition-all shrink-0 ${
              isDark
                ? 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-cyan-800 border-slate-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Transcript Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed ${
                isUser
                  ? isDark
                    ? 'bg-cyan-600/20 border border-cyan-500/40 text-cyan-100 rounded-tr-none'
                    : 'bg-cyan-100 border border-cyan-300 text-cyan-950 rounded-tr-none font-medium'
                  : isDark
                  ? 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
                {!isUser && (
                  <div className={`flex items-center justify-between text-[10px] border-b pb-1.5 ${
                    isDark ? 'border-slate-850 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <span className="flex items-center space-x-1 text-cyan-600 dark:text-cyan-400 font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>{msg.isCuratedFallback ? 'Curated Grounded Knowledge Base' : 'Groq AI Response'}</span>
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className={`pt-2 border-t space-y-1 ${isDark ? 'border-slate-850' : 'border-slate-200'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <BookOpen className="w-3 h-3 text-indigo-500" />
                      <span>Grounded Knowledge References ({msg.sources.length})</span>
                    </span>
                    <div className="space-y-1">
                      {msg.sources.map((src, i) => (
                        <div key={i} className={`p-1.5 rounded border text-[10px] ${
                          isDark ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'
                        }`}>
                          <p className="font-semibold text-cyan-600 dark:text-cyan-300">{src.title}</p>
                          <p className={`italic text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{src.source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className={`flex items-center space-x-2 text-xs p-3 rounded-xl border w-fit ${
            isDark ? 'text-indigo-400 bg-slate-950 border-indigo-900/40' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
          }`}>
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Searching grounded vector knowledge & generating diagnosis...</span>
          </div>
        )}
      </div>

      {/* Input Box Bar */}
      <div className={`pt-2 shrink-0 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI tutor about circuit behavior or faults..."
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 transition-all ${
              isDark
                ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
