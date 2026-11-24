import React, { useState } from 'react';
import { ShieldCheck, Lock, UserPlus, AlertCircle } from 'lucide-react';
import { apiFetch, setAuthToken } from '../api.ts';
import type { User } from '../types.ts';

interface AuthPageProps {
  hasAdmin: boolean;
  adminPasscodeConfigured: boolean;
  onSuccess: (user: User) => void;
}

type AuthTab = 'login' | 'register' | 'admin-setup';

export function AuthPage({ hasAdmin, adminPasscodeConfigured, onSuccess }: AuthPageProps) {
  const [tab, setTab] = useState<AuthTab>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register / Admin Claim state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [yearLevel, setYearLevel] = useState('1st Year BSIT');
  const [passcode, setPasscode] = useState('');

  const showAdminClaimTab = !hasAdmin || adminPasscodeConfigured;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password: loginPassword }),
      });
      setAuthToken(res.token);
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, username, email, password, studentId, yearLevel }),
      });
      setAuthToken(res.token);
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminClaim(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/claim-admin', {
        method: 'POST',
        body: JSON.stringify({ fullName, username, email, password, passcode }),
      });
      setAuthToken(res.token);
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Administrator setup failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-sky-400">CyberTech Academy · BCCI Member Access</p>
          <h1 className="font-display text-2xl font-bold text-slate-50">
            {tab === 'login'
              ? 'Sign in to your account'
              : tab === 'register'
                ? 'Register a student account'
                : 'Initialize Administrator Account'}
          </h1>
          <p className="text-sm text-slate-400">
            Authenticated members gain access to all 7 academy tracks, hands-on terminal labs, and the CTF arena.
          </p>
        </div>

        {/* Segmented Auth Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#070B14] border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              tab === 'login' ? 'bg-[#141D33] text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              tab === 'register' ? 'bg-[#141D33] text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Student Register
          </button>
          {showAdminClaimTab && (
            <button
              type="button"
              onClick={() => {
                setTab('admin-setup');
                setError('');
              }}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                tab === 'admin-setup' ? 'bg-[#141D33] text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {hasAdmin ? 'Admin Access' : 'First-Run Admin'}
            </button>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-lg border border-red-500/40 bg-red-500/10 text-sm text-red-200"
          >
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-medium text-slate-300 mb-1.5">
                Username or Email
              </label>
              <input
                id="login-identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="j.santos or j.santos@bcci.edu"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-400 text-slate-950 text-sm font-semibold hover:bg-emerald-300 disabled:opacity-50 transition-colors"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label htmlFor="reg-username" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username
                </label>
                <input
                  id="reg-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="jdelacruz"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@bcci.edu.ph"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-sid" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Student ID (Optional)
                </label>
                <input
                  id="reg-sid"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="2026-0142"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label htmlFor="reg-year" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Program & Year
                </label>
                <select
                  id="reg-year"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
                >
                  <option>1st Year BSIT</option>
                  <option>2nd Year BSIT</option>
                  <option>3rd Year BSIT</option>
                  <option>4th Year BSIT</option>
                  <option>BS Computer Science</option>
                  <option>SHS ICT Track</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password (min. 8 characters)
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong passphrase"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-400 text-slate-950 text-sm font-semibold hover:bg-emerald-300 disabled:opacity-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <span>{loading ? 'Creating account...' : 'Create Student Account'}</span>
            </button>
          </form>
        )}

        {tab === 'admin-setup' && showAdminClaimTab && (
          <form onSubmit={handleAdminClaim} className="space-y-4">
            <div className="p-3.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-xs text-sky-200 leading-relaxed">
              {hasAdmin
                ? 'Administrator passcode verification is active. Enter your configured ADMIN_PASSCODE to register an officer account.'
                : 'No administrator account exists yet. Complete this one-time setup form to claim the initial CyberTech Society officer account. Once claimed, this setup locks automatically.'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adm-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Officer Name
                </label>
                <input
                  id="adm-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="CyberTech Officer"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 focus:outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label htmlFor="adm-username" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Admin Username
                </label>
                <input
                  id="adm-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adm-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Officer Email
              </label>
              <input
                id="adm-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@bcci.edu.ph"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label htmlFor="adm-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Password (min. 8 characters)
              </label>
              <input
                id="adm-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong administrator password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 focus:outline-none focus:border-sky-400"
              />
            </div>

            {adminPasscodeConfigured && (
              <div>
                <label htmlFor="adm-passcode" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Server Admin Passcode
                </label>
                <input
                  id="adm-passcode"
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter ADMIN_PASSCODE"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 focus:outline-none focus:border-sky-400"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-400 text-slate-950 text-sm font-semibold hover:bg-sky-300 disabled:opacity-50 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>{loading ? 'Provisioning...' : 'Claim Administrator Account'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
