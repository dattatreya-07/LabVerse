'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Cpu, User, Mail, Building, BookOpen, Save, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [institution, setInstitution] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [learningMode, setLearningMode] = useState('guided');
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
          router.push('/auth/login');
          return;
        }

        setEmail(user.email || '');

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setFullName(profileData.full_name || '');
          setUsername(profileData.username || '');
          setInstitution(profileData.institution || '');
          setBio(profileData.bio || '');
        }

        const { data: prefData } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (prefData) {
          setLearningMode(prefData.learning_mode || 'guided');
          setTheme(prefData.theme || 'dark');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMsg(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated user session');

      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          username,
          institution,
          bio,
          updated_at: new Date().toISOString(),
        });

      if (profileErr) throw profileErr;

      const { error: prefErr } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          learning_mode: learningMode,
          theme,
          updated_at: new Date().toISOString(),
        });

      if (prefErr) throw prefErr;

      setStatusMsg({ type: 'success', text: 'Profile and learning preferences saved successfully!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile changes.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <p className="text-xs font-mono text-slate-400">Loading Profile Settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <span className="font-bold text-sm text-slate-200">Researcher Profile</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div>
            <h1 className="text-xl font-bold text-slate-100 mb-1">Edit Researcher Profile</h1>
            <p className="text-xs text-slate-400">Manage your identity, academic affiliation, and laboratory learning preferences.</p>
          </div>

          {statusMsg && (
            <div className={`p-4 rounded-xl border text-xs flex items-center space-x-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border-rose-800 text-rose-300'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-slate-950/50 border border-slate-800/80 text-slate-500 rounded-xl py-2.5 px-3.5 text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Academic Institution / Organization</label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="e.g. Stanford University / National Science Foundation"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Research Bio / Focus</label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Briefly describe your STEM learning or research focus..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 mb-3">Default Learning Preferences</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Mode</label>
                  <select
                    value={learningMode}
                    onChange={e => setLearningMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="guided">Guided (Step-by-step instructions)</option>
                    <option value="practice">Practice (Unrestricted workspace)</option>
                    <option value="challenge">Challenge (Goal-oriented evaluation)</option>
                    <option value="exploration">Exploration (Sandbox research)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
