import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Admin login security store — permanent IP blocking + full attempt forensics.
 *
 * POLICY
 * ───────
 * After MAX_FAILED_ATTEMPTS failed logins inside ATTEMPT_WINDOW_MS the IP is
 * blocked PERMANENTLY (no expiry). There is no automatic unblock: an operator
 * must edit `.data/admin-security-store.json` on the server and set the
 * record's `blocked` to false (or delete the entry). Changes take effect on the
 * next request — no restart needed.
 *
 * A blocked visitor is served a plain 404. They are given no hint that a block
 * exists, so rotating IPs never looks like a productive strategy.
 *
 * FORENSICS
 * ──────────
 * Every failed attempt is appended to `.data/admin-login-attempts.json`
 * (a JSON array) with the submitted email, the submitted password, the IP,
 * user-agent and timestamp.
 *
 * ⚠ `.data/` is gitignored and MUST stay off version control and out of
 * backups that leave the server — this file contains plaintext credentials,
 * including any real password an admin mistypes into the login form.
 */

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

/** Keep the attempt log bounded so a sustained attack can't fill the disk. */
const MAX_LOG_ENTRIES = 5000;

export interface IpSecurityRecord {
  attempts: number;
  windowStartedAt: number;
  /** Permanent once true — only an operator editing the JSON clears it. */
  blocked?: boolean;
  blockedAt?: number;
  /** Human-readable note explaining why, for whoever reads the file later. */
  blockedReason?: string;
  /** Total failed attempts ever seen from this IP, across all windows. */
  totalFailures: number;
  lastEmail?: string;
  lastUserAgent?: string;
  firstSeenAt: number;
  updatedAt: number;
}

interface AdminSecurityStore {
  version: 2;
  ips: Record<string, IpSecurityRecord>;
}

export interface AttemptDetails {
  email?: string | null;
  password?: string | null;
  userAgent?: string | null;
  path?: string | null;
}

export interface LoginAttemptLogEntry {
  at: string;
  ip: string;
  email: string | null;
  password: string | null;
  userAgent: string | null;
  path: string | null;
  /** Failure count for this IP inside the current window, after this attempt. */
  attemptInWindow: number;
  totalFailures: number;
  /** True when this specific attempt is the one that triggered the block. */
  triggeredBlock: boolean;
  blocked: boolean;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'admin-security-store.json');
const ATTEMPT_LOG_PATH = path.join(DATA_DIR, 'admin-login-attempts.json');

let writeQueue: Promise<unknown> = Promise.resolve();

function emptyStore(): AdminSecurityStore {
  return { version: 2, ips: {} };
}

function normalizeIp(ip: string): string {
  const value = ip.trim();
  if (value.startsWith('::ffff:')) return value.slice('::ffff:'.length);
  return value || 'unknown';
}

/**
 * Migrates a v1 record (time-boxed `blockedUntil`) to the v2 permanent shape.
 * Any IP that was blocked under the old 48-hour policy stays blocked forever.
 */
function migrateRecord(raw: unknown, now: number): IpSecurityRecord | null {
  if (!raw || typeof raw !== 'object') return null;

  const legacy = raw as Partial<IpSecurityRecord> & { blockedUntil?: number };
  const attempts = typeof legacy.attempts === 'number' ? legacy.attempts : 0;
  const wasBlocked = legacy.blocked === true || typeof legacy.blockedUntil === 'number';

  return {
    attempts,
    windowStartedAt: legacy.windowStartedAt ?? now,
    blocked: wasBlocked ? true : undefined,
    blockedAt: legacy.blockedAt ?? (wasBlocked ? now : undefined),
    blockedReason: legacy.blockedReason ?? (wasBlocked ? 'Migrated from timed block' : undefined),
    totalFailures: legacy.totalFailures ?? attempts,
    lastEmail: legacy.lastEmail,
    lastUserAgent: legacy.lastUserAgent,
    firstSeenAt: legacy.firstSeenAt ?? legacy.windowStartedAt ?? now,
    updatedAt: legacy.updatedAt ?? now,
  };
}

async function readStore(): Promise<AdminSecurityStore> {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    const trimmed = raw.trim();

    if (!trimmed) {
      return resetInvalidStore('Admin security store was empty');
    }

    const parsed = JSON.parse(trimmed) as { version?: number; ips?: unknown };

    if (!parsed.ips || typeof parsed.ips !== 'object') {
      throw new Error('Invalid admin security store shape');
    }

    // Accept v1 and v2 on disk; normalize both into the v2 in-memory shape so a
    // deployment over an existing store never loses blocks.
    const now = Date.now();
    const ips: Record<string, IpSecurityRecord> = {};

    for (const [ip, record] of Object.entries(parsed.ips as Record<string, unknown>)) {
      const migrated = migrateRecord(record, now);
      if (migrated) ips[ip] = migrated;
    }

    return { version: 2, ips };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return emptyStore();
    return resetInvalidStore(error);
  }
}

