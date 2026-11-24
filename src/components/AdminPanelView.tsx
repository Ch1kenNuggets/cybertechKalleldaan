import React, { useEffect, useState } from 'react';
import { Download, Plus, Trash2, Edit3 } from 'lucide-react';
import { apiFetch, downloadAdminCsvReport } from '../api.ts';
import type { AcademyModule, Announcement, ChallengeCategory, CtfEvent } from '../types.ts';

type AdminTab = 'overview' | 'users' | 'lessons' | 'challenges' | 'events' | 'announcements' | 'submissions';

interface AdminOverviewPayload {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalLessons: number;
    totalChallenges: number;
    totalSubmissions: number;
    correctSubmissions: number;
  };
  users: {
    id: number;
    full_name: string;
    username: string;
    email: string;
    role: 'student' | 'admin';
    year_level: string;
    total_points: number;
    is_active: number;
    lessons_completed: number;
    challenges_solved: number;
  }[];
  submissions: {
    id: number;
    username: string;
    challenge_title: string;
    submitted_flag: string;
    is_correct: number;
    points_awarded: number;
    submitted_at: string;
  }[];
  lessons: {
    id: number;
    category_id: number;
    module_name: string;
    title: string;
    difficulty: string;
    explanation: string;
    examples: string;
    is_published: number;
  }[];
  challenges: {
    id: number;
    category_id: number;
    category_name: string;
    title: string;
    difficulty: string;
    points: number;
    hints_count: number;
  }[];
}

