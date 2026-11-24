import React, { useEffect, useMemo, useState } from 'react';
import { Flag, Search, Download, HelpCircle, CheckCircle2, X } from 'lucide-react';
import { apiFetch, downloadProtectedFile } from '../api.ts';
import type { ChallengeCategory, ChallengeHint, ChallengeSummary } from '../types.ts';
import { TerminalSandbox } from './TerminalSandbox.tsx';

interface CtfArenaViewProps {
  onPointsUpdated: (newTotalPoints?: number) => void;
}

export function CtfArenaView({ onPointsUpdated }: CtfArenaViewProps) {
  const [categories, setCategories] = useState<ChallengeCategory[]>([]);
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Active Challenge Modal/Panel
  const [activeChallenge, setActiveChallenge] = useState<ChallengeSummary | null>(null);
  const [hints, setHints] = useState<ChallengeHint[]>([]);
  const [flagInput, setFlagInput] = useState('');
  const [submitMessage, setSubmitMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadChallenges() {
    setLoading(true);
    try {
      const res = await apiFetch<{ categories: ChallengeCategory[]; challenges: ChallengeSummary[] }>(
        '/api/ctf/challenges'
      );
      setCategories(res.categories);
      setChallenges(res.challenges);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadChallenges();
  }, []);

  async function openChallenge(chal: ChallengeSummary) {
    setActiveChallenge(chal);
    setFlagInput('');
    setSubmitMessage(null);
    const res = await apiFetch<{ challenge: ChallengeSummary; hints: ChallengeHint[] }>(
      `/api/ctf/challenges/${chal.id}`
    );
    setActiveChallenge(res.challenge);
    setHints(res.hints);
  }

  async function unlockHint(hintId: number) {
    if (!activeChallenge) return;
    try {
      const res = await apiFetch<{ hintText: string; totalPoints?: number }>(
        `/api/ctf/challenges/${activeChallenge.id}/hint`,
        {
          method: 'POST',
          body: JSON.stringify({ hintId }),
        }
      );
      setHints((prev) =>
        prev.map((h) => (h.id === hintId ? { ...h, is_unlocked: 1, hint_text: res.hintText } : h))
      );
      if (typeof res.totalPoints === 'number') {
        onPointsUpdated(res.totalPoints);
      }
    } catch (err) {
      setSubmitMessage({
        ok: false,
        text: err instanceof Error ? err.message : 'Unable to unlock hint.',
      });
    }
  }

  async function handleSubmitFlag(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChallenge) return;
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const res = await apiFetch<{
        correct: boolean;
        alreadySolved?: boolean;
        pointsAwarded?: number;
        totalPoints?: number;
        message: string;
      }>(`/api/ctf/challenges/${activeChallenge.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ flag: flagInput }),
      });

      setSubmitMessage({ ok: res.correct, text: res.message });
      if (res.correct) {
        onPointsUpdated(res.totalPoints);
        await loadChallenges();
        setActiveChallenge((prev) => (prev ? { ...prev, is_solved: 1 } : null));
      }
    } catch (err) {
      setSubmitMessage({
        ok: false,
        text: err instanceof Error ? err.message : 'Submission error.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const filteredChallenges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return challenges.filter((c) => {
      if (selectedCategory !== 'all' && c.category_slug !== selectedCategory) return false;
      if (difficultyFilter !== 'all' && c.difficulty !== difficultyFilter) return false;
      if (q && !c.title.toLowerCase().includes(q) && !c.category_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [challenges, selectedCategory, difficultyFilter, searchQuery]);

  const solvedCount = challenges.filter((c) => Boolean(c.is_solved)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-slate-800/90 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-emerald-400">
            CTF Challenge Arena · 9 Categories ·{' '}
            <span className="tabular-nums">
              {solvedCount}/{challenges.length} Solved
            </span>
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-50">
            Capture The Flag Challenges
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Solve beginner to intermediate cybersecurity puzzles across isolated sandboxes and submit flags in{' '}
            <code className="font-mono text-emerald-300">CTF&#123;...&#125;</code> format.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges..."
              aria-label="Search CTF challenges"
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-700 bg-[#0D1322] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0D1322] border border-slate-800">
            {['all', 'Beginner', 'Intermediate'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  difficultyFilter === diff ? 'bg-[#141D33] text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff === 'all' ? 'All' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 9-Category Segmented Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
              : 'border-slate-800 bg-[#0D1322] text-slate-300 hover:border-slate-700'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
              selectedCategory === cat.slug
                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                : 'border-slate-800 bg-[#0D1322] text-slate-300 hover:border-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Challenge Cards Grid */}
      {loading ? (
        <div className="h-64 rounded-xl border border-slate-800 bg-[#0D1322]" />
      ) : filteredChallenges.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-10 text-center">
          <p className="text-sm text-slate-300">No challenges match the selected category or difficulty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChallenges.map((chal) => {
            const solved = Boolean(chal.is_solved);
            return (
              <div
                key={chal.id}
                className={`rounded-xl border p-6 flex flex-col justify-between gap-4 transition-colors ${
                  solved
                    ? 'border-emerald-500/40 bg-[#0D1821]'
                    : 'border-slate-800 bg-[#0D1322] hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">
                    {chal.category_name} · {chal.difficulty} ·{' '}
                    <span className="font-mono text-emerald-400 tabular-nums">{chal.points} pts</span> ·{' '}
                    <span className="tabular-nums">{chal.solves_count} solves</span>
                  </p>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-lg font-semibold text-slate-100">{chal.title}</h2>
                    {solved && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-label="Solved" />}
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-3">{chal.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className={`text-xs font-medium ${solved ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {solved ? 'Flag Captured' : 'Unsolved'}
                  </span>
                  <button
                    type="button"
                    onClick={() => void openChallenge(chal)}
                    className="px-4 py-2 rounded-lg bg-emerald-400 text-slate-950 text-xs font-semibold hover:bg-emerald-300 transition-colors whitespace-nowrap"
                  >
                    {solved ? 'Inspect Challenge' : 'Launch Challenge'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Challenge Detail Drawer / Modal */}
      {activeChallenge && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ctf-modal-title"
        >
          <div className="w-full max-w-3xl rounded-xl border border-slate-700 bg-[#0B111F] p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-medium text-sky-400">
                  {activeChallenge.category_name} · {activeChallenge.difficulty} ·{' '}
                  <span className="font-mono text-emerald-400 tabular-nums">{activeChallenge.points} pts</span>
                </p>
                <h2 id="ctf-modal-title" className="mt-1 font-display text-2xl font-bold text-slate-50">
                  {activeChallenge.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveChallenge(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close challenge dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-100">Challenge Brief</h3>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {activeChallenge.description}
              </p>
              <div className="p-4 rounded-lg border border-slate-800 bg-[#070B14] text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-sky-400">Instructions: </span>
                {activeChallenge.instructions}
              </div>

              {activeChallenge.download_file && (
                <button
                  type="button"
                  onClick={() => void downloadProtectedFile(activeChallenge.download_file!)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-sky-500/40 bg-sky-500/10 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition-colors"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download Artifact: {activeChallenge.download_file}</span>
                </button>
              )}
            </div>

            {/* Sandbox Terminal inside Challenge */}
            <TerminalSandbox title="Challenge Sandbox Terminal" suggestedCommand="help" />

            {/* Progressive Hints */}
            {hints.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-sky-400" aria-hidden="true" />
                  <span>Hints</span>
                </h3>
                <div className="space-y-2">
                  {hints.map((hint, idx) => (
                    <div
                      key={hint.id}
                      className="rounded-lg border border-slate-800 bg-[#070B14] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {hint.is_unlocked && hint.hint_text ? (
                        <p className="text-xs text-slate-200 font-mono">{hint.hint_text}</p>
                      ) : (
                        <>
                          <p className="text-xs text-slate-400">
                            Hint #{idx + 1} ·{' '}
                            {hint.cost_points > 0 ? `Costs ${hint.cost_points} points` : 'Free hint'}
                          </p>
                          <button
                            type="button"
                            onClick={() => void unlockHint(hint.id)}
                            className="px-3 py-1.5 rounded-md border border-slate-700 bg-[#141D33] text-xs font-semibold text-sky-300 hover:border-sky-400 whitespace-nowrap shrink-0"
                          >
                            Unlock Hint
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flag Submission Form */}
            <form onSubmit={handleSubmitFlag} className="space-y-3 pt-2 border-t border-slate-800">
              <label htmlFor="flag-submit-input" className="block text-xs font-semibold text-slate-200">
                Submit Flag
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="flag-submit-input"
                  type="text"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  placeholder="CTF{your_answer}"
                  disabled={Boolean(activeChallenge.is_solved)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 bg-[#070B14] font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={submitting || Boolean(activeChallenge.is_solved)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-400 text-slate-950 text-sm font-semibold hover:bg-emerald-300 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <Flag className="w-4 h-4" aria-hidden="true" />
                  <span>{activeChallenge.is_solved ? 'Solved' : submitting ? 'Verifying...' : 'Submit Flag'}</span>
                </button>
              </div>
              {submitMessage && (
                <div
                  role="status"
                  className={`p-3.5 rounded-lg border text-xs font-medium ${
                    submitMessage.ok
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-red-500/40 bg-red-500/10 text-red-200'
                  }`}
                >
                  {submitMessage.text}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