async function writeStore(store: AdminSecurityStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });

  const tempPath = `${STORE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, JSON.stringify(store, null, 2), 'utf8');
  await rename(tempPath, STORE_PATH);
}

async function resetInvalidStore(reason: unknown): Promise<AdminSecurityStore> {
  const store = emptyStore();

  console.warn('[admin-security-store.readStore] Resetting invalid local store', {
    storePath: STORE_PATH,
    reason: reason instanceof Error ? reason.message : String(reason),
  });

  try {
    await writeStore(store);
  } catch (error) {
    console.error('[admin-security-store.readStore] Failed to rewrite local store', {
      storePath: STORE_PATH,
      error,
    });
  }

  return store;
}

/**
 * Drops stale records. A blocked record is NEVER removed — the block is
 * permanent, so the evidence stays until an operator clears it by hand.
 */
function cleanupExpired(store: AdminSecurityStore, now: number): void {
  for (const [ip, record] of Object.entries(store.ips)) {
    if (record.blocked) continue;

    if (record.windowStartedAt + ATTEMPT_WINDOW_MS <= now) {
      delete store.ips[ip];
    }
  }
}

async function updateStore<T>(
  operation: (store: AdminSecurityStore, now: number) => T,
): Promise<T> {
  const task = writeQueue.then(async () => {
    const now = Date.now();
    const store = await readStore();
    cleanupExpired(store, now);

    const result = operation(store, now);
    await writeStore(store);
    return result;
  });

  writeQueue = task.catch(() => undefined);
  return task;
}

/**
 * Appends one entry to the attempt log. Failures here are swallowed — losing a
 * forensic line must never stop the block itself from being applied.
 *
 * The log is a JSON array on disk. We rewrite it rather than appending raw
 * lines so the file stays valid JSON that you can open and read directly.
 */
async function appendAttemptLog(entry: LoginAttemptLogEntry): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });

    let entries: LoginAttemptLogEntry[] = [];

    try {
      const raw = await readFile(ATTEMPT_LOG_PATH, 'utf8');
      const trimmed = raw.trim();

      if (trimmed) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) entries = parsed as LoginAttemptLogEntry[];
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code !== 'ENOENT') {
        // Corrupted log — preserve it for inspection instead of overwriting.
        const salvagePath = `${ATTEMPT_LOG_PATH}.corrupt.${Date.now()}`;
        await rename(ATTEMPT_LOG_PATH, salvagePath).catch(() => undefined);
        console.warn('[admin-security-store.appendAttemptLog] Salvaged corrupt log', {
          salvagePath,
        });
      }
    }

    entries.push(entry);

    if (entries.length > MAX_LOG_ENTRIES) {
      entries = entries.slice(entries.length - MAX_LOG_ENTRIES);
    }

    const tempPath = `${ATTEMPT_LOG_PATH}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempPath, JSON.stringify(entries, null, 2), 'utf8');
    await rename(tempPath, ATTEMPT_LOG_PATH);
  } catch (error) {
    console.error('[admin-security-store.appendAttemptLog]', { error });
  }
}

export async function isIpBlocked(ip: string): Promise<boolean> {
  const normalizedIp = normalizeIp(ip);
  const store = await readStore();

  return store.ips[normalizedIp]?.blocked === true;
}

/**
 * Records one failed admin login and blocks the IP permanently once it crosses
 * the threshold. Also writes the full attempt (email + password + UA) to the
 * forensic log.
 */
