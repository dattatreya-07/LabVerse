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
  Play
} from 'lucide-react';
import { KnowledgeCore } from './KnowledgeCore';

interface LandingPageProps {
  isAuthenticated: boolean;
  userDisplayName?: string;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  isAuthenticated, 
  userDisplayName,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [hoverDomain, setHoverDomain] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const domains = [
    {
      id: 'CHEMISTRY',
      title: 'Chemistry Labs',
      subtitle: 'Atoms → Molecules → Reactions → Virtual Labs',
      icon: <Atom className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
      color: isDark 
        ? 'from-emerald-500/20 to-emerald-950/40 border-emerald-500/40 hover:border-emerald-400' 
        : 'from-emerald-50 to-teal-50/60 border-emerald-300 hover:border-emerald-500 shadow-sm',
      badgeColor: isDark 
        ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
        : 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Investigate atomic configurations, molecular structures, and chemical reaction kinetic equations safely.',
      path: '/?tab=catalog&domain=CHEMISTRY',
    },
    {
      id: 'ELECTRONICS',
      title: 'Electronics Labs',
      subtitle: 'Components → Circuits → Signals → Diagnostics',
      icon: <Zap className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
      color: isDark 
        ? 'from-cyan-500/20 to-cyan-950/40 border-cyan-500/40 hover:border-cyan-400' 
        : 'from-sky-50 to-cyan-50/60 border-cyan-300 hover:border-cyan-500 shadow-sm',
      badgeColor: isDark 
        ? 'bg-cyan-950 text-cyan-400 border-cyan-800' 
        : 'bg-cyan-100 text-cyan-800 border-cyan-300',
      description: 'Build interactive schematics using MNA numerical analysis solvers for Ohm\'s law, series/parallel networks, and ammeter calibration faults.',
      path: '/?tab=lab',
    },
    {
      id: 'PHYSICS',
      title: 'Physics Labs',
      subtitle: 'Motion → Forces → Quantum → Planetary Orbit',
      icon: <Activity className="w-6 h-6 text-purple-500 dark:text-purple-400" />,
      color: isDark 
        ? 'from-purple-500/20 to-purple-950/40 border-purple-500/40 hover:border-purple-400' 
        : 'from-purple-50 to-indigo-50/60 border-purple-300 hover:border-purple-500 shadow-sm',
      badgeColor: isDark 
        ? 'bg-purple-950 text-purple-400 border-purple-800' 
        : 'bg-purple-100 text-purple-800 border-purple-300',
      description: 'Simulate simple pendulum gravity across Earth, Moon, and Mars, as well as Planck\'s photoelectric photon interactions.',
      path: '/?tab=catalog&domain=PHYSICS',
    },
    {
      id: 'FINANCE',
      title: 'Finance & Practice',
      subtitle: 'Research → Portfolio → Accounting → Compliance',
      icon: <TrendingUp className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
      color: isDark 
        ? 'from-amber-500/20 to-amber-950/40 border-amber-500/40 hover:border-amber-400' 
        : 'from-amber-50 to-orange-50/60 border-amber-300 hover:border-amber-500 shadow-sm',
      badgeColor: isDark 
        ? 'bg-amber-950 text-amber-400 border-amber-800' 
        : 'bg-amber-100 text-amber-800 border-amber-300',
      description: 'Analyze financial balance sheets, manage virtual risk portfolios, post ledgers, and evaluate regulatory compliance scenarios.',
      path: '/?tab=catalog&domain=FINANCE',
    },
  ];

