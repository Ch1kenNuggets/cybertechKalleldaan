import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Express, Request, Response } from 'express';
import { db, CTF_FILES_DIR, UPLOADS_DIR, logActivity } from './db.ts';
import {
  type AuthedRequest,
  attachUserIfPresent,
  checkRateLimit,
  clearFailedLogins,
  createSession,
  deleteSession,
  hasAnyAdmin,
  hashPassword,
  recordFailedLogin,
  requireAdmin,
  requireAuth,
  verifyPassword,
} from './auth.ts';
import { runSandboxCommand } from './sandbox.ts';
import type { QuizQuestion } from './seedData.ts';

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || '127.0.0.1';
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || `item-${Date.now()}`
  );
}

function computeUserBadges(userId: number): { id: string; title: string; description: string }[] {
  const solvedCountRow = db
    .prepare('SELECT COUNT(DISTINCT challenge_id) as cnt FROM challenge_submissions WHERE user_id = ? AND is_correct = 1')
    .get(userId) as { cnt: number };
  const lessonsCountRow = db
    .prepare('SELECT COUNT(*) as cnt FROM lesson_progress WHERE user_id = ?')
    .get(userId) as { cnt: number };

  const solvedCats = db
    .prepare(
      `SELECT DISTINCT cc.slug
       FROM challenge_submissions cs
       JOIN challenges c ON c.id = cs.challenge_id
       JOIN challenge_categories cc ON cc.id = c.category_id
       WHERE cs.user_id = ? AND cs.is_correct = 1`
    )
    .all(userId) as { slug: string }[];
  const catSet = new Set(solvedCats.map((r) => r.slug));

  const badges: { id: string; title: string; description: string }[] = [];
  if (solvedCountRow.cnt >= 1) {
    badges.push({ id: 'first-flag', title: 'First Flag Captured', description: 'Solved your first CTF challenge.' });
  }
  if (solvedCountRow.cnt >= 5) {
    badges.push({ id: 'ctf-contender', title: 'Hack4Gov Contender', description: 'Captured 5 or more verified CTF flags.' });
  }
  if (lessonsCountRow.cnt >= 5) {
    badges.push({ id: 'academy-initiate', title: 'Academy Initiate', description: 'Completed 5 cybersecurity lessons.' });
  }
  if (lessonsCountRow.cnt >= 20) {
    badges.push({ id: 'academy-scholar', title: 'CyberTech Scholar', description: 'Completed 20+ Academy lessons.' });
  }
  if (catSet.has('cryptography')) {
    badges.push({ id: 'crypto-breaker', title: 'Cipher Breaker', description: 'Solved a Cryptography challenge.' });
  }
  if (catSet.has('web-exploitation')) {
    badges.push({ id: 'web-defender', title: 'Web Security Analyst', description: 'Solved a Web Exploitation challenge.' });
  }
  if (catSet.has('digital-forensics')) {
    badges.push({ id: 'forensic-eye', title: 'Forensic Investigator', description: 'Solved a Digital Forensics challenge.' });
  }
  return badges;
}

function computeUserRank(userId: number): number {
  const rows = db
    .prepare("SELECT id FROM users WHERE is_active = 1 AND role = 'student' ORDER BY total_points DESC, created_at ASC")
    .all() as { id: number }[];
  const idx = rows.findIndex((r) => r.id === userId);
  return idx >= 0 ? idx + 1 : 0;
}

