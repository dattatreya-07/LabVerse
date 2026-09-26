'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Atom,
  Zap,
  Activity,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Bot,
  Sparkles,
  Compass,
  Sun,
  Moon,
  FileText,
  Database,
  BarChart3,
  Layers,
  Award,
  Play,
  Check,
  ChevronRight,
  Shield
} from 'lucide-react';
import { KnowledgeCore } from './KnowledgeCore';

interface LandingPageProps {
  isAuthenticated: boolean;
  userDisplayName?: string;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onEnterLab?: (domain?: string, expId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  isAuthenticated,
  userDisplayName,
  theme = 'dark',
  onToggleTheme,
  onEnterLab,
}) => {
  const [hoverDomain, setHoverDomain] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const handleStart = (domain = 'ELECTRONICS', expId = 'ohms-law') => {
    if (onEnterLab) {
      onEnterLab(domain, expId);
    } else if (typeof window !== 'undefined') {
      window.location.href = `/?tab=lab&domain=${domain}&exp=${expId}`;
    }
  };

  const domains = [
    {
      id: 'CHEMISTRY',
      title: 'CHEMISTRY',
      subtitle: 'Atoms → Molecules → Reactions',
      description: 'Explore the structure of matter, activation barriers, and reaction kinetics through interactive molecular models.',
      icon: <Atom className="w-6 h-6 text-[#FF7448]" />,
      pillColor: 'bg-[#FF7448]/10 text-[#FF7448] border-[#FF7448]/20',
      expId: 'chemical-kinetics',
    },
    {
      id: 'ELECTRONICS',
      title: 'ELECTRONICS',
      subtitle: 'Components → Circuits → Measurements',
      description: 'Build circuits, connect precision instruments, measure signals, and diagnose hardware faults with MNA solvers.',
      icon: <Zap className="w-6 h-6 text-[#FF7448]" />,
      pillColor: 'bg-[#FF7448]/10 text-[#FF7448] border-[#FF7448]/20',
      expId: 'ohms-law',
    },
    {
      id: 'PHYSICS',
      title: 'PHYSICS',
      subtitle: 'Motion → Forces → Waves',
      description: 'Investigate simple harmonic motion across planetary gravities and quantify photoelectric photon emissions.',
      icon: <Activity className="w-6 h-6 text-[#FF7448]" />,
      pillColor: 'bg-[#FF7448]/10 text-[#FF7448] border-[#FF7448]/20',
      expId: 'gravity-pendulum',
    },
    {
      id: 'FINANCE',
      title: 'FINANCE',
      subtitle: 'Research → Portfolio → Risk → Decision',
      description: 'Practice professional portfolio allocation, calculate Sharpe ratios, and simulate asset volatility frontiers.',
      icon: <TrendingUp className="w-6 h-6 text-[#FF7448]" />,
      pillColor: 'bg-[#FF7448]/10 text-[#FF7448] border-[#FF7448]/20',
      expId: 'portfolio-risk',
    },
  ];

  const advancedExperiments = [
    {
      title: 'Rutherford Alpha Scattering',
      domain: 'Nuclear Physics',
      description: 'Fire alpha particles at gold foil to discover the atomic nucleus via 1/sin⁴(θ/2) deflection.',
      expId: 'rutherford-scattering',
      domainKey: 'NUCLEAR',
    },
    {
      title: 'Quantum Photoelectric Effect',
      domain: 'Quantum Mechanics',
      description: 'Eject photoelectrons with monochromatic UV lasers to calculate Planck\'s constant h.',
      expId: 'photoelectric-effect',
      domainKey: 'QUANTUM',
    },
    {
      title: '3D Antenna Radiation & Waves',
      domain: 'Telecommunications',
      description: 'Analyze directional beam patterns, Poynting vector flux, and Free Space Path Loss.',
      expId: 'antenna-radiation',
      domainKey: 'ECE',
    },
    {
      title: 'DNA Agarose Electrophoresis',
      domain: 'Biotechnology',
      description: 'Separate restriction fragments in agarose gel matrices using high-voltage DC fields.',
      expId: 'gel-electrophoresis',
      domainKey: 'BIOLOGY',
    },
    {
      title: 'Chemical Kinetics & Arrhenius Law',
      domain: 'Physical Chemistry',
      description: 'Determine reaction orders and compute activation energy Ea across temperature baths.',
      expId: 'chemical-kinetics',
      domainKey: 'CHEMISTRY',
    },
    {
      title: 'Variable-Gravity Pendulum',
      domain: 'Planetary Mechanics',
      description: 'Test simple harmonic motion and measure local g across Earth, Moon, Mars, and Jupiter.',
      expId: 'gravity-pendulum',
      domainKey: 'MECHANICS',
    },
  ];

  return (
    <div className={`min-h-screen font-sans selection:bg-[#FF7448] selection:text-white transition-colors ${
      isDark ? 'bg-[#0D1219] text-[#F8FAFC]' : 'bg-[#FFF9F6] text-[#0F151D]'
    }`}>
      
      {/* 1. CLEAN FLOATING NAVIGATION BAR */}
      <header className="sticky top-0 z-50 px-4 sm:px-8 pt-4 pb-2">
        <nav className={`max-w-6xl mx-auto px-5 py-3 rounded-full border shadow-sm backdrop-blur-xl flex items-center justify-between transition-all ${
          isDark
            ? 'bg-[#141B24]/90 border-[#2A3644] text-[#F8FAFC]'
            : 'bg-white/90 border-[#F0E6E1] text-[#0F151D]'
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#FF7448] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight font-mono">
              LABVERSE
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-semibold">
            <button
              onClick={() => handleStart('ELECTRONICS', 'ohms-law')}
              className="opacity-80 hover:opacity-100 hover:text-[#FF7448] transition-colors cursor-pointer"
            >
              Explore Labs
            </button>
            <button
              onClick={() => handleStart('FINANCE', 'portfolio-risk')}
              className="opacity-80 hover:opacity-100 hover:text-[#FF7448] transition-colors cursor-pointer"
            >
              Finance
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/?tab=tutor';
              }}
              className="opacity-80 hover:opacity-100 hover:text-[#FF7448] transition-colors cursor-pointer"
            >
              AI Tutor
            </button>
          </div>

          {/* Right Action */}
          <div className="flex items-center space-x-3">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-[#2A3644] hover:bg-[#1B232E] text-amber-300'
                    : 'border-[#F0E6E1] hover:bg-[#F9F1EC] text-[#0F151D]'
                }`}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold opacity-80 hidden sm:inline">
                  {userDisplayName || 'Student'}
                </span>
                <button
                  onClick={() => handleStart()}
                  className="px-4 py-2 rounded-full bg-[#FF7448] hover:bg-[#FF8D69] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Enter Lab →
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold opacity-80 hover:opacity-100 hover:text-[#FF7448] transition-colors"
                >
                  Sign In
                </Link>
                <button
                  onClick={() => handleStart()}
                  className="px-4 py-2 rounded-full bg-[#FF7448] hover:bg-[#FF8D69] text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* MAIN CHAPTER SEQUENCE */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32 py-10 sm:py-16">

        {/* 01. HERO SECTION */}
        <section className={`rounded-[36px] sm:rounded-[56px] border p-6 sm:p-12 lg:p-16 relative overflow-hidden transition-all ${
          isDark
            ? 'bg-[#141B24] border-[#2A3644] shadow-2xl'
            : 'bg-white border-[#F0E6E1] shadow-xl shadow-[#FF7448]/5'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FF7448]/10 border border-[#FF7448]/20 text-[#FF7448] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Science & Engineering</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                  LEARN BY <br />
                  <span className="text-[#FF7448]">DOING.</span>
                </h1>
                <p className={`text-base sm:text-xl font-normal leading-relaxed max-w-lg ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Explore science, engineering, and professional decision-making through interactive simulations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <button
                  onClick={() => handleStart('ELECTRONICS', 'ohms-law')}
                  className="px-7 py-3.5 rounded-full bg-[#FF7448] hover:bg-[#FF8D69] text-white text-sm font-bold transition-all transform hover:scale-102 active:scale-98 shadow-md flex items-center space-x-2 cursor-pointer"
                >
                  <span>Start Exploring</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') window.location.href = '/?tab=catalog';
                  }}
                  className={`px-7 py-3.5 rounded-full border text-sm font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'border-[#2A3644] hover:bg-[#1B232E] text-slate-200'
                      : 'border-[#0F151D]/15 hover:bg-[#0F151D]/5 text-[#0F151D]'
                  }`}
                >
                  Explore Labs
                </button>
              </div>

              {/* Minimal Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-5 text-xs font-semibold opacity-70">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-[#FF7448]" />
                  <span>8 Multi-Discipline Labs</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-[#FF7448]" />
                  <span>Deterministic Physics Solvers</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-[#FF7448]" />
                  <span>Groq AI Diagnostic Tutor</span>
                </div>
              </div>
            </div>

            {/* Right 3D Knowledge Core */}
            <div className="lg:col-span-5 h-[340px] sm:h-[440px] w-full flex items-center justify-center relative">
              <KnowledgeCore hoverDomain={hoverDomain} />
            </div>

          </div>
        </section>

        {/* 02. "THE IDEA" SECTION */}
        <section className="text-center max-w-3xl mx-auto space-y-6 py-6">
          <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
            02 • PHILOSOPHY
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Learning should not stop at watching.
          </h2>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-sm sm:text-base font-bold">
            <span className="px-4 py-2 rounded-2xl bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20">
              Build it.
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-4 py-2 rounded-2xl bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20">
              Run it.
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-4 py-2 rounded-2xl bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20">
              Break it.
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-4 py-2 rounded-2xl bg-[#0F151D] text-white dark:bg-white dark:text-[#0F151D]">
              Understand it.
            </span>
          </div>
        </section>

        {/* 03. EXPLORE DOMAINS SECTION */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
                03 • DOMAINS
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Explore Scientific Disciplines
              </h2>
            </div>
            <p className={`text-xs sm:text-sm max-w-md ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Authentic simulation platforms designed for fundamental physics, chemical kinetics, electronics, and finance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {domains.map((d) => (
              <div
                key={d.id}
                onMouseEnter={() => setHoverDomain(d.id)}
                onMouseLeave={() => setHoverDomain(null)}
                onClick={() => handleStart(d.id, d.expId)}
                className={`rounded-[36px] sm:rounded-[44px] border p-7 sm:p-9 transition-all duration-300 group cursor-pointer flex flex-col justify-between space-y-6 ${
                  isDark
                    ? 'bg-[#141B24] border-[#2A3644] hover:border-[#FF7448]/60 hover:bg-[#1B232E]'
                    : 'bg-white border-[#F0E6E1] hover:border-[#FF7448]/60 hover:shadow-xl hover:shadow-[#FF7448]/5'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] dark:bg-[#0D1219] border border-[#F0E6E1] dark:border-[#2A3644] flex items-center justify-center">
                      {d.icon}
                    </div>
                    <span className="text-xs font-mono font-bold text-[#FF7448] opacity-80 group-hover:opacity-100">
                      {d.subtitle}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {d.title}
                    </h3>
                    <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {d.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-bold text-[#FF7448] group-hover:translate-x-1 transition-transform">
                  <span>Explore {d.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 04. INTERACTIVE LEARNING (DARK FEATURE SECTION) */}
        <section className="rounded-[36px] sm:rounded-[56px] bg-[#141B24] border border-[#2A3644] p-8 sm:p-14 text-white space-y-10 shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
              04 • INTERACTIVE WORKFLOW
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Don&apos;t just read the experiment. <br />
              <span className="text-[#FF7448]">Run it.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every simulation operates on true mathematical models and live circuit node analysis. Construct physical topologies, tune live parameters, and evaluate instrument telemetry.
            </p>
          </div>

          {/* Sequential Workflow Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2 font-mono text-xs font-bold">
            {['01 LEARN', '02 BUILD', '03 CONNECT', '04 RUN', '05 OBSERVE', '06 ANALYZE', '07 MASTER'].map((step, sIdx) => (
              <div
                key={sIdx}
                className="p-3.5 rounded-2xl bg-[#1B232E] border border-[#2A3644] flex flex-col justify-between space-y-2 text-slate-200"
              >
                <span className="text-[10px] text-[#FF7448]">{step.split(' ')[0]}</span>
                <span className="text-xs tracking-wider">{step.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 05. ADVANCED EXPERIMENTS SECTION */}
        <section className="space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
              05 • EXPERIMENTS
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Experiments you can&apos;t always do in a classroom.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedExperiments.map((exp, idx) => (
              <div
                key={idx}
                onClick={() => handleStart(exp.domainKey, exp.expId)}
                className={`p-6 rounded-[32px] border transition-all duration-300 hover:scale-102 cursor-pointer flex flex-col justify-between space-y-4 ${
                  isDark
                    ? 'bg-[#141B24] border-[#2A3644] hover:border-[#FF7448]/60'
                    : 'bg-white border-[#F0E6E1] hover:border-[#FF7448]/60 shadow-sm'
                }`}
              >
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20 inline-block">
                    {exp.domain}
                  </span>
                  <h4 className="text-base font-bold tracking-tight">
                    {exp.title}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {exp.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center space-x-1.5 text-xs font-bold text-[#FF7448]">
                  <span>Launch Experiment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 06. PROFESSIONAL PRACTICE & FINANCE */}
        <section className={`rounded-[36px] sm:rounded-[56px] border p-8 sm:p-14 space-y-8 ${
          isDark ? 'bg-[#141B24] border-[#2A3644]' : 'bg-white border-[#F0E6E1]'
        }`}>
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
              06 • PROFESSIONAL PRACTICE
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Practice decisions before the real world.
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Beyond physical labs, LabVerse brings quantitative financial decision-making, asset allocation, risk modeling, and ledger reconciliation into interactive practice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { role: 'RESEARCH ANALYST', task: 'Analyze corporate cash flows, valuation models, and balance sheet health.' },
              { role: 'PORTFOLIO MANAGER', task: 'Build, rebalance, and optimize multi-asset portfolios on the Markowitz frontier.' },
              { role: 'ACCOUNTING & RISK', task: 'Compute Value at Risk (VaR), debt service coverage, and journal entries.' },
              { role: 'COMPLIANCE', task: 'Navigate regulatory stress tests and real-world compliance audit scenarios.' },
            ].map((p, pIdx) => (
              <div
                key={pIdx}
                className={`p-5 rounded-[24px] border flex flex-col justify-between space-y-3 ${
                  isDark ? 'bg-[#1B232E] border-[#2A3644]' : 'bg-[#FFF9F6] border-[#F0E6E1]'
                }`}
              >
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#FF7448] tracking-wider">
                    {p.role}
                  </h4>
                  <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {p.task}
                  </p>
                </div>
                <div className="text-[10px] font-semibold text-[#FF7448] flex items-center space-x-1">
                  <span>Simulate Case</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 07. AI TUTOR (Grounded in Telemetry) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
              07 • AI SOCRATIC TUTOR
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              An AI that understands what happened in your lab.
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Unlike generic chat assistants, the LabVerse tutor evaluates your exact circuit node connections, active parameters, and numerical solver measurements in real time.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.href = '/?tab=tutor';
                }}
                className="px-6 py-2.5 rounded-full bg-[#FF7448] hover:bg-[#FF8D69] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Open AI Tutor Panel →
              </button>
            </div>
          </div>

          <div className={`lg:col-span-7 rounded-[32px] sm:rounded-[40px] border p-6 sm:p-8 space-y-4 font-sans text-xs ${
            isDark ? 'bg-[#141B24] border-[#2A3644]' : 'bg-white border-[#F0E6E1] shadow-lg shadow-[#FF7448]/5'
          }`}>
            {/* Dialogue sample */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  U
                </span>
                <div className={`p-3 rounded-2xl rounded-tl-none ${
                  isDark ? 'bg-[#1B232E] text-slate-200' : 'bg-slate-100 text-slate-800'
                }`}>
                  Why did the circuit current double from 1.0A to 2.0A?
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-6 h-6 rounded-full bg-[#FF7448] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className={`p-3.5 rounded-2xl rounded-tl-none border space-y-2 ${
                  isDark ? 'bg-[#1B232E] border-[#2A3644] text-slate-200' : 'bg-[#FFF9F6] border-[#F0E6E1] text-slate-800'
                }`}>
                  <p>
                    Because you adjusted the resistor from <strong>12.0 Ω</strong> down to <strong>6.0 Ω</strong> while the DC supply remained fixed at <strong>12.0 V</strong>.
                  </p>
                  <div className="p-2 rounded-xl bg-black/10 dark:bg-black/30 font-mono text-[11px] text-[#FF7448] font-bold">
                    I = V / R = 12.0 V / 6.0 Ω = 2.00 A
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 08. YOUR PROGRESS / METRICS */}
        <section className={`rounded-[36px] sm:rounded-[48px] border p-8 sm:p-12 ${
          isDark ? 'bg-[#141B24] border-[#2A3644]' : 'bg-white border-[#F0E6E1]'
        }`}>
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
              08 • LAB JOURNEY
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Engineered for Mastery
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-5xl font-black text-[#FF7448] font-mono">8</span>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Interactive Labs</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-5xl font-black text-[#FF7448] font-mono">6</span>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Scientific Domains</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-5xl font-black text-[#FF7448] font-mono">100%</span>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Local Privacy</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-5xl font-black text-[#FF7448] font-mono">PDF</span>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Certified Reports</p>
            </div>
          </div>
        </section>

        {/* 09. CALL TO ACTION (CTA) */}
        <section className={`rounded-[36px] sm:rounded-[56px] border p-8 sm:p-16 text-center space-y-6 ${
          isDark
            ? 'bg-gradient-to-br from-[#141B24] to-[#1B232E] border-[#2A3644]'
            : 'bg-gradient-to-br from-[#FFF9F6] to-white border-[#F0E6E1] shadow-xl shadow-[#FF7448]/10'
        }`}>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to enter the LabVerse?
          </h2>
          <p className={`text-sm sm:text-base max-w-lg mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Start experimenting immediately with no setup or hardware required.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleStart('ELECTRONICS', 'ohms-law')}
              className="px-8 py-4 rounded-full bg-[#FF7448] hover:bg-[#FF8D69] text-white text-sm font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#FF7448]/25 inline-flex items-center space-x-2 cursor-pointer"
            >
              <span>Start Exploring Labs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </main>

      {/* 10. CLEAN EDITORIAL FOOTER */}
      <footer className={`border-t py-10 px-4 sm:px-8 text-xs transition-colors ${
        isDark ? 'border-[#2A3644] bg-[#0D1219] text-slate-400' : 'border-[#F0E6E1] bg-[#FFF9F6] text-slate-600'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-mono font-bold">
            <div className="w-5 h-5 rounded-full bg-[#FF7448] flex items-center justify-center text-white">
              <Cpu className="w-3 h-3" />
            </div>
            <span>LABVERSE • 2026</span>
          </div>

          <div className="flex items-center space-x-6 text-xs font-semibold">
            <button
              onClick={() => handleStart('ELECTRONICS', 'ohms-law')}
              className="hover:text-[#FF7448] transition-colors cursor-pointer"
            >
              Virtual Lab
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/?tab=catalog';
              }}
              className="hover:text-[#FF7448] transition-colors cursor-pointer"
            >
              Catalog
            </button>
            <Link href="/auth/login" className="hover:text-[#FF7448] transition-colors">
              Sign In
            </Link>
          </div>

          <span className="opacity-70 font-mono text-[11px]">
            Interactive STEM & Decision Platform
          </span>
        </div>
      </footer>

    </div>
  );
};
