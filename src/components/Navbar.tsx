import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { PageView, User } from '../types.ts';

interface NavbarProps {
  currentPage: PageView;
  user: User | null;
  onNavigate: (page: PageView) => void;
}

export function Navbar({ currentPage, user, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { page: PageView; label: string }[] = [
    { page: 'academy', label: 'Academy' },
    { page: 'ctf', label: 'CTF Arena' },
    { page: 'leaderboard', label: 'Leaderboard' },
    { page: 'events', label: 'Events' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ page: 'admin', label: 'Admin' });
  }

  function handleNav(page: PageView) {
    setMobileOpen(false);
    onNavigate(page);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#070B14]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav(user ? 'dashboard' : 'landing')}
          className="font-display text-lg font-bold tracking-tight text-slate-100 hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
        >
          CyberTech Society
        </button>

        {/* Zone 2: 4-5 Single-line Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const active = currentPage === item.page;
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => handleNav(item.page)}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  active
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-300 hover:text-slate-100 hover:border-slate-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav(user ? 'dashboard' : 'auth')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            {user ? 'Dashboard' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0A101D] px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => handleNav(item.page)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.page
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNav(user ? 'dashboard' : 'auth')}
            className="w-full mt-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors"
          >
            {user ? 'Go to Dashboard' : 'Sign In / Register'}
          </button>
        </div>
      )}
    </header>
  );
}
