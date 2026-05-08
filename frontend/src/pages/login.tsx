import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('imdadkhanr9@gmail.com');
  const [password, setPassword] = useState('password123');
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect once user is set in the shared Zustand store
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
      // Redirect is handled by the useEffect above when user state updates
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillAdmin = () => {
    setEmail('imdadkhanr9@gmail.com');
    setPassword('password123');
    setLocalError(null);
  };

  const fillMember = () => {
    setEmail('alice@acme.com');
    setPassword('password123');
    setLocalError(null);
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Login — BX-TRACK CRM</title>
        <meta name="description" content="Sign in to BX-TRACK Multi-Tenant CRM" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-900 flex items-center justify-center p-4">
        {/* Glow orb */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/40">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">BX-TRACK</h1>
            <p className="text-indigo-300 mt-1 text-sm">Multi-Tenant CRM System</p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

            {/* Error */}
            {(error || localError) && (
              <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-300 text-sm">{localError || error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo-200 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-indigo-200 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                id="login-button"
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">Demo Credentials</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={fillAdmin}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition group"
                >
                  <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300">Admin</span>
                  <span className="text-xs text-white/50 ml-2">imdadkhanr9@gmail.com / password123</span>
                </button>
                <button
                  type="button"
                  onClick={fillMember}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition group"
                >
                  <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300">Member</span>
                  <span className="text-xs text-white/50 ml-2">alice@acme.com / password123</span>
                </button>
              </div>
              <p className="text-xs text-white/30 mt-2">Click a row to auto-fill credentials</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
