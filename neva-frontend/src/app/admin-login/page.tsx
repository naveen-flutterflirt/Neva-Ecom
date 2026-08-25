'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '../../lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res && res.token && res.user) {
        // Verify role is strictly admin
        if (res.user.role !== 'admin') {
          setErrorMsg('Access Denied: You do not have administrator permissions.');
          setLoading(false);
          return;
        }

        // Store tokens strictly in admin storage keys (does not affect active customer tabs)
        localStorage.setItem('neva-admin-token', res.token);
        localStorage.setItem('neva-admin-user', JSON.stringify(res.user));

        setSuccessMsg('Authorization granted! Redirecting to Admin Dashboard...');
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } else {
        setErrorMsg(res?.message || res?.error || 'Invalid administrator credentials.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMsg(err?.message || 'Failed to authorize administrator. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-50 text-zinc-900 overflow-y-auto">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.06),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-white shadow-[0_8px_20px_rgba(139,92,246,0.1)]">
            <Shield className="h-7 w-7 text-violet-600" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Neva <span className="bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">Admin</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Secure administrator authorization panel.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] backdrop-blur-xl space-y-5">

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2.5 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message Box */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4.5 w-4.5 text-zinc-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@NIVASHOP"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 hover:border-zinc-300 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Security Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4.5 w-4.5 text-zinc-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 hover:border-zinc-300 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authorizing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Access Dashboard <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
