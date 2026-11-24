import React, { useEffect, useState } from 'react';
import { BookOpen, Flag, Trophy, Award, User as UserIcon, LogOut, ArrowRight } from 'lucide-react';
import { apiFetch } from '../api.ts';
import type { DashboardPayload, PageView, User } from '../types.ts';

interface DashboardProps {
  user: User;
  onNavigate: (page: PageView, slugOrId?: string) => void;
  onLogout: () => void;
}

export function Dashboard({ user, onNavigate, onLogout }: DashboardProps) {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch<DashboardPayload>('/api/dashboard');
        if (active) setData(res);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [user.id, user.total_points]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="h-8 w-64 rounded bg-slate-800/80 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-[#0D1322] border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
          {error || 'Dashboard unavailable.'}
        </div>
      </div>
    );
  }

  const lessonPct =
    data.stats.totalLessons > 0
      ? Math.round((data.stats.completedLessons / data.stats.totalLessons) * 100)
      : 0;
  const ctfPct =
    data.stats.totalChallenges > 0
      ? Math.round((data.stats.completedChallenges / data.stats.totalChallenges) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Workspace Header & Account Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/90 pb-6">
        <div>
          <p className="text-xs font-medium text-sky-400">
            CyberTech Academy · {user.year_level} · {user.role === 'admin' ? 'Administrator' : 'Student Member'}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-50">
            Welcome back, {user.full_name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-[#0D1322] text-xs font-semibold text-slate-200 hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
          >
            <UserIcon className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
            <span>Profile</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800 bg-[#070B14] text-xs font-semibold text-slate-300 hover:text-red-300 hover:border-red-500/40 transition-colors whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Academy Progress</span>
            <BookOpen className="w-4 h-4 text-sky-400" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-100 tabular-nums">
            {data.stats.completedLessons} / {data.stats.totalLessons}
          </p>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-sky-400" style={{ width: `${lessonPct}%` }} />
          </div>
          <p className="text-xs text-slate-400 tabular-nums">{lessonPct}% lessons completed</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>CTF Challenges</span>
            <Flag className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-100 tabular-nums">
            {data.stats.completedChallenges} / {data.stats.totalChallenges}
          </p>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: `${ctfPct}%` }} />
          </div>
          <p className="text-xs text-slate-400 tabular-nums">{ctfPct}% flags captured</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total CTF Points</span>
            <Trophy className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-emerald-400 tabular-nums">
            {data.stats.totalPoints} pts
          </p>
          <p className="text-xs text-slate-400">Verified challenge solves</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Current Rank</span>
            <Award className="w-4 h-4 text-sky-400" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-100 tabular-nums">
            {data.stats.rank > 0 ? `#${data.stats.rank}` : 'Unranked'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('leaderboard')}
            className="text-xs font-medium text-sky-400 hover:text-sky-300"
          >
            View Leaderboard →
          </button>
        </div>
      </div>

      {/* Main Split: Recommended Lessons & Module Progress + Announcements & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* Recommended Next Lessons */}
          <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-slate-100">Recommended Next Lessons</h2>
              <button
                type="button"
                onClick={() => onNavigate('academy')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                All Modules →
              </button>
            </div>

            {data.recommendedLessons.length === 0 ? (
              <p className="text-sm text-emerald-300">
                Congratulations! You have completed all published Academy lessons. Test your skills in the CTF Arena.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {data.recommendedLessons.map((lesson) => (
                  <div key={lesson.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">
                        {lesson.module_name} · {lesson.difficulty} · {lesson.duration_minutes} min
                      </p>
                      <p className="text-sm font-semibold text-slate-100 truncate">{lesson.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('academy', lesson.slug)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Start</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Per-Module Learning Progress */}
          <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-slate-100">Module Completion Breakdown</h2>
            <div className="space-y-3.5">
              {data.moduleProgress.map((mod) => {
                const pct =
                  mod.total_lessons > 0 ? Math.round((mod.completed_lessons / mod.total_lessons) * 100) : 0;
                return (
                  <div key={mod.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{mod.name}</span>
                      <span className="font-mono text-slate-400 tabular-nums">
                        {mod.completed_lessons}/{mod.total_lessons} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Student Achievements & Badges */}
          <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-slate-100">Achievements & Badges</h2>
            {data.badges.length === 0 ? (
              <p className="text-sm text-slate-400">
                Complete lessons or capture your first CTF flag to unlock CyberTech Society badges.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {data.badges.map((b) => (
                  <div key={b.id} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold text-emerald-400">{b.title}</p>
                    <p className="text-xs text-slate-400">{b.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Announcements */}
          <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-slate-100">Recent Announcements</h2>
              <button
                type="button"
                onClick={() => onNavigate('events')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300"
              >
                View All →
              </button>
            </div>
            <div className="divide-y divide-slate-800/80">
              {data.announcements.map((ann) => (
                <div key={ann.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <p className="text-xs text-slate-400">
                    {ann.category} · {new Date(ann.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-semibold text-slate-100">{ann.title}</p>
                  <p className="text-xs text-slate-300 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-slate-100">Recent Activity</h2>
            {data.activities.length === 0 ? (
              <p className="text-sm text-slate-400">No recent learning or CTF activity yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {data.activities.map((act) => (
                  <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <p className="text-xs text-slate-200">{act.summary}</p>
                    <span className="text-xs font-mono text-slate-500 shrink-0 tabular-nums">
                      {new Date(act.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
