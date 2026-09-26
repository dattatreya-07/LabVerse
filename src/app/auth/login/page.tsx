'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Cpu, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Sparkles, Check, UserCheck, Play } from 'lucide-react';

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
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        setErrorMsg('Google OAuth is not enabled in this Supabase instance. Please use 1-Click Guest Mode or Email.');
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      setErrorMsg('Google OAuth provider is not configured. Please continue as Guest or use Email & Password.');
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    router.push('/?tab=lab');
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
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again or continue as Guest.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F6] text-[#0F151D] flex flex-col justify-center items-center px-4 py-8 sm:py-12 font-sans selection:bg-[#FF7448] selection:text-white">
      
      {/* Centered Main Editorial Card */}
      <div className="w-full max-w-4xl bg-white border border-[#E8E2DC] rounded-[28px] sm:rounded-[36px] shadow-2xl shadow-[#FF7448]/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 card-nomu">
        
        {/* Left Form Column */}
        <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            {/* Brand Header */}
            <Link href="/" className="inline-flex items-center space-x-2.5 group mb-6">
              <div className="w-8 h-8 rounded-full bg-[#FF7448] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight font-mono">
                LABVERSE
              </span>
            </Link>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Continue your journey.
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Access your scientific simulations, certified reports, and AI tutor.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Social Auth & Quick Guest Mode */}
          <div className="space-y-3">
            {/* 1-Click Instant Guest Access */}
            <button
              onClick={handleGuestLogin}
              className="w-full py-3 px-5 rounded-full bg-[#FF7448] hover:bg-[#FF6A35] text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-[#FF7448]/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>1-Click Instant Guest Access (No Setup) →</span>
            </button>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-5 rounded-full border border-[#E8E2DC] hover:bg-[#FFF9F6] text-xs font-bold transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-grow border-t border-[#E8E2DC]" />
              <span className="px-3 text-[10px] font-mono uppercase text-slate-400 font-semibold">
                or sign in with email
              </span>
              <div className="flex-grow border-t border-[#E8E2DC]" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-4 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@labverse.org"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFF9F6] border border-[#E8E2DC] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7448]/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-4 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFF9F6] border border-[#E8E2DC] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7448]/30 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-full border border-[#0F151D] hover:bg-[#0F151D] hover:text-white text-[#0F151D] text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                <span>{loading ? 'Authenticating...' : 'Sign in with Password →'}</span>
              </button>
            </form>
          </div>

          {/* Sign up link */}
          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="text-[#FF7448] font-bold hover:underline">
              Create one here
            </Link>
          </div>
        </div>

        {/* Right Feature Showcase (Dark Surface) */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#0F151D] p-10 text-white flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FF7448]/10 border border-[#FF7448]/20 text-[#FF7448] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scientific Discovery</span>
            </div>

            <h3 className="text-xl font-extrabold tracking-tight leading-snug">
              Authentic simulation platforms designed for mastery.
            </h3>

            <div className="space-y-2.5 pt-1 text-xs font-medium text-slate-300">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#FF7448]/20 text-[#FF7448] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Three.js interactive 3D apparatus models</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#FF7448]/20 text-[#FF7448] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Deterministic physical circuit & physics solvers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#FF7448]/20 text-[#FF7448] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Groq LLaMA 3.3 live Socratic AI tutor</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#FF7448]/20 text-[#FF7448] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Cryptographically certified PDF reports</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141B24] border border-[#2A3644] text-[11px] text-slate-400 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#FF7448] shrink-0" />
            <span>Zero-tracking telemetry. 100% encrypted in your local device session.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
