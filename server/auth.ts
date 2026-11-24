import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';

export interface AuthUser {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: 'student' | 'admin';
  student_id: string;
  year_level: string;
  bio: string;
  total_points: number;
  is_active: number;
  created_at: string;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
  sessionTokenHash?: string;
}

const TOKEN_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = crypto.scryptSync(password, salt, 64);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

export function hashSessionToken(token: string): string {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(token).digest('hex');
}

export function createSession(userId: number): string {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    tokenHash,
    userId,
    expiresAt
  );
  return rawToken;
}

export function deleteSession(tokenHash: string): void {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function hasAnyAdmin(): boolean {
  const row = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'").get() as { cnt: number };
  return row.cnt > 0;
}

export function checkRateLimit(identifier: string, ipAddress: string): { allowed: boolean; waitSeconds: number } {
  const row = db
    .prepare('SELECT attempts, locked_until FROM login_attempts WHERE identifier = ? AND ip_address = ?')
    .get(identifier.toLowerCase(), ipAddress) as { attempts: number; locked_until: string | null } | undefined;

  if (!row || !row.locked_until) {
    return { allowed: true, waitSeconds: 0 };
  }

  const lockTime = Date.parse(row.locked_until);
  if (Number.isNaN(lockTime) || lockTime <= Date.now()) {
    return { allowed: true, waitSeconds: 0 };
  }

  return { allowed: false, waitSeconds: Math.ceil((lockTime - Date.now()) / 1000) };
}

export function recordFailedLogin(identifier: string, ipAddress: string): void {
  const key = identifier.toLowerCase();
  const existing = db
    .prepare('SELECT id, attempts FROM login_attempts WHERE identifier = ? AND ip_address = ?')
    .get(key, ipAddress) as { id: number; attempts: number } | undefined;

  if (!existing) {
    db.prepare(
      'INSERT INTO login_attempts (identifier, ip_address, attempts, locked_until) VALUES (?, ?, 1, NULL)'
    ).run(key, ipAddress);
    return;
  }

  const nextAttempts = existing.attempts + 1;
  const lockedUntil = nextAttempts >= 5 ? new Date(Date.now() + 5 * 60 * 1000).toISOString() : null;
  db.prepare(
    "UPDATE login_attempts SET attempts = ?, locked_until = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(nextAttempts, lockedUntil, existing.id);
}

export function clearFailedLogins(identifier: string, ipAddress: string): void {
  db.prepare('DELETE FROM login_attempts WHERE identifier = ? AND ip_address = ?').run(
    identifier.toLowerCase(),
    ipAddress
  );
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function attachUserIfPresent(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    next();
    return;
  }

  const tokenHash = hashSessionToken(token);
  const row = db
    .prepare(
      `SELECT u.id, u.full_name, u.username, u.email, u.role, u.student_id, u.year_level,
              u.bio, u.total_points, u.is_active, u.created_at, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`
    )
    .get(tokenHash) as (AuthUser & { expires_at: string }) | undefined;

  if (!row || !row.is_active || Date.parse(row.expires_at) <= Date.now()) {
    if (row) deleteSession(tokenHash);
    next();
    return;
  }

  const { expires_at: _exp, ...user } = row;
  req.user = user;
  req.sessionTokenHash = tokenHash;
  next();
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator privileges required.' });
    return;
  }
  next();
}