export async function recordFailedAttempt(
  ip: string,
  details: AttemptDetails = {},
): Promise<{ attempts: number; blocked: boolean }> {
  const normalizedIp = normalizeIp(ip);
  const email = details.email?.trim() || null;
  const password = details.password ?? null;
  const userAgent = details.userAgent?.trim() || null;

  const outcome = await updateStore((store, now) => {
    const existing = store.ips[normalizedIp];
    const windowExpired = !existing || existing.windowStartedAt + ATTEMPT_WINDOW_MS <= now;

    const record: IpSecurityRecord = existing
      ? {
          ...existing,
          // A fresh window restarts the counter, but total failures and the
          // block flag persist for the lifetime of the record.
          attempts: windowExpired ? 1 : existing.attempts + 1,
          windowStartedAt: windowExpired ? now : existing.windowStartedAt,
          totalFailures: existing.totalFailures + 1,
          lastEmail: email ?? existing.lastEmail,
          lastUserAgent: userAgent ?? existing.lastUserAgent,
          updatedAt: now,
        }
      : {
          attempts: 1,
          windowStartedAt: now,
          totalFailures: 1,
          lastEmail: email ?? undefined,
          lastUserAgent: userAgent ?? undefined,
          firstSeenAt: now,
          updatedAt: now,
        };

    const wasBlocked = record.blocked === true;

    if (!wasBlocked && record.attempts >= MAX_FAILED_ATTEMPTS) {
      record.blocked = true;
      record.blockedAt = now;
      record.blockedReason = `${record.attempts} failed admin logins within ${
        ATTEMPT_WINDOW_MS / 60_000
      } minutes`;
    }

    store.ips[normalizedIp] = record;

    return {
      attempts: record.attempts,
      totalFailures: record.totalFailures,
      blocked: record.blocked === true,
      triggeredBlock: !wasBlocked && record.blocked === true,
    };
  });

  await appendAttemptLog({
    at: new Date().toISOString(),
    ip: normalizedIp,
    email,
    password,
    userAgent,
    path: details.path?.trim() || null,
    attemptInWindow: outcome.attempts,
    totalFailures: outcome.totalFailures,
    triggeredBlock: outcome.triggeredBlock,
    blocked: outcome.blocked,
  });

  if (outcome.triggeredBlock) {
    console.warn('[admin-security-store] IP permanently blocked', {
      ip: normalizedIp,
      email,
      attempts: outcome.attempts,
    });
  }

  return { attempts: outcome.attempts, blocked: outcome.blocked };
}

export interface SecurityOverview {
  /** Newest-first attempt log. */
  attempts: LoginAttemptLogEntry[];
  /** One row per IP the store knows about, blocked first then most recent. */
  ips: Array<IpSecurityRecord & { ip: string }>;
  totals: {
    blockedIps: number;
    trackedIps: number;
    totalAttempts: number;
    attemptsLast24h: number;
    uniqueEmails: number;
  };
  /** True when the log hit its cap and older entries have rolled off. */
  logTruncated: boolean;
  maxLogEntries: number;
  storePath: string;
  attemptLogPath: string;
}

/**
 * Read-only snapshot for the admin security dashboard.
 * Never throws — a missing or unreadable store yields an empty overview so the
 * page still renders.
 */
export async function getSecurityOverview(): Promise<SecurityOverview> {
  const base = {
    logTruncated: false,
    maxLogEntries: MAX_LOG_ENTRIES,
    storePath: STORE_PATH,
    attemptLogPath: ATTEMPT_LOG_PATH,
  };

  let attempts: LoginAttemptLogEntry[] = [];

  try {
    const raw = await readFile(ATTEMPT_LOG_PATH, 'utf8');
    const trimmed = raw.trim();

    if (trimmed) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) attempts = parsed as LoginAttemptLogEntry[];
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      console.error('[admin-security-store.getSecurityOverview] Unreadable attempt log', { error });
    }
  }

  let ips: Array<IpSecurityRecord & { ip: string }> = [];

  try {
    const store = await readStore();
    ips = Object.entries(store.ips).map(([ip, record]) => ({ ...record, ip }));
  } catch (error) {
    console.error('[admin-security-store.getSecurityOverview] Unreadable store', { error });
  }

  // Blocked IPs first, then most recently active.
  ips.sort((a, b) => {
    if (a.blocked !== b.blocked) return a.blocked ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const emails = new Set<string>();
  let attemptsLast24h = 0;

  for (const entry of attempts) {
    if (entry.email) emails.add(entry.email.toLowerCase());
    const at = Date.parse(entry.at);
    if (Number.isFinite(at) && at >= dayAgo) attemptsLast24h += 1;
  }

  return {
    ...base,
    // Newest first for display; the file itself stays append-ordered.
    attempts: [...attempts].reverse(),
    ips,
    totals: {
      blockedIps: ips.filter((record) => record.blocked).length,
      trackedIps: ips.length,
      totalAttempts: attempts.length,
      attemptsLast24h,
      uniqueEmails: emails.size,
    },
    logTruncated: attempts.length >= MAX_LOG_ENTRIES,
  };
}

/**
 * Logs an attempt made by an already-blocked IP. The attacker still sees a
 * plain 404, but we keep capturing what they try.
 */
export async function recordBlockedAttempt(
  ip: string,
  details: AttemptDetails = {},
): Promise<void> {
  const normalizedIp = normalizeIp(ip);

  await appendAttemptLog({
    at: new Date().toISOString(),
    ip: normalizedIp,
    email: details.email?.trim() || null,
    password: details.password ?? null,
    userAgent: details.userAgent?.trim() || null,
    path: details.path?.trim() || null,
    attemptInWindow: 0,
    totalFailures: 0,
    triggeredBlock: false,
    blocked: true,
  });
}
