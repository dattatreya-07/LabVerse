'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Shield,
  LogOut,
  User,
  Sliders,
  Terminal,
  Radio,
  Dna
} from 'lucide-react';
import { KnowledgeCore } from './KnowledgeCore';

interface LandingPageProps {
  isAuthenticated: boolean;
  userDisplayName?: string;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onEnterLab?: (domain?: string, expId?: string) => void;
  onSignOut?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  isAuthenticated,
  userDisplayName,
  theme = 'dark',
  onToggleTheme,
  onEnterLab,
  onSignOut,
}) => {
  const [hoverDomain, setHoverDomain] = useState<string | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const isDark = theme === 'dark';

  // Gentle Mouse Parallax Tracker
  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window === 'undefined') return;
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 16;
    const y = (clientY / window.innerHeight - 0.5) * 16;
    setMouseOffset({ x, y });
  };

  // Scroll Reveal Observer
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section-id');
            if (id) {
              setVisibleSections((prev) => ({ ...prev, [id]: true }));
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('[data-section-id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleStart = (domain?: string, expId?: string) => {
    if (onEnterLab) {
      onEnterLab(domain, expId);
    } else if (typeof window !== 'undefined') {
      if (expId) {
        window.location.href = `/?tab=lab&domain=${domain || 'ALL'}&exp=${expId}`;
      } else {
        window.location.href = `/?tab=catalog${domain ? `&domain=${domain}` : ''}`;
      }
    }
  };

  const domains = [
    {
      id: 'CHEMISTRY',
      title: 'Chemistry',
      subtitle: 'Atoms → Molecules → Reactions',
      description: 'Explore molecular orbitals, rate constants, activation barriers, and the periodic law through interactive chemical reactors.',
      icon: <Atom className="w-6 h-6 text-[#FF7448]" />,
      pillColor: 'bg-[#FF7448]/10 text-[#FF7448] border-[#FF7448]/20',
      expId: 'chemical-kinetics',
      formula: 'k = A e^{-E_a/(RT)}',
    },
    {
      id: 'ELECTRONICS',
      title: 'Electronics',
      subtitle: 'Components → Circuits → Signals',
      description: 'Design schematics, wire precision ammeters and voltmeters, and inspect real-time current loops using MNA matrix solvers.',
      icon: <Zap className="w-6 h-6 text-[#FF7448]" />,
      pillColor: 'bg-[#FF7448]/10 text-[#FF7448] border-[#FF7448]/20',
      expId: 'ohms-law',
      formula: 'I = V / R, \\quad P = V \\cdot I',
    },
    {
      id: 'PHYSICS',
      title: 'Physics',
      subtitle: 'Motion → Forces → Quantum',
      description: 'Simulate planetary gravitational fields, simple harmonic pendulums, and photon stopping potentials with Planck precision.',
      icon: <Activity className="w-6 h-6 text-[#FF7448]" />,
      pillColor: 'bg-[#FF7448]/10 text-[#FF7448] border-[#FF7448]/20',
      expId: 'gravity-pendulum',
      formula: 'T = 2\\pi\\sqrt{L/g}',
    },
    {
      id: 'FINANCE',
      title: 'Finance & Risk',
      subtitle: 'Research → Portfolio → Decision',
      description: 'Practice multi-asset capital allocation, calculate Sharpe ratios, and simulate asset volatility frontiers.',
      icon: <TrendingUp className="w-6 h-6 text-[#FF7448]" />,
      pillColor: 'bg-[#FF7448]/10 text-[#FF7448] border-[#FF7448]/20',
      expId: 'portfolio-risk',
      formula: 'S = [E(R_p) - R_f] / \\sigma_p',
    },
  ];

  const advancedExperiments = [
    {
      title: 'Rutherford Alpha Scattering',
      domain: 'Nuclear Physics',
      icon: <Radio className="w-5 h-5 text-[#FF7448]" />,
      description: 'Deflect high-energy alpha particles through gold foils to measure nuclear charge distribution.',
      expId: 'rutherford-scattering',
      domainKey: 'NUCLEAR',
    },
    {
      title: 'Quantum Photoelectric Effect',
      domain: 'Quantum Physics',
      icon: <Sparkles className="w-5 h-5 text-[#FF7448]" />,
      description: 'Eject photoelectrons with monochromatic laser wavelengths and calculate work functions.',
      expId: 'photoelectric-effect',
      domainKey: 'QUANTUM',
    },
    {
      title: '3D Antenna Radiation & Waves',
      domain: 'Telecommunications',
      icon: <Radio className="w-5 h-5 text-[#FF7448]" />,
      description: 'Simulate toroidal dipole lobes, parabolic dishes, Poynting vectors, and path loss.',
      expId: 'antenna-radiation',
      domainKey: 'ECE',
    },
    {
      title: 'DNA Agarose Electrophoresis',
      domain: 'Biotechnology',
      icon: <Dna className="w-5 h-5 text-[#FF7448]" />,
      description: 'Separate DNA fragments in submarine buffer tanks with high-voltage DC electric fields.',
      expId: 'gel-electrophoresis',
      domainKey: 'BIOLOGY',
    },
    {
      title: 'Chemical Kinetics & Arrhenius Law',
      domain: 'Physical Chemistry',
      icon: <Atom className="w-5 h-5 text-[#FF7448]" />,
      description: 'Determine reaction rates and activation energies using spectrophotometric iodine clocks.',
      expId: 'chemical-kinetics',
      domainKey: 'CHEMISTRY',
    },
    {
      title: 'Variable-Gravity Planetary Pendulum',
      domain: 'Classical Mechanics',
      icon: <Activity className="w-5 h-5 text-[#FF7448]" />,
      description: 'Test harmonic oscillation and measure local gravity across Earth, Moon, Mars, and Jupiter.',
      expId: 'gravity-pendulum',
      domainKey: 'MECHANICS',
    },
  ];

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen font-sans selection:bg-[#FF7448] selection:text-white transition-colors relative overflow-hidden ${
        isDark ? 'bg-[#0D1219] text-[#F8FAFC]' : 'bg-[#FFF9F6] text-[#0F151D]'
      }`}
    >
      {/* Background Scientific Grid Motif */}
      <div className="absolute inset-0 bg-science-grid pointer-events-none opacity-70" />

      {/* 1. CLEAN FLOATING NAVIGATION BAR */}
      <header className="sticky top-0 z-50 px-4 sm:px-8 pt-4 pb-2">
        <nav className={`max-w-6xl mx-auto px-5 py-2.5 rounded-full border shadow-sm backdrop-blur-xl flex items-center justify-between transition-all ${
          isDark
            ? 'bg-[#141B24]/90 border-[#2A3644] text-[#F8FAFC]'
            : 'bg-white/90 border-[#E8E2DC] text-[#0F151D]'
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#FF7448] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight font-mono">
              LABVERSE
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-semibold">
            <button
              onClick={() => handleStart()}
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

          {/* Right Action & Sign Out */}
          <div className="flex items-center space-x-3">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-[#2A3644] hover:bg-[#1B232E] text-amber-300'
                    : 'border-[#E8E2DC] hover:bg-[#F5F1ED] text-[#0F151D]'
                }`}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20 text-xs font-semibold">
                  <User className="w-3.5 h-3.5" />
                  <span>{userDisplayName || 'Researcher'}</span>
                </div>

                <button
                  onClick={() => handleStart()}
                  className="btn-pill-primary h-9 px-4 text-xs cursor-pointer"
                >
                  Enter Lab →
                </button>

                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className={`p-2 rounded-full border transition-colors cursor-pointer text-slate-500 hover:text-rose-500 ${
                      isDark ? 'border-[#2A3644] hover:bg-rose-950/40' : 'border-[#E8E2DC] hover:bg-rose-50'
                    }`}
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
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
                  className="btn-pill-primary h-9 px-4 text-xs cursor-pointer"
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28 py-8 sm:py-14 relative z-10">

        {/* 01. HERO SECTION (NO OVERLAPPING BADGES) */}
        <section
          data-section-id="hero"
          className={`rounded-[28px] sm:rounded-[36px] border p-6 sm:p-10 lg:p-12 relative overflow-hidden transition-all duration-700 card-nomu ${
            visibleSections['hero'] ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-2'
          } ${
            isDark
              ? 'bg-[#141B24] border-[#2A3644] shadow-2xl'
              : 'bg-white border-[#E8E2DC] shadow-xl shadow-[#FF7448]/5'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 z-10">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FF7448]/10 border border-[#FF7448]/20 text-[#FF7448] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Science & Engineering</span>
                </div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Deterministic Accuracy</span>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08]">
                  LEARN BY <br />
                  <span className="text-[#FF7448]">DOING.</span>
                </h1>
                <p className={`text-base sm:text-lg font-normal leading-relaxed max-w-lg ${
                  isDark ? 'text-slate-300' : 'text-[#4A5568]'
                }`}>
                  Explore science, engineering, and professional decision-making through interactive 3D simulations and deterministic physics engines.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => handleStart()}
                  className="btn-pill-primary cursor-pointer"
                >
                  <span>Start Exploring Labs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') window.location.href = '/?tab=catalog';
                  }}
                  className="btn-pill-secondary cursor-pointer"
                >
                  Browse Catalog
                </button>
              </div>

              {/* Minimal Clean Trust Indicators (No Collision) */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold opacity-75">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-[#22C55E]" />
                  <span>8 Multi-Discipline Labs</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-[#22C55E]" />
                  <span>Interactive 3D Three.js</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-[#22C55E]" />
                  <span>Groq AI Diagnostic Tutor</span>
                </div>
              </div>
            </div>

            {/* Right 3D Knowledge Core (Sized and Centered Cleanly) */}
            <div
              className="lg:col-span-5 h-[300px] sm:h-[360px] w-full flex items-center justify-center relative transition-transform duration-500 ease-out"
              style={{ transform: `translate(${-mouseOffset.x * 0.3}px, ${-mouseOffset.y * 0.3}px)` }}
            >
              <KnowledgeCore hoverDomain={hoverDomain} />
            </div>

          </div>
        </section>

        {/* 02. "THE IDEA" SECTION */}
        <section
          data-section-id="idea"
          className={`text-center max-w-3xl mx-auto space-y-5 py-4 transition-all duration-700 ${
            visibleSections['idea'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
            02 • PHILOSOPHY
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Learning should not stop at watching.
          </h2>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-xs sm:text-sm font-bold">
            <span className="px-4 py-2 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20 shadow-sm">
              Build it.
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-4 py-2 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20 shadow-sm">
              Run it.
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-4 py-2 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20 shadow-sm">
              Break it.
            </span>
            <span className="text-slate-400">→</span>
            <span className="px-4 py-2 rounded-full bg-[#0F151D] text-white dark:bg-white dark:text-[#0F151D] shadow-sm">
              Understand it.
            </span>
          </div>
        </section>

        {/* 03. EXPLORE DOMAINS SECTION */}
        <section
          data-section-id="domains"
          className={`space-y-6 transition-all duration-700 ${
            visibleSections['domains'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
                03 • DOMAINS
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Explore Scientific Disciplines
              </h2>
            </div>
            <p className={`text-xs sm:text-sm max-w-md ${isDark ? 'text-slate-400' : 'text-[#4A5568]'}`}>
              Authentic simulation platforms designed for fundamental physics, chemical kinetics, electronics, and finance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {domains.map((d, dIdx) => (
              <div
                key={d.id}
                onMouseEnter={() => setHoverDomain(d.id)}
                onMouseLeave={() => setHoverDomain(null)}
                onClick={() => handleStart(d.id, d.expId)}
                style={{ transitionDelay: `${dIdx * 100}ms` }}
                className={`rounded-[24px] border p-6 sm:p-8 transition-all duration-300 group cursor-pointer flex flex-col justify-between space-y-6 card-nomu ${
                  isDark
                    ? 'bg-[#141B24] border-[#2A3644] hover:border-[#FF7448]'
                    : 'bg-white border-[#E8E2DC] hover:border-[#FF7448] hover:shadow-lg hover:shadow-[#FF7448]/5'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#FFF9F6] dark:bg-[#0D1219] border border-[#E8E2DC] dark:border-[#2A3644] flex items-center justify-center">
                      {d.icon}
                    </div>
                    <span className="text-xs font-mono font-bold text-[#FF7448] opacity-80 group-hover:opacity-100">
                      {d.subtitle}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {d.title}
                    </h3>
                    <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-[#4A5568]'
                    }`}>
                      {d.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <span className="font-mono text-[11px] opacity-60 font-semibold">{d.formula}</span>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#FF7448] group-hover:translate-x-1 transition-transform">
                    <span>Enter {d.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 04. INTERACTIVE LEARNING (DARK FEATURE SECTION) */}
        <section
          data-section-id="workflow"
          className={`rounded-[28px] sm:rounded-[36px] bg-[#0F151D] border border-[#2A3644] p-7 sm:p-12 text-white space-y-8 shadow-2xl relative overflow-hidden transition-all duration-700 ${
            visibleSections['workflow'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="max-w-2xl space-y-3 relative z-10">
            <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
              04 • INTERACTIVE WORKFLOW
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Don&apos;t just read the experiment. <br />
              <span className="text-[#FF7448]">Run it.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every simulation operates on true mathematical models and live circuit node analysis. Construct physical topologies, tune live parameters, and evaluate instrument telemetry.
            </p>
          </div>

          {/* Sequential Workflow Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1 font-mono text-xs font-bold relative z-10">
            {['01 LEARN', '02 BUILD', '03 CONNECT', '04 RUN', '05 OBSERVE', '06 ANALYZE', '07 MASTER'].map((step, sIdx) => (
              <div
                key={sIdx}
                className="p-3 rounded-2xl bg-[#141B24] border border-[#2A3644] flex flex-col justify-between space-y-1 text-slate-200 hover:border-[#FF7448] transition-colors"
              >
                <span className="text-[10px] text-[#FF7448]">{step.split(' ')[0]}</span>
                <span className="text-xs tracking-wider">{step.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 05. ADVANCED EXPERIMENTS SECTION */}
        <section
          data-section-id="experiments"
          className={`space-y-6 transition-all duration-700 ${
            visibleSections['experiments'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
              05 • EXPERIMENTS
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Experiments you can&apos;t always do in a classroom.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {advancedExperiments.map((exp, idx) => (
              <div
                key={idx}
                onClick={() => handleStart(exp.domainKey, exp.expId)}
                style={{ transitionDelay: `${idx * 80}ms` }}
                className={`p-5 rounded-[24px] border transition-all duration-200 hover:scale-102 cursor-pointer flex flex-col justify-between space-y-4 card-nomu ${
                  isDark
                    ? 'bg-[#141B24] border-[#2A3644] hover:border-[#FF7448]'
                    : 'bg-white border-[#E8E2DC] hover:border-[#FF7448] shadow-sm'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FF7448]/10 text-[#FF7448] border border-[#FF7448]/20">
                      {exp.domain}
                    </span>
                    {exp.icon}
                  </div>
                  <h4 className="text-base font-bold tracking-tight">
                    {exp.title}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#4A5568]'}`}>
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
        <section
          data-section-id="practice"
          className={`rounded-[28px] sm:rounded-[36px] border p-7 sm:p-10 space-y-6 card-nomu transition-all duration-700 ${
            visibleSections['practice'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          } ${
            isDark ? 'bg-[#141B24] border-[#2A3644]' : 'bg-white border-[#E8E2DC]'
          }`}
        >
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
              06 • PROFESSIONAL PRACTICE
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Practice decisions before the real world.
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-[#4A5568]'}`}>
              Beyond physical labs, LabVerse brings quantitative financial decision-making, asset allocation, risk modeling, and ledger reconciliation into interactive practice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: 'RESEARCH ANALYST', task: 'Analyze corporate cash flows, valuation models, and balance sheet health.' },
              { role: 'PORTFOLIO MANAGER', task: 'Build, rebalance, and optimize multi-asset portfolios on the Markowitz frontier.' },
              { role: 'ACCOUNTING & RISK', task: 'Compute Value at Risk (VaR), debt service coverage, and journal entries.' },
              { role: 'COMPLIANCE', task: 'Navigate regulatory stress tests and real-world compliance audit scenarios.' },
            ].map((p, pIdx) => (
              <div
                key={pIdx}
                className={`p-4 rounded-[18px] border flex flex-col justify-between space-y-3 ${
                  isDark ? 'bg-[#0D1219] border-[#2A3644]' : 'bg-[#FFF9F6] border-[#E8E2DC]'
                }`}
              >
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#FF7448] tracking-wider">
                    {p.role}
                  </h4>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#0F151D]'}`}>
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
        <section
          data-section-id="tutor"
          className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-center transition-all duration-700 ${
            visibleSections['tutor'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
              07 • AI SOCRATIC TUTOR
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              An AI that understands what happened in your lab.
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#4A5568]'}`}>
              Unlike generic chat assistants, the LabVerse tutor evaluates your exact circuit node connections, active parameters, and numerical solver measurements in real time.
            </p>
            <div className="pt-1">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.href = '/?tab=tutor';
                }}
                className="btn-pill-primary h-10 px-5 text-xs cursor-pointer"
              >
                Open AI Tutor Panel →
              </button>
            </div>
          </div>

          <div className={`lg:col-span-7 rounded-[24px] border p-6 space-y-4 font-sans text-xs card-nomu ${
            isDark ? 'bg-[#141B24] border-[#2A3644]' : 'bg-white border-[#E8E2DC] shadow-md'
          }`}>
            <div className="space-y-3">
              <div className="flex items-start space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-[#0F151D] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  U
                </span>
                <div className={`p-3 rounded-2xl rounded-tl-none ${
                  isDark ? 'bg-[#1B232E] text-slate-200' : 'bg-[#F5F1ED] text-[#0F151D]'
                }`}>
                  Why did the circuit current double from 1.0A to 2.0A?
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-6 h-6 rounded-full bg-[#FF7448] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className={`p-3.5 rounded-2xl rounded-tl-none border space-y-2 ${
                  isDark ? 'bg-[#0D1219] border-[#2A3644] text-slate-200' : 'bg-[#FFF9F6] border-[#E8E2DC] text-[#0F151D]'
                }`}>
                  <p>
                    Because you dialed the resistance down from <strong>12.0 Ω</strong> to <strong>6.0 Ω</strong> while the DC voltage source remained fixed at <strong>12.0 V</strong>.
                  </p>
                  <div className="p-2 rounded-xl bg-black/5 dark:bg-black/30 font-mono text-[11px] text-[#FF7448] font-bold">
                    I = V / R = 12.0 V / 6.0 Ω = 2.00 A
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 08. YOUR PROGRESS / METRICS */}
        <section
          data-section-id="metrics"
          className={`rounded-[24px] border p-6 sm:p-10 card-nomu transition-all duration-700 ${
            visibleSections['metrics'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          } ${
            isDark ? 'bg-[#141B24] border-[#2A3644]' : 'bg-white border-[#E8E2DC]'
          }`}
        >
          <div className="text-center max-w-xl mx-auto space-y-1.5 mb-6">
            <p className="text-xs font-bold tracking-widest text-[#FF7448] uppercase font-mono">
              08 • PLATFORM METRICS
            </p>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Engineered for Mastery
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#FF7448] font-mono">8</span>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Interactive Labs</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#FF7448] font-mono">6</span>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Scientific Domains</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#22C55E] font-mono">100%</span>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Local Privacy</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#635BFF] font-mono">PDF</span>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Certified Reports</p>
            </div>
          </div>
        </section>

        {/* 09. CALL TO ACTION (CTA) */}
        <section
          data-section-id="cta"
          className={`rounded-[28px] sm:rounded-[36px] border p-8 sm:p-12 text-center space-y-5 card-nomu transition-all duration-700 ${
            visibleSections['cta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          } ${
            isDark
              ? 'bg-gradient-to-br from-[#141B24] to-[#1B232E] border-[#2A3644]'
              : 'bg-gradient-to-br from-[#FFF9F6] to-white border-[#E8E2DC] shadow-lg shadow-[#FF7448]/10'
          }`}
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to enter the LabVerse?
          </h2>
          <p className={`text-xs sm:text-sm max-w-lg mx-auto ${isDark ? 'text-slate-300' : 'text-[#4A5568]'}`}>
            Start experimenting immediately with authentic mathematical models and precision instruments.
          </p>
          <div className="pt-1">
            <button
              onClick={() => handleStart()}
              className="btn-pill-primary cursor-pointer"
            >
              <span>Start Exploring Labs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </main>

      {/* 10. CLEAN EDITORIAL FOOTER */}
      <footer className={`border-t py-8 px-4 sm:px-8 text-xs transition-colors ${
        isDark ? 'border-[#2A3644] bg-[#0D1219] text-slate-400' : 'border-[#E8E2DC] bg-[#FFF9F6] text-slate-600'
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
              onClick={() => handleStart()}
              className="hover:text-[#FF7448] transition-colors cursor-pointer"
            >
              Virtual Labs
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
