'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Cpu, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Sparkles, Check } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider')) {
        setErrorMsg('Google OAuth is not enabled on this Supabase project. Please sign in with Email & Password or continue as Guest.');
      } else {
        setErrorMsg(msg);
      }
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/?tab=lab');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F6] text-[#0F151D] flex flex-col justify-center items-center px-4 py-8 sm:py-12 font-sans selection:bg-[#FF7448] selection:text-white">
      
      {/* Centered Main Editorial Card */}
      <div className="w-full max-w-4xl bg-white border border-[#F0E6E1] rounded-[36px] sm:rounded-[48px] shadow-2xl shadow-[#FF7448]/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
          <div>
            {/* Brand Header */}
            <Link href="/" className="inline-flex items-center space-x-2.5 group mb-8">
              <div className="w-8 h-8 rounded-full bg-[#FF7448] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight font-mono">
                LABVERSE
              </span>
            </Link>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Continue your journey.
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Access your scientific simulations, certified reports, and AI tutor.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Social Auth */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-full border border-[#F0E6E1] hover:bg-[#FFF9F6] text-xs font-bold transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-[#F0E6E1]" />
              <span className="px-3 text-[11px] font-mono uppercase text-slate-400 font-semibold">
                or with email
              </span>
              <div className="flex-grow border-t border-[#F0E6E1]" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@labverse.org"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FFF9F6] border border-[#F0E6E1] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7448]/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FFF9F6] border border-[#F0E6E1] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7448]/30 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#FF7448] hover:bg-[#FF8D69] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign in →'}</span>
              </button>
            </form>
          </div>

          {/* Guest Link */}
          <div className="pt-2 text-center">
            <Link
              href="/?tab=lab"
              className="text-xs font-semibold text-slate-500 hover:text-[#FF7448] transition-colors"
            >
              Continue as Guest (Offline Local Storage) →
            </Link>
          </div>
        </div>

        {/* Right Feature Showcase (Dark Surface) */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#141B24] p-12 text-white flex-col justify-between space-y-8 relative overflow-hidden">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FF7448]/10 border border-[#FF7448]/20 text-[#FF7448] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scientific Discovery</span>
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight leading-snug">
              Authentic simulation platforms designed for mastery.
            </h3>

            <div className="space-y-3 pt-2 text-xs font-medium text-slate-300">
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#FF7448]/20 text-[#FF7448] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Three.js interactive 3D apparatus models</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#FF7448]/20 text-[#FF7448] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Deterministic physical circuit & physics solvers</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#FF7448]/20 text-[#FF7448] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Groq LLaMA 3.3 live Socratic AI tutor</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#FF7448]/20 text-[#FF7448] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Cryptographically certified PDF reports</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1B232E] border border-[#2A3644] text-[11px] text-slate-400 flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-[#FF7448] shrink-0" />
            <span>Zero-tracking telemetry. 100% encrypted in your local device session.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
