import React, { useEffect, useState } from 'react';
import { Calendar, Megaphone, Download, CheckCircle2 } from 'lucide-react';
import { apiFetch, downloadProtectedFile } from '../api.ts';
import type { Announcement, CtfEvent, PageView, ResourceItem, User } from '../types.ts';

interface EventsAnnouncementsViewProps {
  user: User | null;
  onNavigate: (page: PageView) => void;
}

export function EventsAnnouncementsView({ user, onNavigate }: EventsAnnouncementsViewProps) {
  const [events, setEvents] = useState<CtfEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [teamInputs, setTeamInputs] = useState<Record<number, string>>({});
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    try {
      const [evRes, annRes, resRes] = await Promise.all([
        apiFetch<{ events: CtfEvent[] }>('/api/events'),
        apiFetch<{ announcements: Announcement[] }>('/api/announcements'),
        apiFetch<{ resources: ResourceItem[] }>('/api/resources'),
      ]);
      setEvents(evRes.events);
      setAnnouncements(annRes.announcements);
      setResources(resRes.resources);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [user?.id]);

  async function registerEvent(eventId: number) {
    if (!user) {
      onNavigate('auth');
      return;
    }
    setStatusMsg('');
    try {
      await apiFetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        body: JSON.stringify({ teamName: teamInputs[eventId] || 'Solo' }),
      });
      setStatusMsg('Successfully registered for the CTF event.');
      await loadAll();
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Registration failed.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div className="border-b border-slate-800/90 pb-6">
        <p className="text-xs font-medium text-sky-400">CyberTech Society – BCCI · Schedule & Notices</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-50">
          CTF Events, Announcements & Study Guides
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Register for upcoming Hack4Gov qualifiers, view weekly training clinic schedules, and download reference sheets.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs font-medium text-emerald-200">
          {statusMsg}
        </div>
      )}

      {/* CTF Events & Registration */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-slate-100">CTF Competitions & Training Events</h2>
        </div>

        {loading ? (
          <div className="h-40 rounded-xl border border-slate-800 bg-[#0D1322]" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border border-slate-800 bg-[#0D1322] p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <p className="text-xs font-medium text-emerald-400 capitalize">
                    {ev.status} · {new Date(ev.start_date).toLocaleDateString()} –{' '}
                    {new Date(ev.end_date).toLocaleDateString()}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-slate-100">{ev.title}</h3>
                  <p className="text-xs text-slate-400">{ev.location}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{ev.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2.5">
                  <p className="text-xs text-slate-400 tabular-nums">
                    {ev.participant_count ?? 0} registered participants
                  </p>

                  {ev.is_registered ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Registered</span>
                    </div>
                  ) : ev.status === 'completed' ? (
                    <span className="text-xs text-slate-500">Event concluded</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={teamInputs[ev.id] || ''}
                        onChange={(e) => setTeamInputs((p) => ({ ...p, [ev.id]: e.target.value }))}
                        placeholder="Squad / Team name (optional)"
                        aria-label={`Team name for ${ev.title}`}
                        className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#070B14] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        type="button"
                        onClick={() => void registerEvent(ev.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-slate-950 text-xs font-semibold hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
                      >
                        {user ? 'Register' : 'Sign In'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Announcements & Downloadable Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-sky-400" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-slate-100">Announcements & Training Schedules</h2>
          </div>

          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0D1322]">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-6 space-y-2">
                <p className="text-xs text-slate-400">
                  {ann.category} · {new Date(ann.created_at).toLocaleDateString()}
                  {ann.pinned ? ' · Pinned Notice' : ''}
                </p>
                <h3 className="font-display text-base font-semibold text-slate-100">{ann.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-100">Downloadable Cybersecurity Resources</h2>
          <div className="space-y-3">
            {resources.map((res) => (
              <div key={res.id} className="rounded-xl border border-slate-800 bg-[#0D1322] p-5 space-y-2.5">
                <p className="text-xs text-sky-400 font-medium">{res.category}</p>
                <h3 className="font-display text-base font-semibold text-slate-100">{res.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{res.description}</p>
                <button
                  type="button"
                  onClick={() => (user ? void downloadProtectedFile(res.file_name) : onNavigate('auth'))}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-700 bg-[#141D33] text-xs font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{user ? `Download ${res.file_name}` : 'Sign in to Download'}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
