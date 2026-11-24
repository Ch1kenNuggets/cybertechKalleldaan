import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { apiFetch } from '../api.ts';
import type { BadgeItem, LeaderboardPlayer, User } from '../types.ts';

interface LeaderboardViewProps {
  currentUser: User | null;
}

interface RecentSolve {
  username: string;
  challenge_title: string;
  category_name: string;
  points_awarded: number;
  submitted_at: string;
}

interface StudentProfileModalData {
  student: {
    id: number;
    full_name: string;
    username: string;
    year_level: string;
    bio: string;
    total_points: number;
    created_at: string;
  };
  rank: number;
  badges: BadgeItem[];
  solves: {
    title: string;
    difficulty: string;
    category_name: string;
    points_awarded: number;
    submitted_at: string;
  }[];
}

export function LeaderboardView({ currentUser }: LeaderboardViewProps) {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [recentSolves, setRecentSolves] = useState<RecentSolve[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfileModalData | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch<{ players: LeaderboardPlayer[]; recentSolves: RecentSolve[] }>(
          '/api/leaderboard'
        );
        if (active) {
          setPlayers(res.players);
          setRecentSolves(res.recentSolves);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  async function inspectStudent(id: number) {
    if (!currentUser) return;
    const res = await apiFetch<StudentProfileModalData>(`/api/users/${id}/profile`);
    setSelectedProfile(res);
  }

  const topTen = players.slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-slate-800/90 pb-6">
        <p className="text-xs font-medium text-emerald-400">CyberTech Society – BCCI · Live CTF Rankings</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-50">
          Scoreboard & Top 10 Leaderboard
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Rankings update immediately when flags are verified on the server.
          {currentUser ? ' Select any competitor to view their solve history.' : ''}
        </p>
      </div>

      {/* Top 3 Highlight Strip */}
      {topTen.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topTen.slice(0, 3).map((p, idx) => (
            <div
              key={p.id}
              className={`rounded-xl border p-6 space-y-2 ${
                idx === 0 ? 'border-emerald-400/60 bg-[#0D1A1F]' : 'border-slate-800 bg-[#0D1322]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono font-semibold text-emerald-400 tabular-nums">Rank #{idx + 1}</span>
                <Trophy className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              </div>
              <p className="font-display text-lg font-bold text-slate-100">{p.full_name}</p>
              <p className="text-xs text-slate-400">
                @{p.username} · {p.year_level}
              </p>
              <p className="pt-2 font-mono text-xl font-bold text-emerald-400 tabular-nums">
                {p.total_points} pts
              </p>
              <p className="text-xs text-slate-400 tabular-nums">
                {p.challenges_solved} flags · {p.lessons_completed} lessons
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Rankings Table */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#0D1322] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-100">Student Rankings</h2>
            <span className="text-xs text-slate-400 tabular-nums">{players.length} ranked students</span>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-slate-400">Loading leaderboard...</div>
          ) : players.length === 0 ? (
            <div className="p-8 text-sm text-slate-400">
              No student scores recorded yet. Register as a student and solve your first challenge!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400">
                    <th className="py-3 px-4 font-medium">Rank</th>
                    <th className="py-3 px-4 font-medium">Competitor</th>
                    <th className="py-3 px-4 font-medium">Program</th>
                    <th className="py-3 px-4 font-medium text-right">Flags</th>
                    <th className="py-3 px-4 font-medium text-right">Lessons</th>
                    <th className="py-3 px-4 font-medium text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {players.map((player, idx) => (
                    <tr
                      key={player.id}
                      onClick={() => void inspectStudent(player.id)}
                      className={`transition-colors ${
                        currentUser ? 'cursor-pointer hover:bg-slate-800/40' : ''
                      } ${currentUser?.id === player.id ? 'bg-emerald-500/5' : ''}`}
                    >
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-300 tabular-nums">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-100">{player.full_name}</p>
                        <p className="text-xs text-slate-400">@{player.username}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">{player.year_level}</td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-200 tabular-nums">
                        {player.challenges_solved}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-200 tabular-nums">
                        {player.lessons_completed}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-emerald-400 tabular-nums">
                        {player.total_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Solves Feed */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4 h-fit">
          <h2 className="font-display text-base font-semibold text-slate-100">Recent Flag Captures</h2>
          {recentSolves.length === 0 ? (
            <p className="text-xs text-slate-400">No verified flag submissions yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentSolves.map((s, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-0.5">
                  <p className="text-xs text-slate-200">
                    <span className="font-semibold text-emerald-400">@{s.username}</span> solved{' '}
                    <span className="font-medium text-slate-100">{s.challenge_title}</span>
                  </p>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {s.category_name} · +{s.points_awarded} pts · {new Date(s.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Individual Student Profile Modal */}
      {selectedProfile && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0B111F] p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs text-sky-400">
                  Rank #{selectedProfile.rank || '—'} · {selectedProfile.student.year_level}
                </p>
                <h3 className="font-display text-xl font-bold text-slate-50">{selectedProfile.student.full_name}</h3>
                <p className="text-xs text-slate-400">@{selectedProfile.student.username}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close profile dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedProfile.student.bio && (
              <p className="text-sm text-slate-300">{selectedProfile.student.bio}</p>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-200">Earned Badges</h4>
              {selectedProfile.badges.length === 0 ? (
                <p className="text-xs text-slate-400">No badges earned yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedProfile.badges.map((b) => (
                    <p key={b.id} className="text-xs text-emerald-400">
                      {b.title} — <span className="text-slate-400">{b.description}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-200">Challenge Completion History</h4>
              {selectedProfile.solves.length === 0 ? (
                <p className="text-xs text-slate-400">No solved challenges yet.</p>
              ) : (
                <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg px-3">
                  {selectedProfile.solves.map((s, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <span className="text-slate-200">
                        {s.title} <span className="text-slate-400">({s.category_name})</span>
                      </span>
                      <span className="font-mono text-emerald-400 tabular-nums">+{s.points_awarded}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