export function AdminPanelView() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [data, setData] = useState<AdminOverviewPayload | null>(null);
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [chalCategories, setChalCategories] = useState<ChallengeCategory[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<CtfEvent[]>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  // Forms
  const [lessonCatId, setLessonCatId] = useState<number>(1);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDiff, setLessonDiff] = useState('Beginner');
  const [lessonExp, setLessonExp] = useState('');
  const [lessonEx, setLessonEx] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const [chalCatId, setChalCatId] = useState<number>(1);
  const [chalTitle, setChalTitle] = useState('');
  const [chalDiff, setChalDiff] = useState('Beginner');
  const [chalPoints, setChalPoints] = useState(100);
  const [chalDesc, setChalDesc] = useState('');
  const [chalInstr, setChalInstr] = useState('');
  const [chalFlag, setChalFlag] = useState('');
  const [chalHint, setChalHint] = useState('');
  const [extraHintChalId, setExtraHintChalId] = useState<number>(0);
  const [extraHintText, setExtraHintText] = useState('');
  const [extraHintCost, setExtraHintCost] = useState(0);

  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evStart, setEvStart] = useState('2026-12-10T09:00');
  const [evEnd, setEvEnd] = useState('2026-12-11T17:00');
  const [evStatus, setEvStatus] = useState('upcoming');
  const [evLoc, setEvLoc] = useState('BCCI Computer Lab 2');

  const [annTitle, setAnnTitle] = useState('');
  const [annCat, setAnnCat] = useState('Competition');
  const [annBody, setAnnBody] = useState('');
  const [annPinned, setAnnPinned] = useState(false);

  const [resTitle, setResTitle] = useState('');
  const [resCat, setResCat] = useState('Study Guide');
  const [resFile, setResFile] = useState('study_notes.md');
  const [resContent, setResContent] = useState('');

  async function loadAdminData() {
    setLoading(true);
    try {
      const [admRes, modRes, ctfRes, annRes, evRes] = await Promise.all([
        apiFetch<AdminOverviewPayload>('/api/admin/overview'),
        apiFetch<{ modules: AcademyModule[] }>('/api/academy/modules'),
        apiFetch<{ categories: ChallengeCategory[] }>('/api/ctf/challenges'),
        apiFetch<{ announcements: Announcement[] }>('/api/announcements'),
        apiFetch<{ events: CtfEvent[] }>('/api/events'),
      ]);
      setData(admRes);
      setModules(modRes.modules);
      setChalCategories(ctfRes.categories);
      setAnnouncements(annRes.announcements);
      setEvents(evRes.events);
      if (modRes.modules.length > 0 && lessonCatId === 1) {
        setLessonCatId(modRes.modules[0].id);
      }
      if (ctfRes.categories.length > 0 && chalCatId === 1) {
        setChalCatId(ctfRes.categories[0].id);
      }
      if (admRes.challenges.length > 0 && extraHintChalId === 0) {
        setExtraHintChalId(admRes.challenges[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAdminData();
  }, []);

  async function toggleUserActive(id: number, currentActive: number) {
    setNotice('');
    try {
      await apiFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !Boolean(currentActive) }),
      });
      setNotice('User account status updated.');
      await loadAdminData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Update failed.');
    }
  }

  async function handleSaveLesson(e: React.FormEvent) {
    e.preventDefault();
    setNotice('');
    try {
      if (editingLessonId) {
        await apiFetch(`/api/admin/lessons/${editingLessonId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: lessonTitle,
            difficulty: lessonDiff,
            explanation: lessonExp,
            examples: lessonEx,
            is_published: true,
          }),
        });
        setNotice('Lesson updated.');
      } else {
        await apiFetch('/api/admin/lessons', {
          method: 'POST',
          body: JSON.stringify({
            categoryId: lessonCatId,
            title: lessonTitle,
            difficulty: lessonDiff,
            explanation: lessonExp,
            examples: lessonEx,
          }),
        });
        setNotice('New lesson published to Academy.');
      }
      setEditingLessonId(null);
      setLessonTitle('');
      setLessonExp('');
      setLessonEx('');
      await loadAdminData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to save lesson.');
    }
  }

  async function handleCreateChallenge(e: React.FormEvent) {
    e.preventDefault();
    setNotice('');
    try {
      await apiFetch('/api/admin/challenges', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: chalCatId,
          title: chalTitle,
          difficulty: chalDiff,
          points: chalPoints,
          description: chalDesc,
          instructions: chalInstr || chalDesc,
          flag: chalFlag,
          hintText: chalHint,
          hintCost: 0,
        }),
      });
      setNotice('CTF challenge created with server-verified flag.');
      setChalTitle('');
      setChalDesc('');
      setChalInstr('');
      setChalFlag('');
      setChalHint('');
      await loadAdminData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to create challenge.');
    }
  }

  async function handleAddHint(e: React.FormEvent) {
    e.preventDefault();
    if (!extraHintChalId) return;
    setNotice('');
    try {
      await apiFetch(`/api/admin/challenges/${extraHintChalId}/hints`, {
        method: 'POST',
        body: JSON.stringify({ hintText: extraHintText, costPoints: extraHintCost }),
      });
      setNotice('Hint attached to challenge.');
      setExtraHintText('');
      await loadAdminData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to add hint.');
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setNotice('');
    try {
      await apiFetch('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify({
          title: evTitle,
          description: evDesc,
          startDate: evStart,
          endDate: evEnd,
          status: evStatus,
          location: evLoc,
        }),
      });
      setNotice('CTF competition event created.');
      setEvTitle('');
      setEvDesc('');
      await loadAdminData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to create event.');
    }
  }

  async function handleCreateAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    setNotice('');
    try {
      await apiFetch('/api/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({ title: annTitle, category: annCat, content: annBody, pinned: annPinned }),
      });
      setNotice('Announcement published.');
      setAnnTitle('');
      setAnnBody('');
      await loadAdminData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to publish announcement.');
    }
  }

  async function handleDeleteAnnouncement(id: number) {
    await apiFetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    await loadAdminData();
  }

  async function handleUploadResource(e: React.FormEvent) {
    e.preventDefault();
    setNotice('');
    try {
      await apiFetch('/api/admin/resources', {
        method: 'POST',
        body: JSON.stringify({
          title: resTitle,
          category: resCat,
          description: `Uploaded study material (${resFile})`,
          fileName: resFile,
          content: resContent,
        }),
      });
      setNotice('Learning resource uploaded securely.');
      setResTitle('');
      setResContent('');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to upload resource.');
    }
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Overview & Reports' },
    { id: 'users', label: 'Students' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'challenges', label: 'CTF Challenges' },
    { id: 'events', label: 'CTF Events' },
    { id: 'announcements', label: 'Notices & Files' },
    { id: 'submissions', label: 'Submissions' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border-b border-slate-800/90 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-sky-400">CyberTech Society – BCCI · Officer Administration</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-50">
            Administrator Control Panel
          </h1>
        </div>

        <button
          type="button"
          onClick={() => void downloadAdminCsvReport()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-400 text-slate-950 text-xs font-semibold hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Export Performance CSV</span>
        </button>
      </div>

      {/* Admin Sub-Navigation */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#0D1322] border border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              tab === t.id ? 'bg-[#141D33] text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {notice && (
        <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs font-medium text-emerald-200">
          {notice}
        </div>
      )}

      {loading || !data ? (
        <div className="h-48 rounded-xl border border-slate-800 bg-[#0D1322]" />
      ) : (
        <>
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-5">
                  <p className="text-xs text-slate-400">Registered Students</p>
                  <p className="mt-1 font-display text-2xl font-bold text-slate-100 tabular-nums">
                    {data.stats.totalStudents}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-5">
                  <p className="text-xs text-slate-400">Published Lessons</p>
                  <p className="mt-1 font-display text-2xl font-bold text-sky-400 tabular-nums">
                    {data.stats.totalLessons}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-5">
                  <p className="text-xs text-slate-400">Active CTF Challenges</p>
                  <p className="mt-1 font-display text-2xl font-bold text-emerald-400 tabular-nums">
                    {data.stats.totalChallenges}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-5">
                  <p className="text-xs text-slate-400">Flag Submissions</p>
                  <p className="mt-1 font-display text-2xl font-bold text-slate-100 tabular-nums">
                    {data.stats.totalSubmissions}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-5">
                  <p className="text-xs text-slate-400">Verified Flag Captures</p>
                  <p className="mt-1 font-display text-2xl font-bold text-emerald-400 tabular-nums">
                    {data.stats.correctSubmissions}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0D1322] p-5">
                  <p className="text-xs text-slate-400">XAMPP PHP Export</p>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Complete plain PHP + MySQL codebase is available in <code className="font-mono text-sky-400">/cybertech-academy/</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="rounded-xl border border-slate-800 bg-[#0D1322] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Program</th>
                    <th className="py-3 px-4 text-right">Lessons</th>
                    <th className="py-3 px-4 text-right">Flags</th>
                    <th className="py-3 px-4 text-right">Points</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {data.users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-100">{u.full_name}</p>
                        <p className="text-slate-400">@{u.username} · {u.email}</p>
                      </td>
                      <td className="py-3 px-4 capitalize text-sky-400">{u.role}</td>
                      <td className="py-3 px-4 text-slate-300">{u.year_level}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{u.lessons_completed}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{u.challenges_solved}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400 tabular-nums">{u.total_points}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => void toggleUserActive(u.id, u.is_active)}
                          className="px-2.5 py-1 rounded border border-slate-700 text-slate-200 hover:border-emerald-400"
                        >
                          {u.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'lessons' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form onSubmit={handleSaveLesson} className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4 h-fit">
                <h2 className="font-display text-lg font-semibold text-slate-100">
                  {editingLessonId ? `Edit Lesson #${editingLessonId}` : 'Create New Lesson'}
                </h2>
                {!editingLessonId && (
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Academy Module</label>
                    <select
                      value={lessonCatId}
                      onChange={(e) => setLessonCatId(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                    >
                      {modules.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Difficulty</label>
                    <select
                      value={lessonDiff}
                      onChange={(e) => setLessonDiff(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Lesson Explanation</label>
                  <textarea
                    required
                    rows={4}
                    value={lessonExp}
                    onChange={(e) => setLessonExp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Practical Examples</label>
                  <textarea
                    rows={3}
                    value={lessonEx}
                    onChange={(e) => setLessonEx(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400 text-slate-950 text-xs font-semibold hover:bg-emerald-300"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{editingLessonId ? 'Save Lesson' : 'Publish Lesson'}</span>
                  </button>
                  {editingLessonId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLessonId(null);
                        setLessonTitle('');
                        setLessonExp('');
                        setLessonEx('');
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3 max-h-[600px] overflow-y-auto">
                <h2 className="font-display text-lg font-semibold text-slate-100">Existing Lessons ({data.lessons.length})</h2>
                <div className="divide-y divide-slate-800/80">
                  {data.lessons.map((l) => (
                    <div key={l.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">{l.module_name} · {l.difficulty}</p>
                        <p className="text-sm font-medium text-slate-100 truncate">{l.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLessonId(l.id);
                          setLessonTitle(l.title);
                          setLessonDiff(l.difficulty);
                          setLessonExp(l.explanation);
                          setLessonEx(l.examples || '');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 text-xs text-sky-300 hover:border-sky-400 shrink-0"
                      >
                        <Edit3 className="w-3 h-3" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'challenges' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-6">
                <form onSubmit={handleCreateChallenge} className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4">
                  <h2 className="font-display text-lg font-semibold text-slate-100">Create CTF Challenge</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Category</label>
                      <select
                        value={chalCatId}
                        onChange={(e) => setChalCatId(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                      >
                        {chalCategories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Difficulty</label>
                      <select
                        value={chalDiff}
                        onChange={(e) => setChalDiff(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-300 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={chalTitle}
                        onChange={(e) => setChalTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Points</label>
                      <input
                        type="number"
                        min={10}
                        required
                        value={chalPoints}
                        onChange={(e) => setChalPoints(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={chalDesc}
                      onChange={(e) => setChalDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Correct Flag (stored server-side only)</label>
                    <input
                      type="text"
                      required
                      value={chalFlag}
                      onChange={(e) => setChalFlag(e.target.value)}
                      placeholder="CTF{secret_flag}"
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] font-mono text-xs text-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Initial Free Hint (Optional)</label>
                    <input
                      type="text"
                      value={chalHint}
                      onChange={(e) => setChalHint(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-400 text-slate-950 text-xs font-semibold hover:bg-emerald-300"
                  >
                    Publish Challenge
                  </button>
                </form>

                <form onSubmit={handleAddHint} className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3">
                  <h3 className="font-display text-base font-semibold text-slate-100">Add Hint to Challenge</h3>
                  <select
                    value={extraHintChalId}
                    onChange={(e) => setExtraHintChalId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                  >
                    {data.challenges.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={extraHintText}
                    onChange={(e) => setExtraHintText(e.target.value)}
                    placeholder="Hint guidance text"
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      value={extraHintCost}
                      onChange={(e) => setExtraHintCost(Number(e.target.value))}
                      placeholder="Point cost"
                      className="w-32 px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg border border-sky-400/50 bg-sky-500/10 text-xs font-semibold text-sky-300 hover:bg-sky-500/20"
                    >
                      Attach Hint
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3 max-h-[680px] overflow-y-auto">
                <h2 className="font-display text-lg font-semibold text-slate-100">
                  Active Challenges ({data.challenges.length})
                </h2>
                <div className="divide-y divide-slate-800/80">
                  {data.challenges.map((c) => (
                    <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-slate-400">{c.category_name} · {c.difficulty}</p>
                        <p className="text-sm font-medium text-slate-100">{c.title}</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="text-emerald-400 tabular-nums">{c.points} pts</p>
                        <p className="text-slate-400 tabular-nums">{c.hints_count} hints</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'events' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form onSubmit={handleCreateEvent} className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4 h-fit">
                <h2 className="font-display text-lg font-semibold text-slate-100">Schedule CTF Event</h2>
                <input
                  type="text"
                  required
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  placeholder="Event Title"
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                />
                <textarea
                  rows={3}
                  value={evDesc}
                  onChange={(e) => setEvDesc(e.target.value)}
                  placeholder="Competition rules and summary..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      value={evStart}
                      onChange={(e) => setEvStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={evEnd}
                      onChange={(e) => setEvEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={evStatus}
                    onChange={(e) => setEvStatus(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <input
                    type="text"
                    value={evLoc}
                    onChange={(e) => setEvLoc(e.target.value)}
                    placeholder="Location"
                    className="px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-400 text-slate-950 text-xs font-semibold hover:bg-emerald-300"
                >
                  Create Event
                </button>
              </form>

              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3">
                <h2 className="font-display text-lg font-semibold text-slate-100">Scheduled Competitions</h2>
                <div className="divide-y divide-slate-800/80">
                  {events.map((ev) => (
                    <div key={ev.id} className="py-3 space-y-1">
                      <p className="text-xs text-emerald-400 capitalize">{ev.status} · {ev.location}</p>
                      <p className="text-sm font-semibold text-slate-100">{ev.title}</p>
                      <p className="text-xs text-slate-400 tabular-nums">
                        {new Date(ev.start_date).toLocaleString()} → {new Date(ev.end_date).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'announcements' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-6">
                <form onSubmit={handleCreateAnnouncement} className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-4">
                  <h2 className="font-display text-lg font-semibold text-slate-100">Publish Announcement</h2>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Announcement Title"
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={annCat}
                      onChange={(e) => setAnnCat(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                    >
                      <option>Competition</option>
                      <option>Schedule</option>
                      <option>Academy</option>
                      <option>Policy</option>
                    </select>
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input type="checkbox" checked={annPinned} onChange={(e) => setAnnPinned(e.target.checked)} />
                      <span>Pin notice</span>
                    </label>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={annBody}
                    onChange={(e) => setAnnBody(e.target.value)}
                    placeholder="Announcement content..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-400 text-slate-950 text-xs font-semibold hover:bg-emerald-300"
                  >
                    Publish Notice
                  </button>
                </form>

                <form onSubmit={handleUploadResource} className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3">
                  <h2 className="font-display text-lg font-semibold text-slate-100">Upload Learning Material</h2>
                  <input
                    type="text"
                    required
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    placeholder="Guide Title"
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={resCat}
                      onChange={(e) => setResCat(e.target.value)}
                      placeholder="Category"
                      className="px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100"
                    />
                    <input
                      type="text"
                      required
                      value={resFile}
                      onChange={(e) => setResFile(e.target.value)}
                      placeholder="filename.md (.txt/.md/.csv/.json)"
                      className="px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] font-mono text-xs text-slate-100"
                    />
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={resContent}
                    onChange={(e) => setResContent(e.target.value)}
                    placeholder="Resource content..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-[#070B14] font-mono text-xs text-slate-100"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg border border-sky-400/50 bg-sky-500/10 text-xs font-semibold text-sky-300 hover:bg-sky-500/20"
                  >
                    Save Study Material
                  </button>
                </form>
              </div>

              <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0D1322] p-6 space-y-3">
                <h2 className="font-display text-lg font-semibold text-slate-100">Published Notices</h2>
                <div className="divide-y divide-slate-800/80">
                  {announcements.map((a) => (
                    <div key={a.id} className="py-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-sky-400">{a.category}</p>
                        <p className="text-sm font-semibold text-slate-100">{a.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{a.content}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeleteAnnouncement(a.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400"
                        aria-label={`Delete ${a.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'submissions' && (
            <div className="rounded-xl border border-slate-800 bg-[#0D1322] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Challenge</th>
                    <th className="py-3 px-4">Submitted Value</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4 text-right">Points</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {data.submissions.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 px-4 font-medium text-slate-100">@{s.username}</td>
                      <td className="py-3 px-4 text-slate-300">{s.challenge_title}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{s.submitted_flag}</td>
                      <td className="py-3 px-4">
                        <span className={s.is_correct ? 'text-emerald-400 font-semibold' : 'text-red-400'}>
                          {s.is_correct ? 'Accepted' : 'Rejected'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{s.points_awarded}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {new Date(s.submitted_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
