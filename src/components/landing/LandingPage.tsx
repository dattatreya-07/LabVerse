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
  FileText, 
  Database,
  BarChart3,
  Layers,
  Award
} from 'lucide-react';
import { KnowledgeCore } from './KnowledgeCore';

interface LandingPageProps {
  isAuthenticated: boolean;
  userDisplayName?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ isAuthenticated, userDisplayName }) => {
  const [hoverDomain, setHoverDomain] = useState<string | null>(null);

  const domains = [
    {
      id: 'CHEMISTRY',
      title: 'Chemistry Labs',
      subtitle: 'Atoms → Molecules → Reactions → Virtual Labs',
      icon: <Atom className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-950/40 border-emerald-500/40 hover:border-emerald-400',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800',
      description: 'Investigate atomic configurations, molecular structures, and chemical reaction kinetic equations safely.',
      path: '/?tab=catalog&domain=CHEMISTRY',
    },
    {
      id: 'ELECTRONICS',
      title: 'Electronics Labs',
      subtitle: 'Components → Circuits → Signals → Diagnostics',
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-500/20 to-cyan-950/40 border-cyan-500/40 hover:border-cyan-400',
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-800',
      description: 'Build interactive schematics using MNA numerical analysis solvers for Ohm\'s law, series/parallel networks, and ammeter calibration faults.',
      path: '/?tab=lab',
    },
    {
      id: 'PHYSICS',
      title: 'Physics Labs',
      subtitle: 'Motion → Forces → Quantum → Planetary Orbit',
      icon: <Activity className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-500/20 to-purple-950/40 border-purple-500/40 hover:border-purple-400',
      badgeColor: 'bg-purple-950 text-purple-400 border-purple-800',
      description: 'Simulate simple pendulum gravity across Earth, Moon, and Mars, as well as Planck\'s photoelectric photon interactions.',
      path: '/?tab=catalog&domain=PHYSICS',
    },
    {
      id: 'FINANCE',
      title: 'Finance & Practice',
      subtitle: 'Research → Portfolio → Accounting → Compliance',
      icon: <TrendingUp className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-500/20 to-amber-950/40 border-amber-500/40 hover:border-amber-400',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-800',
      description: 'Analyze financial balance sheets, manage virtual risk portfolios, post ledgers, and evaluate regulatory compliance scenarios.',
      path: '/?tab=catalog&domain=FINANCE',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 1. TOP GLOBAL NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              LabVerse
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            <a href="#domains" className="hover:text-cyan-400 transition-colors">Domains</a>
            <a href="#advanced" className="hover:text-cyan-400 transition-colors">Advanced Labs</a>
            <a href="#finance" className="hover:text-cyan-400 transition-colors">Finance Practice</a>
            <a href="#tutor" className="hover:text-cyan-400 transition-colors">AI Science Tutor</a>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400 hidden sm:inline">Welcome, <strong className="text-slate-200">{userDisplayName || 'Researcher'}</strong></span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
                >
                  Open Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-xs transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Digital Learning Universe</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
              ENTER THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                LABVERSE
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Learn by doing. Explore interactive science experiments, schematic engineering systems, and professional real-world finance simulations in one immersive platform.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center space-x-2"
                >
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
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center space-x-2"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Explore Labs</span>
              </Link>
            </div>
          </div>

          {/* 3D Knowledge Core Interactive Viewport */}
          <div className="h-[420px] w-full bg-slate-900/40 border border-slate-800/80 rounded-3xl p-4 shadow-2xl relative">
            <KnowledgeCore hoverDomain={hoverDomain} />
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-center text-xs text-slate-400 flex items-center justify-between">
              <span>Hover or click domain nodes to inspect core physics models</span>
              <span className="font-mono text-cyan-400 text-[10px]">WebGL 3D Active</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. WHY LABVERSE */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase mb-3">THE LABVERSE PRINCIPLE</h2>
          <p className="text-3xl font-bold text-slate-100 max-w-2xl mx-auto mb-12">
            Move beyond passive content into interactive experimentation and professional scenarios.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['Learn', 'Build', 'Experiment', 'Analyze', 'Decide'].map((step, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-2">
                <span className="inline-block text-2xl font-black text-cyan-400">{idx + 1}</span>
                <h3 className="font-bold text-slate-200 text-base">{step}</h3>
                <p className="text-xs text-slate-400">Deterministic solver engines backed by scientific equations.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DOMAINS SECTION */}
      <section id="domains" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase mb-3">KNOWLEDGE DOMAINS</h2>
            <h3 className="text-3xl font-extrabold text-slate-100">Four Interconnected Learning Fields</h3>
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
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      {dom.icon}
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase ${dom.badgeColor}`}>
                      {dom.id}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-slate-100 mb-1">{dom.title}</h4>
                  <p className="text-xs font-mono text-slate-400 mb-3">{dom.subtitle}</p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">{dom.description}</p>
                </div>

                <Link
                  href={dom.path}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors"
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
      <section id="advanced" className="py-20 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase mb-3">RARE & HAZARDOUS EXPERIMENTS</h2>
            <h3 className="text-3xl font-extrabold text-slate-100">Simulate Experiments That Are Impossible or Hazardous in Physical Classrooms</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">QUANTUM OPTICS</span>
              <h4 className="font-bold text-slate-200">Photoelectric Effect & Planck Constant</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Vary photon wavelengths ($\lambda$) across Potassium and Copper surfaces to calculate stopping potential ($V_s$) and Planck constant ($h$).</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">NUCLEAR PHYSICS</span>
              <h4 className="font-bold text-slate-200">Rutherford Gold Foil Scattering</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Observe alpha particle Coulomb deflection trajectories ($\theta = 2\\cot^{-1}(b/b_0)$) against heavy gold nuclei.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">BIOTECHNOLOGY</span>
              <h4 className="font-bold text-slate-200">DNA Gel Electrophoresis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Model DNA restriction fragment migration velocities through an agarose gel matrix under electric fields.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AI SCIENCE TUTOR */}
      <section id="tutor" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-400 text-xs font-mono">
              <Bot className="w-3.5 h-3.5" />
              <span>Grounded AI Tutor Architecture</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-100">AI Tutoring Grounded strictly in Real Physical Equations</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              The LabVerse AI Science Tutor never fabricates measurements or invents experimental outputs. Every response is grounded in actual numerical readings from your live workspace state and reviewed scientific literature.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Diagnoses hardware circuit faults (open circuits, calibration drifts).</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Provides step-by-step mathematical derivations with citation provenance.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Automatic PII scrubbing ensures zero personal student data is transmitted.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm text-slate-200">AI Tutor Live Guidance</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Grounded Citation</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 text-xs text-slate-300 leading-relaxed space-y-2 font-mono">
              <p className="text-cyan-400 font-bold">Query: &quot;Why does the ammeter display 0.00 A when voltage is 6 V?&quot;</p>
              <p className="text-slate-300">Analysis: Your circuit has an Open Circuit Discontinuity. Theoretical current is 0.30 A ($I = V/R$), but air resistance ($R \approx \infty$) forces charge flow to zero.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>LabVerse Experiential Platform • Powered by Next.js & Supabase</span>
          <div className="flex items-center space-x-6 text-slate-400">
            <Link href="/auth/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-cyan-400 transition-colors">Create Account</Link>
            <Link href="/?tab=lab" className="hover:text-cyan-400 transition-colors">Guest Mode</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
