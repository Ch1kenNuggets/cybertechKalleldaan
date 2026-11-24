import React, { useEffect, useState } from 'react';
import { apiFetch, setAuthToken } from './api.ts';
import type { AcademyModule, Announcement, CtfEvent, PageView, User } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthPage } from './components/AuthPage.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AcademyView } from './components/AcademyView.tsx';
import { CtfArenaView } from './components/CtfArenaView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { EventsAnnouncementsView } from './components/EventsAnnouncementsView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { AdminPanelView } from './components/AdminPanelView.tsx';

interface OverviewResponse {
  modules: AcademyModule[];
  announcements: Announcement[];
  events: CtfEvent[];
  counts: { totalLessons: number; totalChallenges: number; totalStudents: number };
}

export default function App() {
  const [page, setPage] = useState<PageView>('landing');
  const [selectedLessonSlug, setSelectedLessonSlug] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hasAdmin, setHasAdmin] = useState(true);
  const [adminPasscodeConfigured, setAdminPasscodeConfigured] = useState(false);
  const [overview, setOverview] = useState<OverviewResponse>({
    modules: [],
    announcements: [],
    events: [],
    counts: { totalLessons: 44, totalChallenges: 18, totalStudents: 0 },
  });

  async function refreshOverview() {
    try {
      const [statusRes, ovRes] = await Promise.all([
        apiFetch<{ authenticated: boolean; user: User | null; hasAdmin: boolean; adminPasscodeConfigured: boolean }>(
          '/api/auth/status'
        ),
        apiFetch<OverviewResponse>('/api/overview'),
      ]);
      setHasAdmin(statusRes.hasAdmin);
      setAdminPasscodeConfigured(statusRes.adminPasscodeConfigured);
      if (statusRes.authenticated && statusRes.user) {
        setUser(statusRes.user);
      }
      setOverview(ovRes);
    } catch {
      // Ignore transient initial load errors
    }
  }

  useEffect(() => {
    void refreshOverview();
  }, []);

  function navigateTo(target: PageView, lessonSlug?: string) {
    const protectedPages: PageView[] = ['dashboard', 'academy', 'ctf', 'profile', 'admin'];
    if (protectedPages.includes(target) && !user) {
      setPage('auth');
      return;
    }
    if (target === 'admin' && user?.role !== 'admin') {
      setPage('dashboard');
      return;
    }
    setSelectedLessonSlug(lessonSlug ?? null);
    setPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLogout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthToken(null);
    setUser(null);
    setPage('landing');
  }

  async function refreshCurrentUser(newTotalPoints?: number) {
    if (typeof newTotalPoints === 'number' && user) {
      setUser({ ...user, total_points: newTotalPoints });
      return;
    }
    try {
      const res = await apiFetch<{ user: User }>('/api/auth/me');
      setUser(res.user);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100">
      <Navbar currentPage={page} user={user} onNavigate={(p) => navigateTo(p)} />

      <main className="flex-1">
        {page === 'landing' && (
          <LandingPage
            user={user}
            modules={overview.modules}
            announcements={overview.announcements}
            events={overview.events}
            counts={overview.counts}
            onNavigate={(p) => navigateTo(p)}
          />
        )}

        {page === 'auth' && (
          <AuthPage
            hasAdmin={hasAdmin}
            adminPasscodeConfigured={adminPasscodeConfigured}
            onSuccess={(loggedInUser) => {
              setUser(loggedInUser);
              setHasAdmin(loggedInUser.role === 'admin' ? true : hasAdmin);
              setPage(loggedInUser.role === 'admin' ? 'admin' : 'dashboard');
            }}
          />
        )}

        {page === 'dashboard' && user && (
          <Dashboard
            user={user}
            onNavigate={(p, slug) => navigateTo(p, slug)}
            onLogout={() => void handleLogout()}
          />
        )}

        {page === 'academy' && user && (
          <AcademyView
            initialLessonSlug={selectedLessonSlug}
            onLessonCompleted={() => void refreshCurrentUser()}
          />
        )}

        {page === 'ctf' && user && (
          <CtfArenaView onPointsUpdated={(pts) => void refreshCurrentUser(pts)} />
        )}

        {page === 'leaderboard' && <LeaderboardView currentUser={user} />}

        {page === 'events' && (
          <EventsAnnouncementsView user={user} onNavigate={(p) => navigateTo(p)} />
        )}

        {page === 'profile' && user && (
          <ProfileView user={user} onUserUpdated={(u) => setUser(u)} />
        )}

        {page === 'admin' && user?.role === 'admin' && <AdminPanelView />}
      </main>

      <footer className="border-t border-slate-800/90 bg-[#060911] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>CyberTech Society – BCCI · CyberTech Academy · Learn. Explore. Secure. Compete.</p>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => navigateTo('landing')} className="hover:text-slate-200">
              Home
            </button>
            <button type="button" onClick={() => navigateTo('leaderboard')} className="hover:text-slate-200">
              Leaderboard
            </button>
            <button type="button" onClick={() => navigateTo('events')} className="hover:text-slate-200">
              Events & Resources
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
