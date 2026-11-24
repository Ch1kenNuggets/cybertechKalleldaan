import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Search, BookOpen, ArrowLeft, Download } from 'lucide-react';
import { apiFetch, downloadProtectedFile } from '../api.ts';
import type { AcademyModule, LessonDetail, LessonSummary } from '../types.ts';
import { TerminalSandbox } from './TerminalSandbox.tsx';

interface AcademyViewProps {
  initialLessonSlug?: string | null;
  onLessonCompleted?: () => void;
}

export function AcademyView({ initialLessonSlug, onLessonCompleted }: AcademyViewProps) {
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLesson, setActiveLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);

  // Quiz submission state
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<{
    passed: boolean;
    message: string;
    results?: { selected: number; isCorrect: boolean }[];
  } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  async function loadCatalog() {
    setLoading(true);
    try {
      const res = await apiFetch<{ modules: AcademyModule[]; lessons: LessonSummary[] }>('/api/academy/modules');
      setModules(res.modules);
      setLessons(res.lessons);
    } finally {
      setLoading(false);
    }
  }

  async function openLesson(slug: string) {
    setLessonLoading(true);
    setQuizFeedback(null);
    setAnswers({});
    try {
      const res = await apiFetch<{ lesson: LessonDetail }>(`/api/academy/lessons/${encodeURIComponent(slug)}`);
      setActiveLesson(res.lesson);
    } finally {
      setLessonLoading(false);
    }
  }

  useEffect(() => {
    void loadCatalog();
  }, []);

  useEffect(() => {
    if (initialLessonSlug) {
      void openLesson(initialLessonSlug);
    }
  }, [initialLessonSlug]);

  const filteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lessons.filter((l) => {
      if (selectedModuleSlug !== 'all' && l.module_slug !== selectedModuleSlug) return false;
      if (difficultyFilter !== 'all' && l.difficulty !== difficultyFilter) return false;
      if (q && !l.title.toLowerCase().includes(q) && !l.module_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [lessons, selectedModuleSlug, difficultyFilter, searchQuery]);

  async function handleQuizSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeLesson) return;
    setSubmittingQuiz(true);
    setQuizFeedback(null);
    try {
      const answerArray = activeLesson.quiz.map((_, idx) => answers[idx] ?? -1);
      const res = await apiFetch<{
        passed: boolean;
        score: number;
        total: number;
        message: string;
        results: { selected: number; isCorrect: boolean }[];
      }>(`/api/academy/lessons/${activeLesson.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ answers: answerArray }),
      });
      setQuizFeedback({ passed: res.passed, message: res.message, results: res.results });
      if (res.passed) {
        await loadCatalog();
        await openLesson(activeLesson.slug);
        onLessonCompleted?.();
      }
    } catch (err) {
      setQuizFeedback({
        passed: false,
        message: err instanceof Error ? err.message : 'Unable to submit quiz.',
      });
    } finally {
      setSubmittingQuiz(false);
    }
  }

  if (lessonLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-96 rounded-xl border border-slate-800 bg-[#0D1322]" />
      </div>
    );
  }

  if (activeLesson) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <button
          type="button"
          onClick={() => setActiveLesson(null)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Academy Modules</span>
        </button>

        <div className="border-b border-slate-800 pb-6 space-y-2">
          <p className="text-xs font-medium text-slate-400">
            {activeLesson.module_name} · {activeLesson.difficulty} · {activeLesson.duration_minutes} min
            {activeLesson.completed ? ' · Completed' : ''}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">{activeLesson.title}</h1>
            {activeLesson.completed && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Completed</span>
              </span>
            )}
          </div>
          {activeLesson.attachment_name && (
            <button
              type="button"
              onClick={() => void downloadProtectedFile(activeLesson.attachment_name!)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 pt-1"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download Material: {activeLesson.attachment_name}</span>
            </button>
          )}
        </div>

        {/* Learning Objectives */}
        <section className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-100">Learning Objectives</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-300">
            {activeLesson.objectives.map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
        </section>

        {/* Explanation */}
        <section className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-100">Concept Guide</h2>
          <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
            {activeLesson.explanation}
          </div>
        </section>

        {/* Practical Examples */}
        {activeLesson.examples && (
          <section className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3">
            <h2 className="font-display text-lg font-semibold text-slate-100">Examples</h2>
            <pre className="p-4 rounded-lg bg-[#050811] border border-slate-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap overflow-x-auto">
              {activeLesson.examples}
            </pre>
          </section>
        )}

        {/* Practical Exercise + Interactive Terminal */}
        <section className="space-y-3">
          <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-2">
            <h2 className="font-display text-lg font-semibold text-slate-100">Practical Exercise</h2>
            <p className="text-sm text-slate-300">{activeLesson.exercise_prompt}</p>
            {activeLesson.exercise_command_hint && (
              <p className="text-xs font-mono text-sky-400">
                Suggested command: {activeLesson.exercise_command_hint}
              </p>
            )}
          </div>
          <TerminalSandbox
            suggestedCommand={activeLesson.exercise_command_hint || 'help'}
            title={`Lab Terminal — ${activeLesson.title}`}
          />
        </section>

        {/* Knowledge Assessment Quiz */}
        <section className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-100">Knowledge Assessment</h2>
            <p className="text-xs text-slate-400 mt-1">
              Answer all questions and score at least 2/3 to mark this lesson complete.
            </p>
          </div>

          <form onSubmit={handleQuizSubmit} className="space-y-6">
            {activeLesson.quiz.map((q, qIdx) => (
              <fieldset key={qIdx} className="space-y-2.5">
                <legend className="text-sm font-semibold text-slate-100">
                  {qIdx + 1}. {q.question}
                </legend>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => {
                    const checked = answers[qIdx] === oIdx;
                    return (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                          checked
                            ? 'border-emerald-400 bg-emerald-500/10 text-slate-100'
                            : 'border-slate-800 bg-[#070B14] text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-q-${qIdx}`}
                          checked={checked}
                          onChange={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                          className="accent-emerald-400"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {quizFeedback && (
              <div
                role="status"
                className={`p-4 rounded-lg border text-sm ${
                  quizFeedback.passed
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                }`}
              >
                {quizFeedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={submittingQuiz}
              className="px-5 py-2.5 rounded-lg bg-emerald-400 text-slate-950 text-sm font-semibold hover:bg-emerald-300 disabled:opacity-50 transition-colors"
            >
              {submittingQuiz ? 'Checking Answers...' : 'Submit Assessment'}
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-slate-800/90 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-sky-400">CyberTech Academy · 7 Core Modules</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-50">
            Cybersecurity Learning Modules
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            Study structured lessons with real-world examples, practice inside the isolated terminal, and pass each
            knowledge check to track your progress.
          </p>
        </div>

        {/* Search & Difficulty Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lessons..."
              aria-label="Search lessons"
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-700 bg-[#0D1322] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0D1322] border border-slate-800">
            {['all', 'Beginner', 'Intermediate'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficultyFilter(lvl)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  difficultyFilter === lvl ? 'bg-[#141D33] text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl === 'all' ? 'All Levels' : lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Module Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedModuleSlug('all')}
          className={`text-left p-4 rounded-xl border transition-colors ${
            selectedModuleSlug === 'all'
              ? 'border-emerald-400 bg-[#111A2E]'
              : 'border-slate-800 bg-[#0D1322] hover:border-slate-700'
          }`}
        >
          <p className="text-xs text-slate-400">Overview</p>
          <p className="mt-1 font-display text-sm font-semibold text-slate-100">All 7 Modules</p>
          <p className="mt-1 text-xs font-mono text-emerald-400 tabular-nums">{lessons.length} total lessons</p>
        </button>

        {modules.map((mod) => {
          const active = selectedModuleSlug === mod.slug;
          const total = mod.total_lessons ?? 0;
          const done = mod.completed_lessons ?? 0;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => setSelectedModuleSlug(mod.slug)}
              className={`text-left p-4 rounded-xl border transition-colors ${
                active
                  ? 'border-emerald-400 bg-[#111A2E]'
                  : 'border-slate-800 bg-[#0D1322] hover:border-slate-700'
              }`}
            >
              <p className="text-xs text-slate-400">Module {String(mod.sort_order).padStart(2, '0')}</p>
              <p className="mt-1 font-display text-sm font-semibold text-slate-100 truncate">{mod.name}</p>
              <p className="mt-1 text-xs font-mono text-sky-400 tabular-nums">
                {done}/{total} completed
              </p>
            </button>
          );
        })}
      </div>

      {/* Lessons List */}
      {loading ? (
        <div className="h-64 rounded-xl border border-slate-800 bg-[#0D1322]" />
      ) : filteredLessons.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-10 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-200">No lessons match your current filter.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedModuleSlug('all');
              setDifficultyFilter('all');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-xl border border-slate-800 bg-[#0D1322] p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400">
                  {lesson.module_name} · {lesson.difficulty} · {lesson.duration_minutes} min
                </p>
                <h3 className="font-display text-base font-semibold text-slate-100">{lesson.title}</h3>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className={`text-xs font-medium ${lesson.completed ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {lesson.completed ? 'Completed' : 'Not started'}
                </span>
                <button
                  type="button"
                  onClick={() => void openLesson(lesson.slug)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#141D33] border border-slate-700 text-xs font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap"
                >
                  {lesson.completed ? 'Review Lesson' : 'Open Lesson'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
