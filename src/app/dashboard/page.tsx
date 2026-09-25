'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Cpu, 
  Play, 
  Compass, 
  LineChart, 
  Bot, 
  UserCheck, 
  Award, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Atom, 
  Zap, 
  Activity, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ProfileData {
  full_name: string;
  username: string;
  avatar_url: string;
  role: string;
  institution: string;
}

interface ExperimentSessionRow {
  id: string;
  domain: string;
  experiment_id: string;
  experiment_name: string;
  status: string;
  updated_at: string;
  configuration: Record<string, unknown>;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recentSessions, setRecentSessions] = useState<ExperimentSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
          router.push('/auth/login');
          return;
        }

        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        } else {
          setProfile({
            full_name: user.user_metadata?.full_name || 'Student Researcher',
            username: user.email?.split('@')[0] || 'student',
            avatar_url: user.user_metadata?.avatar_url || '',
            role: 'student',
            institution: 'LabVerse Virtual Institute',
          });
        }

        // 2. Fetch Recent Experiment Sessions from Supabase Postgres
        const { data: sessionsData } = await supabase
          .from('experiment_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (sessionsData) {
          setRecentSessions(sessionsData);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-spin">
            <Cpu className="w-8 h-8" />
          </div>
          <p className="text-xs font-mono text-slate-400">Loading your LabVerse Research Workspace...</p>
        </div>
      </div>
    );
  }

  const latestSession = recentSessions[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              LabVerse Dashboard
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">{profile?.full_name || 'Profile'}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-slate-800 hover:border-rose-900 bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authenticated Supabase Workspace</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">{profile?.full_name}</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Track your experimental progress, resume active apparatus sessions, and consult your grounded AI tutor.
            </p>
          </div>

          <Link
            href="/?tab=lab"
            className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center space-x-2 shrink-0 z-10"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Enter Virtual Laboratory</span>
          </Link>
        </div>

        {/* Continue Learning Card */}
        {latestSession && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">CONTINUE LEARNING</span>
                <h3 className="text-lg font-bold text-slate-100">{latestSession.experiment_name}</h3>
                <p className="text-xs text-slate-400">Domain: {latestSession.domain} • Last updated {new Date(latestSession.updated_at).toLocaleTimeString()}</p>
              </div>
            </div>

            <Link
              href={`/?tab=lab&exp=${latestSession.experiment_id}`}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <span>Resume Session</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Learning Domains Matrix */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono tracking-widest text-cyan-400 uppercase">EXPLORE DOMAINS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link href="/?tab=catalog&domain=CHEMISTRY" className="p-6 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 transition-all group space-y-3">
              <Atom className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-slate-200 text-sm group-hover:text-emerald-300">Chemistry</h3>
              <p className="text-xs text-slate-400">Atoms, molecules & kinetic chemical reactions.</p>
            </Link>

            <Link href="/?tab=lab" className="p-6 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 transition-all group space-y-3">
              <Zap className="w-6 h-6 text-cyan-400" />
              <h3 className="font-bold text-slate-200 text-sm group-hover:text-cyan-300">Electronics</h3>
              <p className="text-xs text-slate-400">MNA numerical schematic solver & fault diagnosis.</p>
            </Link>

            <Link href="/?tab=catalog&domain=PHYSICS" className="p-6 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 transition-all group space-y-3">
              <Activity className="w-6 h-6 text-purple-400" />
              <h3 className="font-bold text-slate-200 text-sm group-hover:text-purple-300">Physics</h3>
              <p className="text-xs text-slate-400">Pendulum celestial gravity & quantum optics.</p>
            </Link>

            <Link href="/?tab=catalog&domain=FINANCE" className="p-6 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all group space-y-3">
              <TrendingUp className="w-6 h-6 text-amber-400" />
              <h3 className="font-bold text-slate-200 text-sm group-hover:text-amber-300">Finance Practice</h3>
              <p className="text-xs text-slate-400">Research analysis, portfolio risk & CA accounting.</p>
            </Link>
          </div>
        </div>

        {/* Recent Database Sessions */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono tracking-widest text-cyan-400 uppercase">RECENT DATABASE SESSIONS</h2>
          
          {recentSessions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 space-y-3">
              <p>No recorded cloud sessions found. Run your first experiment to sync progress to Supabase.</p>
              <Link href="/?tab=lab" className="inline-block px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">
                Launch First Experiment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              {recentSessions.map(sess => (
                <div key={sess.id} className="p-4 flex items-center justify-between hover:bg-slate-850 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-200">{sess.experiment_name}</h4>
                      <p className="text-[11px] text-slate-500">{sess.domain} • Saved {new Date(sess.updated_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <Link
                    href={`/?tab=lab&exp=${sess.experiment_id}`}
                    className="text-xs font-bold text-cyan-400 hover:underline"
                  >
                    Open Session
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