  return (
    <div className={`min-h-screen font-sans selection:bg-cyan-500 selection:text-slate-950 transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. TOP GLOBAL NAVIGATION BAR */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        isDark ? 'bg-slate-950/85 border-slate-800/80 text-slate-100' : 'bg-white/85 border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
              isDark 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                : 'bg-cyan-50 border-cyan-300 text-cyan-600 shadow-sm'
            }`}>
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400">
              LabVerse
            </span>
          </Link>

          <div className={`hidden md:flex items-center space-x-6 text-xs font-semibold ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            <a href="#domains" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Domains</a>
            <a href="#advanced" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Advanced Labs</a>
            <a href="#finance" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Finance Practice</a>
            <a href="#tutor" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">AI Science Tutor</a>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-300'
                }`}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className={`text-xs hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Welcome, <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{userDisplayName || 'Researcher'}</strong>
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
                >
                  Open Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/auth/login"
                  className={`px-3.5 py-1.5 rounded-xl border font-semibold text-xs transition-all ${
                    isDark 
                      ? 'border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white bg-slate-900/60' 
                      : 'border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 bg-white shadow-sm'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION WITH 3D KNOWLEDGE CORE */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="space-y-6 text-left">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono border ${
              isDark 
                ? 'bg-cyan-950/80 border-cyan-800 text-cyan-400' 
                : 'bg-cyan-50 border-cyan-300 text-cyan-700'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Experiential Science & Simulation Universe</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              ENTER THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400">
                LABVERSE
              </span>
            </h1>

            <p className={`text-base sm:text-lg max-w-xl leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Learn by doing. Explore interactive science experiments, schematic engineering systems, and professional real-world simulation scenarios with real deterministic physics engines.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Continue Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/auth/signup"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center space-x-2"
                >
                  <span>Start Exploring</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                href="/?tab=catalog"
                className={`px-6 py-3.5 rounded-2xl border font-bold text-sm transition-all flex items-center space-x-2 ${
                  isDark 
                    ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-200' 
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
                }`}
              >
                <Compass className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>Explore Labs</span>
              </Link>
            </div>
          </div>

          {/* 3D Knowledge Core Interactive Viewport */}
          <div className={`h-[420px] w-full rounded-3xl p-4 shadow-2xl relative border transition-all ${
            isDark 
              ? 'bg-slate-900/40 border-slate-800/80 shadow-cyan-950/20' 
              : 'bg-gradient-to-br from-white to-sky-50/50 border-slate-200 shadow-slate-200/80'
          }`}>
            <KnowledgeCore hoverDomain={hoverDomain} />
            <div className={`absolute bottom-4 left-4 right-4 backdrop-blur-md rounded-xl p-3 text-center text-xs flex items-center justify-between border ${
              isDark 
                ? 'bg-slate-950/80 border-slate-800 text-slate-400' 
                : 'bg-white/90 border-slate-200 text-slate-600 shadow-sm'
            }`}>
              <span>Hover or click domain nodes to inspect core physics models</span>
              <span className="font-mono text-cyan-500 dark:text-cyan-400 text-[10px] font-bold">WebGL 3D Active</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. WHY LABVERSE */}
      <section className={`py-16 border-y transition-colors ${
        isDark ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-100/70 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-mono tracking-widest text-cyan-600 dark:text-cyan-400 uppercase mb-3 font-bold">THE LABVERSE PRINCIPLE</h2>
          <p className={`text-2xl sm:text-3xl font-bold max-w-2xl mx-auto mb-12 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            Move beyond passive content into interactive experimentation and professional scenarios.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            {['Learn', 'Build', 'Experiment', 'Analyze', 'Decide'].map((step, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
                isDark 
                  ? 'bg-slate-900/60 border-slate-800/80' 
                  : 'bg-white border-slate-200 shadow-sm hover:border-cyan-300'
              }`}>
                <span className="inline-block text-2xl font-black text-cyan-500 dark:text-cyan-400">{idx + 1}</span>
                <h3 className={`font-bold text-base ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{step}</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Deterministic solver engines backed by physical equations.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DOMAINS SECTION */}
      <section id="domains" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono tracking-widest text-cyan-600 dark:text-cyan-400 uppercase mb-3 font-bold">KNOWLEDGE DOMAINS</h2>
            <h3 className={`text-3xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Four Interconnected Learning Fields</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {domains.map((dom) => (
              <div
                key={dom.id}
                onMouseEnter={() => setHoverDomain(dom.id)}
                onMouseLeave={() => setHoverDomain(null)}
                className={`p-8 rounded-3xl bg-gradient-to-br ${dom.color} border transition-all duration-300 relative group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl border ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      {dom.icon}
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase ${dom.badgeColor}`}>
                      {dom.id}
                    </span>
                  </div>

                  <h4 className={`text-xl font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{dom.title}</h4>
                  <p className={`text-xs font-mono mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{dom.subtitle}</p>
                  <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{dom.description}</p>
                </div>

                <Link
                  href={dom.path}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors"
                >
                  <span>Launch Domain Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ADVANCED & HAZARDOUS EXPERIMENTS */}
      <section id="advanced" className={`py-20 border-y transition-colors ${
        isDark ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-100/70 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono tracking-widest text-cyan-600 dark:text-cyan-400 uppercase mb-3 font-bold">RARE & HAZARDOUS EXPERIMENTS</h2>
            <h3 className={`text-3xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Simulate Experiments That Are Impossible or Hazardous in Physical Classrooms</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border space-y-3 transition-all ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isDark ? 'bg-purple-950 text-purple-400 border-purple-800' : 'bg-purple-100 text-purple-800 border-purple-300'
              }`}>QUANTUM OPTICS</span>
              <h4 className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Photoelectric Effect & Planck Constant</h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Vary photon wavelengths across Potassium and Copper surfaces to calculate stopping potential and Planck constant.</p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 transition-all ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isDark ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>NUCLEAR PHYSICS</span>
              <h4 className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Rutherford Gold Foil Scattering</h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Observe alpha particle Coulomb deflection trajectories against heavy gold nuclei to deduce nuclear radius.</p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 transition-all ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isDark ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>BIOTECHNOLOGY</span>
              <h4 className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>DNA Gel Electrophoresis</h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Model DNA restriction fragment migration velocities through an agarose gel matrix under electric fields.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AI SCIENCE TUTOR */}
      <section id="tutor" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono border ${
              isDark ? 'bg-indigo-950/80 border-indigo-800 text-indigo-400' : 'bg-indigo-50 border-indigo-300 text-indigo-700'
            }`}>
              <Bot className="w-3.5 h-3.5" />
              <span>Grounded AI Tutor Architecture</span>
            </div>
            <h3 className={`text-3xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>AI Tutoring Grounded Strictly in Physical Equations</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              The LabVerse AI Science Tutor never fabricates measurements or invents experimental outputs. Every response is grounded in actual numerical readings from your live workspace state and reviewed scientific literature.
            </p>
            <ul className={`space-y-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                <span>Diagnoses hardware circuit faults (open circuits, calibration drifts).</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                <span>Provides step-by-step mathematical derivations with citation provenance.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                <span>Automatic PII scrubbing ensures zero personal student data is transmitted.</span>
              </li>
            </ul>
          </div>

          <div className={`p-6 rounded-3xl border space-y-4 shadow-xl transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/70'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AI Tutor Live Guidance</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isDark ? 'text-emerald-400 bg-emerald-950 border-emerald-800' : 'text-emerald-800 bg-emerald-100 border-emerald-300'
              }`}>Grounded Citation</span>
            </div>

            <div className={`p-3.5 rounded-xl text-xs leading-relaxed space-y-2 font-mono border ${
              isDark ? 'bg-slate-950 text-slate-300 border-slate-850' : 'bg-slate-50 text-slate-800 border-slate-200'
            }`}>
              <p className="text-cyan-600 dark:text-cyan-400 font-bold">Query: &quot;Why does the ammeter display 0.00 A when voltage is 6 V?&quot;</p>
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>Analysis: Your circuit has an Open Circuit Discontinuity. Theoretical current is 0.30 A ($I = V/R$), but air resistance forces charge flow to zero.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className={`border-t py-8 text-xs transition-colors ${
        isDark ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>LabVerse Experiential Platform • Powered by Next.js & Supabase</span>
          <div className="flex items-center space-x-6">
            <Link href="/auth/login" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Create Account</Link>
            <Link href="/?tab=lab" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Guest Mode</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
