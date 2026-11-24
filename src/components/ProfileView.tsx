import React, { useEffect, useState } from 'react';
import { Save, Award, BookOpen, Flag } from 'lucide-react';
import { apiFetch } from '../api.ts';
import type { BadgeItem, User } from '../types.ts';

interface ProfileViewProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

interface MePayload {
  user: User;
  rank: number;
  badges: BadgeItem[];
  completedLessons: { lesson_id: number; title: string; module_name: string; quiz_score: number; quiz_total: number; completed_at: string }[];
  solvedChallenges: { challenge_id: number; title: string; category_name: string; difficulty: string; points_awarded: number; submitted_at: string }[];
}

export function ProfileView({ user, onUserUpdated }: ProfileViewProps) {
  const [me, setMe] = useState<MePayload | null>(null);
  const [fullName, setFullName] = useState(user.full_name);
  const [studentId, setStudentId] = useState(user.student_id || '');
  const [yearLevel, setYearLevel] = useState(user.year_level || '1st Year BSIT');
  const [bio, setBio] = useState(user.bio || '');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    async function load() {
      const res = await apiFetch<MePayload>('/api/auth/me');
      setMe(res);
      setFullName(res.user.full_name);
      setStudentId(res.user.student_id || '');
      setYearLevel(res.user.year_level || '1st Year BSIT');
      setBio(res.user.bio || '');
    }
    void load();
  }, [user.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      const res = await apiFetch<{ user: User }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ fullName, studentId, yearLevel, bio, newPassword }),
      });
      onUserUpdated(res.user);
      setNewPassword('');
      setFeedback('Profile saved successfully.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-slate-800/90 pb-6">
        <p className="text-xs font-medium text-sky-400">
          @{user.username} · {user.email} · Rank #{me?.rank || '—'}
        </p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-50">
          Student Profile & Learning History
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Form */}
        <form onSubmit={handleSave} className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4 h-fit">
          <h2 className="font-display text-lg font-semibold text-slate-100">Account Settings</h2>

          <div>
            <label htmlFor="prof-name" className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              id="prof-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-sid" className="block text-xs font-medium text-slate-300 mb-1.5">
                Student ID
              </label>
              <input
                id="prof-sid"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label htmlFor="prof-year" className="block text-xs font-medium text-slate-300 mb-1.5">
                Year Level / Program
              </label>
              <input
                id="prof-year"
                type="text"
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="prof-bio" className="block text-xs font-medium text-slate-300 mb-1.5">
              Bio / Focus Track
            </label>
            <textarea
              id="prof-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Aspiring penetration tester preparing for Hack4Gov..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label htmlFor="prof-pw" className="block text-xs font-medium text-slate-300 mb-1.5">
              New Password (leave blank to keep current)
            </label>
            <input
              id="prof-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {feedback && (
            <p className="text-xs font-medium text-emerald-300">{feedback}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-400 text-slate-950 text-sm font-semibold hover:bg-emerald-300 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>

        {/* History & Badges */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3">
            <h2 className="font-display text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Earned Badges</span>
            </h2>
            {!me || me.badges.length === 0 ? (
              <p className="text-xs text-slate-400">Complete Academy lessons or CTF flags to unlock badges.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {me.badges.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-lg border border-slate-800 bg-[#070B14]">
                    <p className="text-sm font-semibold text-emerald-400">{b.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{b.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3">
            <h2 className="font-display text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>CTF Solve History</span>
            </h2>
            {!me || me.solvedChallenges.length === 0 ? (
              <p className="text-xs text-slate-400">No CTF flags captured yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {me.solvedChallenges.map((s) => (
                  <div key={s.challenge_id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-slate-100">{s.title}</p>
                      <p className="text-slate-400">
                        {s.category_name} · {s.difficulty}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                      +{s.points_awarded} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3">
            <h2 className="font-display text-lg font-semibold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" aria-hidden="true" />
              <span>Completed Academy Lessons</span>
            </h2>
            {!me || me.completedLessons.length === 0 ? (
              <p className="text-xs text-slate-400">No lessons completed yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {me.completedLessons.map((l) => (
                  <div key={l.lesson_id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-slate-100">{l.title}</p>
                      <p className="text-slate-400">{l.module_name}</p>
                    </div>
                    <span className="font-mono text-sky-400 tabular-nums">
                      Quiz {l.quiz_score}/{l.quiz_total}
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
