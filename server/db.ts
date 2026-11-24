import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import {
  SEED_MODULES,
  SEED_LESSONS,
  SEED_CHALLENGE_CATEGORIES,
  SEED_CHALLENGES,
  SEED_EVENTS,
  SEED_ANNOUNCEMENTS,
} from './seedData.ts';

const DB_PATH = path.resolve(process.cwd(), 'cybertech_academy.db');
export const CTF_FILES_DIR = path.resolve(process.cwd(), 'server', 'ctf_files');
export const UPLOADS_DIR = path.resolve(process.cwd(), 'server', 'uploads');

export const db = new DatabaseSync(DB_PATH);

export function initDatabase(): void {
  fs.mkdirSync(CTF_FILES_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      student_id TEXT DEFAULT '',
      year_level TEXT DEFAULT '1st Year BSIT',
      bio TEXT DEFAULT '',
      total_points INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(identifier, ip_address)
    );

    CREATE TABLE IF NOT EXISTS lesson_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'Beginner',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'Beginner',
      duration_minutes INTEGER NOT NULL DEFAULT 15,
      sort_order INTEGER NOT NULL DEFAULT 0,
      objectives_json TEXT NOT NULL,
      explanation TEXT NOT NULL,
      examples TEXT NOT NULL,
      exercise_prompt TEXT NOT NULL,
      exercise_command_hint TEXT NOT NULL DEFAULT '',
      quiz_json TEXT NOT NULL,
      attachment_name TEXT DEFAULT NULL,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES lesson_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      quiz_score INTEGER NOT NULL DEFAULT 0,
      quiz_total INTEGER NOT NULL DEFAULT 3,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS challenge_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'Beginner',
      points INTEGER NOT NULL DEFAULT 100,
      description TEXT NOT NULL,
      instructions TEXT NOT NULL,
      flag_answer TEXT NOT NULL,
      download_file TEXT DEFAULT NULL,
      sandbox_preset TEXT DEFAULT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES challenge_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS challenge_hints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      hint_text TEXT NOT NULL,
      cost_points INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hint_unlocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      hint_id INTEGER NOT NULL,
      unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, hint_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (hint_id) REFERENCES challenge_hints(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS challenge_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      submitted_flag TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0,
      points_awarded INTEGER NOT NULL DEFAULT 0,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_user_chal ON challenge_submissions(user_id, challenge_id, is_correct);

    CREATE TABLE IF NOT EXISTS ctf_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
      location TEXT NOT NULL DEFAULT 'Online Arena',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS event_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      team_name TEXT DEFAULT 'Solo',
      registered_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(event_id, user_id),
      FOREIGN KEY (event_id) REFERENCES ctf_events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      content TEXT NOT NULL,
      pinned INTEGER NOT NULL DEFAULT 0,
      author_id INTEGER DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      action_type TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      file_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedInitialContent();
}

function seedInitialContent(): void {
  const existingModules = db.prepare('SELECT COUNT(*) as cnt FROM lesson_categories').get() as { cnt: number };
  if (existingModules.cnt === 0) {
    const insertMod = db.prepare(
      'INSERT INTO lesson_categories (slug, name, description, level, sort_order) VALUES (?, ?, ?, ?, ?)'
    );
    for (const mod of SEED_MODULES) {
      insertMod.run(mod.slug, mod.name, mod.description, mod.level, mod.sortOrder);
    }
  }

  const existingLessons = db.prepare('SELECT COUNT(*) as cnt FROM lessons').get() as { cnt: number };
  if (existingLessons.cnt === 0) {
    const getCat = db.prepare('SELECT id FROM lesson_categories WHERE slug = ?');
    const insertLesson = db.prepare(`
      INSERT INTO lessons (
        category_id, slug, title, difficulty, duration_minutes, sort_order,
        objectives_json, explanation, examples, exercise_prompt, exercise_command_hint, quiz_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const lesson of SEED_LESSONS) {
      const cat = getCat.get(lesson.categorySlug) as { id: number } | undefined;
      if (!cat) continue;
      insertLesson.run(
        cat.id,
        lesson.slug,
        lesson.title,
        lesson.difficulty,
        lesson.durationMinutes,
        lesson.sortOrder,
        JSON.stringify(lesson.objectives),
        lesson.explanation,
        lesson.examples,
        lesson.exercisePrompt,
        lesson.exerciseCommandHint,
        JSON.stringify(lesson.quiz)
      );
    }
  }

  const existingChalCats = db.prepare('SELECT COUNT(*) as cnt FROM challenge_categories').get() as { cnt: number };
  if (existingChalCats.cnt === 0) {
    const insertCat = db.prepare(
      'INSERT INTO challenge_categories (slug, name, description, sort_order) VALUES (?, ?, ?, ?)'
    );
    for (const cat of SEED_CHALLENGE_CATEGORIES) {
      insertCat.run(cat.slug, cat.name, cat.description, cat.sortOrder);
    }
  }

  const existingChals = db.prepare('SELECT COUNT(*) as cnt FROM challenges').get() as { cnt: number };
  if (existingChals.cnt === 0) {
    const getCat = db.prepare('SELECT id FROM challenge_categories WHERE slug = ?');
    const insertChal = db.prepare(`
      INSERT INTO challenges (
        category_id, slug, title, difficulty, points, description, instructions,
        flag_answer, download_file, sandbox_preset
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertHint = db.prepare(
      'INSERT INTO challenge_hints (challenge_id, hint_text, cost_points, sort_order) VALUES (?, ?, ?, ?)'
    );

    for (const ch of SEED_CHALLENGES) {
      const cat = getCat.get(ch.categorySlug) as { id: number } | undefined;
      if (!cat) continue;

      if (ch.downloadFileName && ch.downloadFileContent) {
        const safeName = path.basename(ch.downloadFileName);
        fs.writeFileSync(path.join(CTF_FILES_DIR, safeName), ch.downloadFileContent, 'utf8');
      }

      const info = insertChal.run(
        cat.id,
        ch.slug,
        ch.title,
        ch.difficulty,
        ch.points,
        ch.description,
        ch.instructions,
        ch.flag,
        ch.downloadFileName ?? null,
        ch.sandboxPreset ?? null
      );

      const chalId = Number(info.lastInsertRowid);
      ch.hints.forEach((hint, idx) => {
        insertHint.run(chalId, hint.text, hint.cost, idx + 1);
      });
    }
  } else {
    // Ensure seeded CTF files exist on disk
    for (const ch of SEED_CHALLENGES) {
      if (ch.downloadFileName && ch.downloadFileContent) {
        const safeName = path.basename(ch.downloadFileName);
        const target = path.join(CTF_FILES_DIR, safeName);
        if (!fs.existsSync(target)) {
          fs.writeFileSync(target, ch.downloadFileContent, 'utf8');
        }
      }
    }
  }

  const existingEvents = db.prepare('SELECT COUNT(*) as cnt FROM ctf_events').get() as { cnt: number };
  if (existingEvents.cnt === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO ctf_events (slug, title, description, start_date, end_date, status, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ev of SEED_EVENTS) {
      insertEvent.run(ev.slug, ev.title, ev.description, ev.startDate, ev.endDate, ev.status, ev.location);
    }
  }

  const existingAnnouncements = db.prepare('SELECT COUNT(*) as cnt FROM announcements').get() as { cnt: number };
  if (existingAnnouncements.cnt === 0) {
    const insertAnn = db.prepare(
      'INSERT INTO announcements (title, category, content, pinned) VALUES (?, ?, ?, ?)'
    );
    for (const ann of SEED_ANNOUNCEMENTS) {
      insertAnn.run(ann.title, ann.category, ann.content, ann.pinned);
    }
  }

  const existingResources = db.prepare('SELECT COUNT(*) as cnt FROM resources').get() as { cnt: number };
  if (existingResources.cnt === 0) {
    const guides: { title: string; category: string; description: string; fileName: string; content: string }[] = [
      {
        title: 'Hack4Gov Competitor Field Manual',
        category: 'CTF Prep',
        description: 'Quick-reference commands for Base64, Caesar/XOR, Linux grep pipelines, HTTP inspection, and log forensics.',
        fileName: 'hack4gov_field_manual.txt',
        content: `CYBERTECH SOCIETY - BCCI | HACK4GOV FIELD MANUAL
====================================================
1. ENCODING SIGNATURES
   - Base64: ends with '=' or '=='; "CTF{" starts with "Q1RGe"
   - Hex: pairs of 0-9, a-f; "CTF{" starts with "4354467b"
2. LINUX LOG TRIAGE
   - ls -la                  -> list hidden dotfiles
   - grep -i "pattern" file  -> search case-insensitive
   - strings binary | grep CTF
3. WEB SECURITY CHECKS
   - Always use PDO prepared statements (? placeholders)
   - Always escape HTML with htmlspecialchars($s, ENT_QUOTES, 'UTF-8')
   - Never trust cookies, hidden inputs, or client JS
4. ETHICS & SCOPE
   - Test only authorized CTF targets and isolated sandboxes.
`,
      },
      {
        title: 'Common TCP & UDP Ports Cheat Sheet',
        category: 'Networking',
        description: 'Essential well-known service ports, cleartext risks, and secure protocol replacements.',
        fileName: 'common_ports_cheatsheet.txt',
        content: `COMMON NETWORK PORTS REFERENCE
===============================
21/TCP   FTP     Cleartext file transfer (Prefer SFTP on 22)
22/TCP   SSH     Encrypted remote shell & SFTP
23/TCP   Telnet  Insecure cleartext shell (Disable!)
25/TCP   SMTP    Email transfer
53/UDP   DNS     Domain name resolution
80/TCP   HTTP    Unencrypted web
443/TCP  HTTPS   TLS-encrypted web
3306/TCP MySQL   Database server (Restrict to localhost/internal subnet)
`,
      },
      {
        title: 'Linux Security Commands Pocket Guide',
        category: 'Linux',
        description: 'Permissions math (rwx = 4/2/1), socket inspection, process triage, and log locations.',
        fileName: 'linux_security_pocket_guide.txt',
        content: `LINUX SECURITY POCKET GUIDE
===========================
PERMISSIONS:
  4 = Read (r), 2 = Write (w), 1 = Execute (x)
  chmod 600 secret.key  -> Owner RW only
  chmod 755 run.sh      -> Owner RWX, others RX

KEY DIRECTORIES:
  /etc       System configuration
  /var/log   Authentication, web, and daemon logs
  /tmp       Temporary files (check during forensics!)

TRIAGE COMMANDS:
  id / whoami       Verify current identity
  ss -tuln          Listening TCP/UDP ports
  ps aux            Running processes
`,
      },
    ];

    const insertRes = db.prepare(
      'INSERT INTO resources (title, category, description, file_name) VALUES (?, ?, ?, ?)'
    );
    for (const g of guides) {
      const safeName = path.basename(g.fileName);
      fs.writeFileSync(path.join(CTF_FILES_DIR, safeName), g.content, 'utf8');
      insertRes.run(g.title, g.category, g.description, safeName);
    }
  }
}

export function logActivity(userId: number | null, actionType: string, summary: string): void {
  db.prepare('INSERT INTO activity_logs (user_id, action_type, summary) VALUES (?, ?, ?)').run(
    userId,
    actionType,
    summary
  );
}
