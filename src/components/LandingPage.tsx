import React, { useState } from 'react';
import { ArrowRight, Shield, Terminal, Flag, BookOpen, Calendar, Award } from 'lucide-react';
import type { AcademyModule, Announcement, CtfEvent, PageView, User } from '../types.ts';

interface LandingPageProps {
  user: User | null;
  modules: AcademyModule[];
  announcements: Announcement[];
  events: CtfEvent[];
  counts: { totalLessons: number; totalChallenges: number; totalStudents: number };
  onNavigate: (page: PageView) => void;
}

export function LandingPage({
  user,
  modules,
  announcements,
  events,
  counts,
  onNavigate,
}: LandingPageProps) {
  const [heroImgError, setHeroImgError] = useState(false);
  const [diagramImgError, setDiagramImgError] = useState(false);
  const [crestImgError, setCrestImgError] = useState(false);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-3">
              {!crestImgError ? (
                <img
                  src="/src/assets/images/cybertech_crest_1795543404812.jpg"
                  alt="CyberTech Society BCCI Emblem"
                  referrerPolicy="no-referrer"
                  onError={() => setCrestImgError(true)}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg border border-slate-800 bg-[#0D1322] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
              )}
              <p className="text-sm font-medium text-sky-400">
                CyberTech Society – BCCI · CyberTech Academy
              </p>
            </div>

            <h1
              className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-50 leading-tight max-w-2xl"
              style={{ textWrap: 'balance' }}
            >
              Learn. Explore. Secure. Compete.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              The official cybersecurity learning center and Capture The Flag arena of CyberTech Society – BCCI.
              Build practical skills from fundamentals to ethical hacking and prepare your squad for Hack4Gov.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate(user ? 'academy' : 'auth')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-400 text-slate-950 text-sm font-semibold hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
              >
                <span>{user ? 'Continue Learning' : 'Start Training'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate(user ? 'ctf' : 'leaderboard')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-700 bg-[#0D1322] text-slate-100 text-sm font-semibold hover:border-sky-400/60 hover:text-sky-300 transition-colors whitespace-nowrap shrink-0"
              >
                <Flag className="w-4 h-4 text-sky-400" aria-hidden="true" />
                <span>{user ? 'Open CTF Arena' : 'View Leaderboard'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            {!heroImgError ? (
              <div className="h-full min-h-[280px] rounded-xl overflow-hidden border border-slate-800 bg-[#0D1322]">
                <img
                  src="/src/assets/images/hero_cyber_lab_1795543403638.jpg"
                  alt="CyberTech Society University Training Lab and Network Defense Topology"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-full min-h-[280px] rounded-xl border border-slate-800 bg-gradient-to-br from-[#0D1322] to-[#08101E] flex flex-col items-center justify-center p-8 text-center">
                <Terminal className="w-12 h-12 text-emerald-400 mb-3" />
                <p className="font-display text-lg font-semibold text-slate-100">CyberTech Academy Lab</p>
                <p className="text-sm text-slate-400 mt-1">Structured Training & Controlled CTF Sandboxes</p>
              </div>
            )}
          </div>
        </div>

        {/* Full-Width Key Metrics Strip Below Hero Split */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="rounded-xl border border-slate-800/90 bg-[#0D1322] p-5">
            <p className="text-xs font-medium text-slate-400">Academy Curriculum</p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-100 tabular-nums">7 Modules</p>
            <p className="mt-1 text-xs text-slate-400 tabular-nums">{counts.totalLessons} guided lessons</p>
          </div>
          <div className="rounded-xl border border-slate-800/90 bg-[#0D1322] p-5">
            <p className="text-xs font-medium text-slate-400">CTF Challenge Matrix</p>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-400 tabular-nums">9 Categories</p>
            <p className="mt-1 text-xs text-slate-400 tabular-nums">{counts.totalChallenges} interactive challenges</p>
          </div>
          <div className="rounded-xl border border-slate-800/90 bg-[#0D1322] p-5">
            <p className="text-xs font-medium text-slate-400">Competition Focus</p>
            <p className="mt-1 font-display text-2xl font-bold text-sky-400">Hack4Gov</p>
            <p className="mt-1 text-xs text-slate-400">Regional qualifier readiness</p>
          </div>
          <div className="rounded-xl border border-slate-800/90 bg-[#0D1322] p-5">
            <p className="text-xs font-medium text-slate-400">Registered Learners</p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-100 tabular-nums">{counts.totalStudents}</p>
            <p className="mt-1 text-xs text-slate-400">Active BCCI student roster</p>
          </div>
        </div>
      </section>

      {/* 7-Module Cybersecurity Academy Curriculum */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">
              CyberTech Academy Curriculum
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Seven structured tracks taking college students from foundational cyber hygiene to hands-on forensics,
              web security, and responsible ethical hacking.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(user ? 'academy' : 'auth')}
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            Explore All Modules →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="rounded-xl border border-slate-800/90 bg-[#0D1322] p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Module {String(mod.sort_order).padStart(2, '0')} · {mod.level} ·{' '}
                  <span className="tabular-nums">{mod.lesson_count ?? 0} lessons</span>
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-slate-100">{mod.name}</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{mod.description}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-sky-400 font-medium">Includes terminal lab & quiz</span>
                <button
                  type="button"
                  onClick={() => onNavigate(user ? 'academy' : 'auth')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Open Track
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTF & Hack4Gov Practice Arena Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-xl border border-slate-800 bg-[#0D1322] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center space-y-5">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <Award className="w-4 h-4" aria-hidden="true" />
              <span>Hack4Gov & Competition Readiness</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">
              Isolated Capture The Flag Training Arena
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Practice across 9 competition categories—General Skills, Cryptography, Web Exploitation, Digital Forensics,
              Networking, Linux, Reverse Engineering, OSINT, and Steganography—with server-verified flags and progressive hints.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-slate-100">Guided Exercises</p>
                  <p className="text-xs text-slate-400">Safe in-browser terminal</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-slate-100">Server-Verified Flags</p>
                  <p className="text-xs text-slate-400">No answers exposed in source</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 min-h-[260px]">
            {!diagramImgError ? (
              <img
                src="/src/assets/images/academy_network_diagram_1795543405447.jpg"
                alt="Layered network defense architecture diagram"
                referrerPolicy="no-referrer"
                onError={() => setDiagramImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#090E1A] flex items-center justify-center p-8 text-slate-400 text-sm">
                Controlled Sandbox Training Topology
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Events & Society Announcements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-50">Latest Society Notices</h2>
            <button
              type="button"
              onClick={() => onNavigate('events')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              All Notices & Schedule →
            </button>
          </div>
          <div className="divide-y divide-slate-800/90 rounded-xl border border-slate-800 bg-[#0D1322]">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5 space-y-1.5">
                <p className="text-xs text-slate-400">
                  {ann.category} · {new Date(ann.created_at).toLocaleDateString()}
                  {ann.pinned ? ' · Pinned' : ''}
                </p>
                <h3 className="font-display text-base font-semibold text-slate-100">{ann.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-50">CTF Calendar</h2>
            <Calendar className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            {events.slice(0, 3).map((ev) => (
              <div key={ev.id} className="rounded-xl border border-slate-800 bg-[#0D1322] p-5 space-y-2">
                <p className="text-xs font-medium text-emerald-400 capitalize">
                  {ev.status} · {new Date(ev.start_date).toLocaleDateString()}
                </p>
                <h3 className="font-display text-base font-semibold text-slate-100">{ev.title}</h3>
                <p className="text-xs text-slate-400">{ev.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