export function registerRoutes(app: Express): void {
  app.use('/api', attachUserIfPresent);

  // --- Auth & Account Routes ---
  app.get('/api/auth/status', (req: AuthedRequest, res: Response) => {
    const adminPasscodeConfigured = Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length > 0);
    res.json({
      authenticated: Boolean(req.user),
      user: req.user ?? null,
      hasAdmin: hasAnyAdmin(),
      adminPasscodeConfigured,
    });
  });

  app.post('/api/auth/register', (req: AuthedRequest, res: Response) => {
    const fullName = String(req.body?.fullName ?? '').trim();
    const username = String(req.body?.username ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const studentId = String(req.body?.studentId ?? '').trim();
    const yearLevel = String(req.body?.yearLevel ?? '1st Year BSIT').trim();

    if (fullName.length < 2 || fullName.length > 80) {
      res.status(400).json({ error: 'Full name must be between 2 and 80 characters.' });
      return;
    }
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
      res.status(400).json({ error: 'Username must be 3–30 characters (letters, numbers, _, ., -).' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    const exists = db
      .prepare('SELECT id FROM users WHERE lower(username) = lower(?) OR lower(email) = lower(?)')
      .get(username, email);
    if (exists) {
      res.status(409).json({ error: 'That username or email is already registered.' });
      return;
    }

    const passwordHash = hashPassword(password);
    const info = db
      .prepare(
        `INSERT INTO users (full_name, username, email, password_hash, role, student_id, year_level)
         VALUES (?, ?, ?, ?, 'student', ?, ?)`
      )
      .run(fullName, username, email, passwordHash, studentId, yearLevel);

    const userId = Number(info.lastInsertRowid);
    logActivity(userId, 'register', `Student account registered: ${username}`);
    const token = createSession(userId);
    const user = db
      .prepare('SELECT id, full_name, username, email, role, student_id, year_level, bio, total_points, is_active, created_at FROM users WHERE id = ?')
      .get(userId);

    res.status(201).json({ token, user });
  });

  app.post('/api/auth/claim-admin', (req: AuthedRequest, res: Response) => {
    const fullName = String(req.body?.fullName ?? '').trim();
    const username = String(req.body?.username ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const passcode = String(req.body?.passcode ?? '');

    const envPasscode = (process.env.ADMIN_PASSCODE ?? '').trim();
    const adminAlreadyExists = hasAnyAdmin();

    if (envPasscode.length > 0) {
      const a = Buffer.from(passcode);
      const b = Buffer.from(envPasscode);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        res.status(403).json({ error: 'Invalid administrator passcode.' });
        return;
      }
    } else if (adminAlreadyExists) {
      res.status(403).json({ error: 'Initial administrator account has already been claimed.' });
      return;
    }

    if (fullName.length < 2 || !/^[a-zA-Z0-9_.-]{3,30}$/.test(username) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please complete valid name, username, and email fields.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Administrator password must be at least 8 characters.' });
      return;
    }

    const exists = db
      .prepare('SELECT id FROM users WHERE lower(username) = lower(?) OR lower(email) = lower(?)')
      .get(username, email);
    if (exists) {
      res.status(409).json({ error: 'Username or email is already taken.' });
      return;
    }

    const passwordHash = hashPassword(password);
    const info = db
      .prepare(
        `INSERT INTO users (full_name, username, email, password_hash, role, student_id, year_level)
         VALUES (?, ?, ?, ?, 'admin', 'OFFICER', 'CyberTech Officer')`
      )
      .run(fullName, username, email, passwordHash);

    const userId = Number(info.lastInsertRowid);
    logActivity(userId, 'admin_claim', `Administrator account initialized: ${username}`);
    const token = createSession(userId);
    const user = db
      .prepare('SELECT id, full_name, username, email, role, student_id, year_level, bio, total_points, is_active, created_at FROM users WHERE id = ?')
      .get(userId);

    res.status(201).json({ token, user });
  });

  app.post('/api/auth/login', (req: AuthedRequest, res: Response) => {
    const identifier = String(req.body?.identifier ?? '').trim();
    const password = String(req.body?.password ?? '');
    const ip = getClientIp(req);

    if (!identifier || !password) {
      res.status(400).json({ error: 'Username/email and password are required.' });
      return;
    }

    const limit = checkRateLimit(identifier, ip);
    if (!limit.allowed) {
      res.status(429).json({
        error: `Too many failed sign-in attempts. Please wait ${limit.waitSeconds} seconds before trying again.`,
      });
      return;
    }

    const userRow = db
      .prepare(
        `SELECT id, full_name, username, email, password_hash, role, student_id, year_level, bio, total_points, is_active, created_at
         FROM users WHERE lower(username) = lower(?) OR lower(email) = lower(?)`
      )
      .get(identifier, identifier) as (Record<string, unknown> & { id: number; password_hash: string; is_active: number; username: string }) | undefined;

    if (!userRow || !verifyPassword(password, userRow.password_hash)) {
      recordFailedLogin(identifier, ip);
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    if (!userRow.is_active) {
      res.status(403).json({ error: 'This account has been deactivated by an administrator.' });
      return;
    }

    clearFailedLogins(identifier, ip);
    const token = createSession(userRow.id);
    logActivity(userRow.id, 'login', `Signed in: ${userRow.username}`);

    const { password_hash: _pw, ...safeUser } = userRow;
    res.json({ token, user: safeUser });
  });

  app.post('/api/auth/logout', requireAuth, (req: AuthedRequest, res: Response) => {
    if (req.sessionTokenHash) {
      deleteSession(req.sessionTokenHash);
    }
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res: Response) => {
    const userId = req.user!.id;
    const badges = computeUserBadges(userId);
    const rank = computeUserRank(userId);
    const completedLessons = db
      .prepare(
        `SELECT lp.lesson_id, lp.quiz_score, lp.quiz_total, lp.completed_at, l.title, l.slug, lc.name as module_name
         FROM lesson_progress lp
         JOIN lessons l ON l.id = lp.lesson_id
         JOIN lesson_categories lc ON lc.id = l.category_id
         WHERE lp.user_id = ?
         ORDER BY lp.completed_at DESC`
      )
      .all(userId);
    const solvedChallenges = db
      .prepare(
        `SELECT cs.challenge_id, cs.points_awarded, cs.submitted_at, c.title, c.slug, c.difficulty, cc.name as category_name
         FROM challenge_submissions cs
         JOIN challenges c ON c.id = cs.challenge_id
         JOIN challenge_categories cc ON cc.id = c.category_id
         WHERE cs.user_id = ? AND cs.is_correct = 1
         ORDER BY cs.submitted_at DESC`
      )
      .all(userId);

    res.json({
      user: req.user,
      rank,
      badges,
      completedLessons,
      solvedChallenges,
    });
  });

  app.put('/api/auth/profile', requireAuth, (req: AuthedRequest, res: Response) => {
    const userId = req.user!.id;
    const fullName = String(req.body?.fullName ?? req.user!.full_name).trim();
    const studentId = String(req.body?.studentId ?? req.user!.student_id).trim().slice(0, 40);
    const yearLevel = String(req.body?.yearLevel ?? req.user!.year_level).trim().slice(0, 60);
    const bio = String(req.body?.bio ?? req.user!.bio).trim().slice(0, 400);
    const newPassword = String(req.body?.newPassword ?? '');

    if (fullName.length < 2 || fullName.length > 80) {
      res.status(400).json({ error: 'Full name must be 2–80 characters.' });
      return;
    }

    if (newPassword.length > 0) {
      if (newPassword.length < 8) {
        res.status(400).json({ error: 'New password must be at least 8 characters.' });
        return;
      }
      const pwHash = hashPassword(newPassword);
      db.prepare('UPDATE users SET full_name = ?, student_id = ?, year_level = ?, bio = ?, password_hash = ? WHERE id = ?').run(
        fullName,
        studentId,
        yearLevel,
        bio,
        pwHash,
        userId
      );
    } else {
      db.prepare('UPDATE users SET full_name = ?, student_id = ?, year_level = ?, bio = ? WHERE id = ?').run(
        fullName,
        studentId,
        yearLevel,
        bio,
        userId
      );
    }

    logActivity(userId, 'profile_update', 'Updated student profile settings');
    const updated = db
      .prepare('SELECT id, full_name, username, email, role, student_id, year_level, bio, total_points, is_active, created_at FROM users WHERE id = ?')
      .get(userId);
    res.json({ user: updated });
  });

  // --- Public Overview & Announcements & Events ---
  app.get('/api/overview', (_req: AuthedRequest, res: Response) => {
    const modules = db
      .prepare(
        `SELECT lc.id, lc.slug, lc.name, lc.description, lc.level, lc.sort_order,
                COUNT(l.id) as lesson_count
         FROM lesson_categories lc
         LEFT JOIN lessons l ON l.category_id = lc.id AND l.is_published = 1
         GROUP BY lc.id
         ORDER BY lc.sort_order ASC`
      )
      .all();

    const challengeStats = db
      .prepare(
        `SELECT cc.slug, cc.name, COUNT(c.id) as count
         FROM challenge_categories cc
         LEFT JOIN challenges c ON c.category_id = cc.id AND c.is_active = 1
         GROUP BY cc.id
         ORDER BY cc.sort_order ASC`
      )
      .all();

    const announcements = db
      .prepare('SELECT id, title, category, content, pinned, created_at FROM announcements ORDER BY pinned DESC, created_at DESC LIMIT 4')
      .all();

    const events = db
      .prepare('SELECT id, slug, title, description, start_date, end_date, status, location FROM ctf_events ORDER BY start_date ASC')
      .all();

    const totalLessons = (db.prepare('SELECT COUNT(*) as cnt FROM lessons WHERE is_published = 1').get() as { cnt: number }).cnt;
    const totalChallenges = (db.prepare('SELECT COUNT(*) as cnt FROM challenges WHERE is_active = 1').get() as { cnt: number }).cnt;
    const totalStudents = (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'student'").get() as { cnt: number }).cnt;

    res.json({
      modules,
      challengeStats,
      announcements,
      events,
      counts: { totalLessons, totalChallenges, totalStudents },
    });
  });

  app.get('/api/announcements', (_req: AuthedRequest, res: Response) => {
    const items = db
      .prepare('SELECT id, title, category, content, pinned, created_at FROM announcements ORDER BY pinned DESC, created_at DESC')
      .all();
    res.json({ announcements: items });
  });

  app.get('/api/resources', (_req: AuthedRequest, res: Response) => {
    const items = db.prepare('SELECT id, title, category, description, file_name, created_at FROM resources ORDER BY created_at DESC').all();
    res.json({ resources: items });
  });

  app.get('/api/events', (req: AuthedRequest, res: Response) => {
    const userId = req.user?.id ?? 0;
    const events = db
      .prepare(
        `SELECT e.id, e.slug, e.title, e.description, e.start_date, e.end_date, e.status, e.location,
                (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id) as participant_count,
                EXISTS(SELECT 1 FROM event_participants ep2 WHERE ep2.event_id = e.id AND ep2.user_id = ?) as is_registered
         FROM ctf_events e
         ORDER BY CASE e.status WHEN 'active' THEN 1 WHEN 'upcoming' THEN 2 ELSE 3 END, e.start_date ASC`
      )
      .all(userId);
    res.json({ events });
  });

  app.post('/api/events/:id/register', requireAuth, (req: AuthedRequest, res: Response) => {
    const eventId = Number(req.params.id);
    const teamName = String(req.body?.teamName ?? 'Solo').trim().slice(0, 60) || 'Solo';
    const eventRow = db.prepare('SELECT id, title, status FROM ctf_events WHERE id = ?').get(eventId) as
      | { id: number; title: string; status: string }
      | undefined;
    if (!eventRow) {
      res.status(404).json({ error: 'CTF event not found.' });
      return;
    }
    if (eventRow.status === 'completed') {
      res.status(400).json({ error: 'Registration is closed for completed events.' });
      return;
    }

    db.prepare(
      'INSERT OR IGNORE INTO event_participants (event_id, user_id, team_name) VALUES (?, ?, ?)'
    ).run(eventId, req.user!.id, teamName);
    logActivity(req.user!.id, 'event_register', `Registered for ${eventRow.title}`);
    res.json({ ok: true });
  });

  // --- Student Dashboard ---
  app.get('/api/dashboard', requireAuth, (req: AuthedRequest, res: Response) => {
    const userId = req.user!.id;
    const totalLessons = (db.prepare('SELECT COUNT(*) as cnt FROM lessons WHERE is_published = 1').get() as { cnt: number }).cnt;
    const completedLessons = (db.prepare('SELECT COUNT(*) as cnt FROM lesson_progress WHERE user_id = ?').get(userId) as { cnt: number }).cnt;

    const totalChallenges = (db.prepare('SELECT COUNT(*) as cnt FROM challenges WHERE is_active = 1').get() as { cnt: number }).cnt;
    const completedChallenges = (
      db
        .prepare('SELECT COUNT(DISTINCT challenge_id) as cnt FROM challenge_submissions WHERE user_id = ? AND is_correct = 1')
        .get(userId) as { cnt: number }
    ).cnt;

    const rank = computeUserRank(userId);
    const badges = computeUserBadges(userId);

    const recommendedLessons = db
      .prepare(
        `SELECT l.id, l.slug, l.title, l.difficulty, l.duration_minutes, lc.slug as module_slug, lc.name as module_name
         FROM lessons l
         JOIN lesson_categories lc ON lc.id = l.category_id
         WHERE l.is_published = 1
           AND l.id NOT IN (SELECT lesson_id FROM lesson_progress WHERE user_id = ?)
         ORDER BY lc.sort_order ASC, l.sort_order ASC
         LIMIT 4`
      )
      .all(userId);

    const announcements = db
      .prepare('SELECT id, title, category, content, pinned, created_at FROM announcements ORDER BY pinned DESC, created_at DESC LIMIT 3')
      .all();

    const activities = db
      .prepare('SELECT id, action_type, summary, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 8')
      .all(userId);

    const moduleProgress = db
      .prepare(
        `SELECT lc.id, lc.slug, lc.name,
                COUNT(l.id) as total_lessons,
                COUNT(lp.id) as completed_lessons
         FROM lesson_categories lc
         LEFT JOIN lessons l ON l.category_id = lc.id AND l.is_published = 1
         LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
         GROUP BY lc.id
         ORDER BY lc.sort_order ASC`
      )
      .all(userId);

    res.json({
      stats: {
        totalLessons,
        completedLessons,
        totalChallenges,
        completedChallenges,
        totalPoints: req.user!.total_points,
        rank,
      },
      badges,
      recommendedLessons,
      announcements,
      activities,
      moduleProgress,
    });
  });

  // --- Academy Modules & Lessons (Protected) ---
  app.get('/api/academy/modules', requireAuth, (req: AuthedRequest, res: Response) => {
    const userId = req.user!.id;
    const modules = db
      .prepare(
        `SELECT lc.id, lc.slug, lc.name, lc.description, lc.level, lc.sort_order,
                COUNT(l.id) as total_lessons,
                COUNT(lp.id) as completed_lessons
         FROM lesson_categories lc
         LEFT JOIN lessons l ON l.category_id = lc.id AND l.is_published = 1
         LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
         GROUP BY lc.id
         ORDER BY lc.sort_order ASC`
      )
      .all(userId);

    const lessons = db
      .prepare(
        `SELECT l.id, l.category_id, lc.slug as module_slug, lc.name as module_name,
                l.slug, l.title, l.difficulty, l.duration_minutes, l.sort_order,
                CASE WHEN lp.id IS NOT NULL THEN 1 ELSE 0 END as completed,
                lp.quiz_score, lp.quiz_total
         FROM lessons l
         JOIN lesson_categories lc ON lc.id = l.category_id
         LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
         WHERE l.is_published = 1
         ORDER BY lc.sort_order ASC, l.sort_order ASC`
      )
      .all(userId);

    res.json({ modules, lessons });
  });

  app.get('/api/academy/lessons/:slug', requireAuth, (req: AuthedRequest, res: Response) => {
    const slug = String(req.params.slug);
    const userId = req.user!.id;

    const lesson = db
      .prepare(
        `SELECT l.*, lc.slug as module_slug, lc.name as module_name
         FROM lessons l
         JOIN lesson_categories lc ON lc.id = l.category_id
         WHERE l.slug = ? AND l.is_published = 1`
      )
      .get(slug) as
      | (Record<string, unknown> & {
          id: number;
          objectives_json: string;
          quiz_json: string;
        })
      | undefined;

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    const progress = db
      .prepare('SELECT quiz_score, quiz_total, completed_at FROM lesson_progress WHERE user_id = ? AND lesson_id = ?')
      .get(userId, lesson.id) as { quiz_score: number; quiz_total: number; completed_at: string } | undefined;

    const objectives = JSON.parse(lesson.objectives_json) as string[];
    const fullQuiz = JSON.parse(lesson.quiz_json) as QuizQuestion[];
    // Strip correctIndex before sending to student client
    const safeQuiz = fullQuiz.map((q) => ({
      question: q.question,
      options: q.options,
    }));

    res.json({
      lesson: {
        id: lesson.id,
        category_id: lesson.category_id,
        module_slug: lesson.module_slug,
        module_name: lesson.module_name,
        slug: lesson.slug,
        title: lesson.title,
        difficulty: lesson.difficulty,
        duration_minutes: lesson.duration_minutes,
        objectives,
        explanation: lesson.explanation,
        examples: lesson.examples,
        exercise_prompt: lesson.exercise_prompt,
        exercise_command_hint: lesson.exercise_command_hint,
        attachment_name: lesson.attachment_name,
        quiz: safeQuiz,
        completed: Boolean(progress),
        progress: progress ?? null,
      },
    });
  });

  app.post('/api/academy/lessons/:id/complete', requireAuth, (req: AuthedRequest, res: Response) => {
    const lessonId = Number(req.params.id);
    const answers = Array.isArray(req.body?.answers) ? (req.body.answers as number[]) : [];

    const lesson = db
      .prepare('SELECT id, title, quiz_json FROM lessons WHERE id = ? AND is_published = 1')
      .get(lessonId) as { id: number; title: string; quiz_json: string } | undefined;

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    const quiz = JSON.parse(lesson.quiz_json) as QuizQuestion[];
    let score = 0;
    const results = quiz.map((q, idx) => {
      const selected = Number(answers[idx]);
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) score += 1;
      return { selected, isCorrect };
    });

    const total = quiz.length;
    const passed = total === 0 || score >= Math.ceil(total * 0.66);

    if (!passed) {
      res.json({
        passed: false,
        score,
        total,
        results,
        message: `You scored ${score}/${total}. Score at least ${Math.ceil(total * 0.66)}/${total} to complete this lesson.`,
      });
      return;
    }

    db.prepare(
      `INSERT INTO lesson_progress (user_id, lesson_id, quiz_score, quiz_total)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET quiz_score = excluded.quiz_score, completed_at = datetime('now')`
    ).run(req.user!.id, lessonId, score, total);

    logActivity(req.user!.id, 'lesson_complete', `Completed lesson: ${lesson.title} (${score}/${total})`);

    res.json({
      passed: true,
      score,
      total,
      results,
      message: `Lesson completed with ${score}/${total} on the assessment.`,
    });
  });

  // --- CTF Arena Routes (Protected; flag_answer NEVER returned!) ---
  app.get('/api/ctf/challenges', requireAuth, (req: AuthedRequest, res: Response) => {
    const userId = req.user!.id;
    const categories = db
      .prepare('SELECT id, slug, name, description, sort_order FROM challenge_categories ORDER BY sort_order ASC')
      .all();

    const challenges = db
      .prepare(
        `SELECT c.id, c.category_id, cc.slug as category_slug, cc.name as category_name,
                c.slug, c.title, c.difficulty, c.points, c.description, c.instructions,
                c.download_file, c.sandbox_preset, c.created_at,
                (SELECT COUNT(DISTINCT user_id) FROM challenge_submissions s WHERE s.challenge_id = c.id AND s.is_correct = 1) as solves_count,
                EXISTS(SELECT 1 FROM challenge_submissions s2 WHERE s2.challenge_id = c.id AND s2.user_id = ? AND s2.is_correct = 1) as is_solved
         FROM challenges c
         JOIN challenge_categories cc ON cc.id = c.category_id
         WHERE c.is_active = 1
         ORDER BY c.points ASC, c.id ASC`
      )
      .all(userId);

    res.json({ categories, challenges });
  });

  app.get('/api/ctf/challenges/:id', requireAuth, (req: AuthedRequest, res: Response) => {
    const chalId = Number(req.params.id);
    const userId = req.user!.id;

    const challenge = db
      .prepare(
        `SELECT c.id, c.category_id, cc.slug as category_slug, cc.name as category_name,
                c.slug, c.title, c.difficulty, c.points, c.description, c.instructions,
                c.download_file, c.sandbox_preset, c.created_at,
                (SELECT COUNT(DISTINCT user_id) FROM challenge_submissions s WHERE s.challenge_id = c.id AND s.is_correct = 1) as solves_count,
                EXISTS(SELECT 1 FROM challenge_submissions s2 WHERE s2.challenge_id = c.id AND s2.user_id = ? AND s2.is_correct = 1) as is_solved
         FROM challenges c
         JOIN challenge_categories cc ON cc.id = c.category_id
         WHERE c.id = ? AND c.is_active = 1`
      )
      .get(userId, chalId);

    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found.' });
      return;
    }

    const hints = db
      .prepare(
        `SELECT ch.id, ch.cost_points, ch.sort_order,
                CASE WHEN hu.id IS NOT NULL THEN ch.hint_text ELSE NULL END as hint_text,
                CASE WHEN hu.id IS NOT NULL THEN 1 ELSE 0 END as is_unlocked
         FROM challenge_hints ch
         LEFT JOIN hint_unlocks hu ON hu.hint_id = ch.id AND hu.user_id = ?
         WHERE ch.challenge_id = ?
         ORDER BY ch.sort_order ASC`
      )
      .all(userId, chalId);

    res.json({ challenge, hints });
  });

  app.post('/api/ctf/challenges/:id/hint', requireAuth, (req: AuthedRequest, res: Response) => {
    const chalId = Number(req.params.id);
    const hintId = Number(req.body?.hintId);
    const userId = req.user!.id;

    const hint = db
      .prepare('SELECT id, challenge_id, hint_text, cost_points FROM challenge_hints WHERE id = ? AND challenge_id = ?')
      .get(hintId, chalId) as { id: number; challenge_id: number; hint_text: string; cost_points: number } | undefined;

    if (!hint) {
      res.status(404).json({ error: 'Hint not found.' });
      return;
    }

    const existing = db
      .prepare('SELECT id FROM hint_unlocks WHERE user_id = ? AND hint_id = ?')
      .get(userId, hintId);
    if (existing) {
      res.json({ hintText: hint.hint_text, costPoints: 0, alreadyUnlocked: true });
      return;
    }

    if (hint.cost_points > 0 && req.user!.total_points < hint.cost_points) {
      res.status(400).json({
        error: `This hint costs ${hint.cost_points} points, and you currently have ${req.user!.total_points} points.`,
      });
      return;
    }

    db.prepare('INSERT INTO hint_unlocks (user_id, hint_id) VALUES (?, ?)').run(userId, hintId);
    if (hint.cost_points > 0) {
      db.prepare('UPDATE users SET total_points = MAX(0, total_points - ?) WHERE id = ?').run(hint.cost_points, userId);
    }

    const updatedUser = db.prepare('SELECT total_points FROM users WHERE id = ?').get(userId) as { total_points: number };
    res.json({ hintText: hint.hint_text, costPoints: hint.cost_points, totalPoints: updatedUser.total_points });
  });

  app.post('/api/ctf/challenges/:id/submit', requireAuth, (req: AuthedRequest, res: Response) => {
    const chalId = Number(req.params.id);
    const submittedFlag = String(req.body?.flag ?? '').trim();
    const userId = req.user!.id;

    if (!submittedFlag) {
      res.status(400).json({ error: 'Please enter a flag before submitting.' });
      return;
    }

    const challenge = db
      .prepare('SELECT id, title, points, flag_answer FROM challenges WHERE id = ? AND is_active = 1')
      .get(chalId) as { id: number; title: string; points: number; flag_answer: string } | undefined;

    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found.' });
      return;
    }

    const alreadySolved = db
      .prepare('SELECT id FROM challenge_submissions WHERE user_id = ? AND challenge_id = ? AND is_correct = 1')
      .get(userId, chalId);

    if (alreadySolved) {
      res.status(409).json({
        correct: true,
        alreadySolved: true,
        message: 'You have already solved this challenge. Duplicate points are not awarded.',
      });
      return;
    }

    const expectedBuf = Buffer.from(challenge.flag_answer.trim(), 'utf8');
    const actualBuf = Buffer.from(submittedFlag, 'utf8');
    const isCorrect = expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (!isCorrect) {
      db.prepare(
        'INSERT INTO challenge_submissions (user_id, challenge_id, submitted_flag, is_correct, points_awarded) VALUES (?, ?, ?, 0, 0)'
      ).run(userId, chalId, submittedFlag.slice(0, 180));

      res.json({
        correct: false,
        message: 'Incorrect flag. Verify your decoding and ensure the format matches CTF{...}.',
      });
      return;
    }

    db.prepare(
      'INSERT INTO challenge_submissions (user_id, challenge_id, submitted_flag, is_correct, points_awarded) VALUES (?, ?, ?, 1, ?)'
    ).run(userId, chalId, '[VERIFIED]', challenge.points);

    db.prepare('UPDATE users SET total_points = total_points + ? WHERE id = ?').run(challenge.points, userId);
    logActivity(userId, 'ctf_solve', `Captured flag for ${challenge.title} (+${challenge.points} pts)`);

    const updatedUser = db.prepare('SELECT total_points FROM users WHERE id = ?').get(userId) as { total_points: number };
    res.json({
      correct: true,
      pointsAwarded: challenge.points,
      totalPoints: updatedUser.total_points,
      message: `Flag accepted! +${challenge.points} points awarded for ${challenge.title}.`,
    });
  });

  // Safe static challenge/resource file download with path confinement
  app.get('/api/files/:filename', requireAuth, (req: AuthedRequest, res: Response) => {
    const requested = path.basename(String(req.params.filename ?? ''));
    if (!requested || !/^[a-zA-Z0-9._-]+$/.test(requested)) {
      res.status(400).json({ error: 'Invalid filename.' });
      return;
    }

    const candidates = [path.resolve(CTF_FILES_DIR, requested), path.resolve(UPLOADS_DIR, requested)];
    for (const candidate of candidates) {
      const validBase =
        candidate.startsWith(CTF_FILES_DIR + path.sep) || candidate.startsWith(UPLOADS_DIR + path.sep);
      if (validBase && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        res.download(candidate, requested);
        return;
      }
    }

    res.status(404).json({ error: 'File not found.' });
  });

  // --- Simulated Sandbox Terminal ---
  app.post('/api/sandbox/terminal', requireAuth, (req: AuthedRequest, res: Response) => {
    const command = String(req.body?.command ?? '').slice(0, 300);
    const output = runSandboxCommand(command);
    res.json({ output });
  });

  // --- Leaderboard & Student Public Profile ---
  app.get('/api/leaderboard', (_req: AuthedRequest, res: Response) => {
    const players = db
      .prepare(
        `SELECT u.id, u.full_name, u.username, u.year_level, u.total_points, u.created_at,
                (SELECT COUNT(DISTINCT cs.challenge_id) FROM challenge_submissions cs WHERE cs.user_id = u.id AND cs.is_correct = 1) as challenges_solved,
                (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = u.id) as lessons_completed
         FROM users u
         WHERE u.is_active = 1 AND u.role = 'student'
         ORDER BY u.total_points DESC, challenges_solved DESC, u.created_at ASC
         LIMIT 50`
      )
      .all();

    const recentSolves = db
      .prepare(
        `SELECT u.username, c.title as challenge_title, cc.name as category_name, cs.points_awarded, cs.submitted_at
         FROM challenge_submissions cs
         JOIN users u ON u.id = cs.user_id
         JOIN challenges c ON c.id = cs.challenge_id
         JOIN challenge_categories cc ON cc.id = c.category_id
         WHERE cs.is_correct = 1
         ORDER BY cs.submitted_at DESC
         LIMIT 15`
      )
      .all();

    res.json({ players, recentSolves });
  });

  app.get('/api/users/:id/profile', requireAuth, (req: AuthedRequest, res: Response) => {
    const targetId = Number(req.params.id);
    const student = db
      .prepare(
        'SELECT id, full_name, username, year_level, bio, total_points, created_at FROM users WHERE id = ? AND is_active = 1'
      )
      .get(targetId) as Record<string, unknown> | undefined;

    if (!student) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    const solves = db
      .prepare(
        `SELECT c.title, c.difficulty, cc.name as category_name, cs.points_awarded, cs.submitted_at
         FROM challenge_submissions cs
         JOIN challenges c ON c.id = cs.challenge_id
         JOIN challenge_categories cc ON cc.id = c.category_id
         WHERE cs.user_id = ? AND cs.is_correct = 1
         ORDER BY cs.submitted_at DESC`
      )
      .all(targetId);

    const badges = computeUserBadges(targetId);
    const rank = computeUserRank(targetId);

    res.json({ student, rank, badges, solves });
  });

  // --- Administrator Routes (Strict RBAC) ---
  app.get('/api/admin/overview', requireAdmin, (_req: AuthedRequest, res: Response) => {
    const stats = {
      totalUsers: (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }).cnt,
      totalStudents: (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'student'").get() as { cnt: number }).cnt,
      totalLessons: (db.prepare('SELECT COUNT(*) as cnt FROM lessons').get() as { cnt: number }).cnt,
      totalChallenges: (db.prepare('SELECT COUNT(*) as cnt FROM challenges').get() as { cnt: number }).cnt,
      totalSubmissions: (db.prepare('SELECT COUNT(*) as cnt FROM challenge_submissions').get() as { cnt: number }).cnt,
      correctSubmissions: (
        db.prepare('SELECT COUNT(*) as cnt FROM challenge_submissions WHERE is_correct = 1').get() as { cnt: number }
      ).cnt,
    };

    const users = db
      .prepare(
        `SELECT u.id, u.full_name, u.username, u.email, u.role, u.student_id, u.year_level, u.total_points, u.is_active, u.created_at,
                (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = u.id) as lessons_completed,
                (SELECT COUNT(DISTINCT cs.challenge_id) FROM challenge_submissions cs WHERE cs.user_id = u.id AND cs.is_correct = 1) as challenges_solved
         FROM users u
         ORDER BY u.created_at DESC`
      )
      .all();

    const submissions = db
      .prepare(
        `SELECT cs.id, u.username, c.title as challenge_title, cs.submitted_flag, cs.is_correct, cs.points_awarded, cs.submitted_at
         FROM challenge_submissions cs
         JOIN users u ON u.id = cs.user_id
         JOIN challenges c ON c.id = cs.challenge_id
         ORDER BY cs.submitted_at DESC
         LIMIT 50`
      )
      .all();

    const lessons = db
      .prepare(
        `SELECT l.id, l.category_id, lc.name as module_name, l.slug, l.title, l.difficulty, l.duration_minutes, l.is_published,
                l.objectives_json, l.explanation, l.examples, l.exercise_prompt, l.exercise_command_hint, l.quiz_json, l.attachment_name
         FROM lessons l
         JOIN lesson_categories lc ON lc.id = l.category_id
         ORDER BY lc.sort_order ASC, l.sort_order ASC`
      )
      .all();

    const challenges = db
      .prepare(
        `SELECT c.id, c.category_id, cc.name as category_name, c.slug, c.title, c.difficulty, c.points,
                c.description, c.instructions, c.download_file, c.is_active,
                (SELECT COUNT(*) FROM challenge_hints ch WHERE ch.challenge_id = c.id) as hints_count
         FROM challenges c
         JOIN challenge_categories cc ON cc.id = c.category_id
         ORDER BY c.id DESC`
      )
      .all();

    res.json({ stats, users, submissions, lessons, challenges });
  });

  app.patch('/api/admin/users/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const targetId = Number(req.params.id);
    if (targetId === req.user!.id && req.body?.is_active === false) {
      res.status(400).json({ error: 'You cannot deactivate your own active admin account.' });
      return;
    }

    if (typeof req.body?.is_active === 'boolean') {
      db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(req.body.is_active ? 1 : 0, targetId);
    }
    if (req.body?.role === 'student' || req.body?.role === 'admin') {
      if (targetId === req.user!.id && req.body.role !== 'admin') {
        res.status(400).json({ error: 'Cannot remove your own admin role.' });
        return;
      }
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run(req.body.role, targetId);
    }
    logActivity(req.user!.id, 'admin_user_update', `Updated user #${targetId}`);
    res.json({ ok: true });
  });

  app.post('/api/admin/lessons', requireAdmin, (req: AuthedRequest, res: Response) => {
    const categoryId = Number(req.body?.categoryId);
    const title = String(req.body?.title ?? '').trim();
    const difficulty = String(req.body?.difficulty ?? 'Beginner');
    const durationMinutes = Number(req.body?.durationMinutes ?? 15);
    const explanation = String(req.body?.explanation ?? '').trim();
    const examples = String(req.body?.examples ?? '').trim();
    const exercisePrompt = String(req.body?.exercisePrompt ?? 'Practice in the terminal.').trim();
    const exerciseCommandHint = String(req.body?.exerciseCommandHint ?? 'help').trim();
    const objectives = Array.isArray(req.body?.objectives) ? req.body.objectives : ['Understand core concept.'];
    const quiz = Array.isArray(req.body?.quiz) && req.body.quiz.length > 0
      ? req.body.quiz
      : [{ question: `Key takeaway from ${title}?`, options: ['Security by design', 'Ignore updates', 'Use plaintext'], correctIndex: 0 }];

    if (!categoryId || !title || !explanation) {
      res.status(400).json({ error: 'Module, title, and explanation are required.' });
      return;
    }

    const slug = `${slugify(title)}-${Date.now().toString().slice(-4)}`;
    db.prepare(
      `INSERT INTO lessons (category_id, slug, title, difficulty, duration_minutes, sort_order, objectives_json, explanation, examples, exercise_prompt, exercise_command_hint, quiz_json)
       VALUES (?, ?, ?, ?, ?, 99, ?, ?, ?, ?, ?, ?)`
    ).run(
      categoryId,
      slug,
      title,
      difficulty,
      durationMinutes,
      JSON.stringify(objectives),
      explanation,
      examples,
      exercisePrompt,
      exerciseCommandHint,
      JSON.stringify(quiz)
    );

    logActivity(req.user!.id, 'admin_lesson_create', `Published lesson: ${title}`);
    res.status(201).json({ ok: true, slug });
  });

  app.put('/api/admin/lessons/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const id = Number(req.params.id);
    const title = String(req.body?.title ?? '').trim();
    const difficulty = String(req.body?.difficulty ?? 'Beginner');
    const explanation = String(req.body?.explanation ?? '').trim();
    const examples = String(req.body?.examples ?? '').trim();
    const isPublished = req.body?.is_published === false ? 0 : 1;

    if (!title || !explanation) {
      res.status(400).json({ error: 'Title and explanation are required.' });
      return;
    }

    db.prepare(
      'UPDATE lessons SET title = ?, difficulty = ?, explanation = ?, examples = ?, is_published = ? WHERE id = ?'
    ).run(title, difficulty, explanation, examples, isPublished, id);

    logActivity(req.user!.id, 'admin_lesson_edit', `Updated lesson #${id}`);
    res.json({ ok: true });
  });

  app.post('/api/admin/challenges', requireAdmin, (req: AuthedRequest, res: Response) => {
    const categoryId = Number(req.body?.categoryId);
    const title = String(req.body?.title ?? '').trim();
    const difficulty = String(req.body?.difficulty ?? 'Beginner');
    const points = Math.max(10, Number(req.body?.points ?? 100));
    const description = String(req.body?.description ?? '').trim();
    const instructions = String(req.body?.instructions ?? '').trim();
    const flagAnswer = String(req.body?.flag ?? '').trim();
    const hintText = String(req.body?.hintText ?? '').trim();
    const hintCost = Math.max(0, Number(req.body?.hintCost ?? 0));

    if (!categoryId || !title || !description || !flagAnswer) {
      res.status(400).json({ error: 'Category, title, description, and flag answer are required.' });
      return;
    }

    const slug = `${slugify(title)}-${Date.now().toString().slice(-4)}`;
    const info = db
      .prepare(
        `INSERT INTO challenges (category_id, slug, title, difficulty, points, description, instructions, flag_answer)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(categoryId, slug, title, difficulty, points, description, instructions || description, flagAnswer);

    const chalId = Number(info.lastInsertRowid);
    if (hintText) {
      db.prepare('INSERT INTO challenge_hints (challenge_id, hint_text, cost_points, sort_order) VALUES (?, ?, ?, 1)').run(
        chalId,
        hintText,
        hintCost
      );
    }

    logActivity(req.user!.id, 'admin_challenge_create', `Created CTF challenge: ${title} (${points} pts)`);
    res.status(201).json({ ok: true, id: chalId });
  });

  app.post('/api/admin/challenges/:id/hints', requireAdmin, (req: AuthedRequest, res: Response) => {
    const chalId = Number(req.params.id);
    const hintText = String(req.body?.hintText ?? '').trim();
    const costPoints = Math.max(0, Number(req.body?.costPoints ?? 0));
    if (!hintText) {
      res.status(400).json({ error: 'Hint text is required.' });
      return;
    }
    db.prepare('INSERT INTO challenge_hints (challenge_id, hint_text, cost_points, sort_order) VALUES (?, ?, ?, 1)').run(
      chalId,
      hintText,
      costPoints
    );
    res.status(201).json({ ok: true });
  });

  app.post('/api/admin/events', requireAdmin, (req: AuthedRequest, res: Response) => {
    const title = String(req.body?.title ?? '').trim();
    const description = String(req.body?.description ?? '').trim();
    const startDate = String(req.body?.startDate ?? '').trim();
    const endDate = String(req.body?.endDate ?? '').trim();
    const status = ['upcoming', 'active', 'completed'].includes(req.body?.status) ? req.body.status : 'upcoming';
    const location = String(req.body?.location ?? 'Online Arena').trim();

    if (!title || !startDate || !endDate) {
      res.status(400).json({ error: 'Title, start date, and end date are required.' });
      return;
    }

    const slug = `${slugify(title)}-${Date.now().toString().slice(-4)}`;
    db.prepare(
      'INSERT INTO ctf_events (slug, title, description, start_date, end_date, status, location) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(slug, title, description, startDate, endDate, status, location);

    logActivity(req.user!.id, 'admin_event_create', `Scheduled CTF event: ${title}`);
    res.status(201).json({ ok: true });
  });

  app.post('/api/admin/announcements', requireAdmin, (req: AuthedRequest, res: Response) => {
    const title = String(req.body?.title ?? '').trim();
    const category = String(req.body?.category ?? 'General').trim();
    const content = String(req.body?.content ?? '').trim();
    const pinned = req.body?.pinned ? 1 : 0;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required.' });
      return;
    }

    db.prepare('INSERT INTO announcements (title, category, content, pinned, author_id) VALUES (?, ?, ?, ?, ?)').run(
      title,
      category,
      content,
      pinned,
      req.user!.id
    );
    logActivity(req.user!.id, 'admin_announcement', `Published announcement: ${title}`);
    res.status(201).json({ ok: true });
  });

  app.delete('/api/admin/announcements/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
    res.json({ ok: true });
  });

  // Safe text/markdown/json learning resource upload (validates extension & size)
  app.post('/api/admin/resources', requireAdmin, (req: AuthedRequest, res: Response) => {
    const title = String(req.body?.title ?? '').trim();
    const category = String(req.body?.category ?? 'Study Guide').trim();
    const description = String(req.body?.description ?? '').trim();
    const rawFileName = String(req.body?.fileName ?? '').trim();
    const content = String(req.body?.content ?? '');

    if (!title || !rawFileName || !content) {
      res.status(400).json({ error: 'Title, filename, and resource content are required.' });
      return;
    }

    const cleanName = path.basename(rawFileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(cleanName).toLowerCase();
    const allowedExt = new Set(['.txt', '.md', '.csv', '.json', '.log']);
    if (!allowedExt.has(ext)) {
      res.status(400).json({ error: 'Only .txt, .md, .csv, .json, or .log educational resources are permitted.' });
      return;
    }
    if (content.length > 200_000) {
      res.status(400).json({ error: 'File content exceeds 200KB limit.' });
      return;
    }

    const target = path.resolve(UPLOADS_DIR, cleanName);
    if (!target.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid upload path.' });
      return;
    }

    fs.writeFileSync(target, content, 'utf8');
    db.prepare('INSERT INTO resources (title, category, description, file_name) VALUES (?, ?, ?, ?)').run(
      title,
      category,
      description,
      cleanName
    );
    logActivity(req.user!.id, 'admin_resource_upload', `Uploaded resource: ${cleanName}`);
    res.status(201).json({ ok: true, fileName: cleanName });
  });

  app.get('/api/admin/reports/csv', requireAdmin, (_req: AuthedRequest, res: Response) => {
    const rows = db
      .prepare(
        `SELECT u.id, u.username, u.full_name, u.email, u.year_level, u.total_points,
                (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = u.id) as lessons_completed,
                (SELECT COUNT(DISTINCT cs.challenge_id) FROM challenge_submissions cs WHERE cs.user_id = u.id AND cs.is_correct = 1) as challenges_solved
         FROM users u
         WHERE u.role = 'student'
         ORDER BY u.total_points DESC`
      )
      .all() as {
      id: number;
      username: string;
      full_name: string;
      email: string;
      year_level: string;
      total_points: number;
      lessons_completed: number;
      challenges_solved: number;
    }[];

    const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
    const header = 'ID,Username,Full Name,Email,Year Level,Total Points,Lessons Completed,Challenges Solved';
    const lines = rows.map((r) =>
      [r.id, r.username, r.full_name, r.email, r.year_level, r.total_points, r.lessons_completed, r.challenges_solved]
        .map(escapeCsv)
        .join(',')
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="cybertech_academy_report.csv"');
    res.send([header, ...lines].join('\n'));
  });
}
