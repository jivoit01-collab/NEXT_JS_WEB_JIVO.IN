import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const BLOCK_WINDOW_MS = 48 * 60 * 60 * 1000;

interface IpSecurityRecord {
  attempts: number;
  windowStartedAt: number;
  blockedAt?: number;
  blockedUntil?: number;
  updatedAt: number;
}

interface AdminSecurityStore {
  version: 1;
  ips: Record<string, IpSecurityRecord>;
}

const STORE_PATH = path.join(process.cwd(), '.data', 'admin-security-store.json');

let writeQueue: Promise<unknown> = Promise.resolve();

function emptyStore(): AdminSecurityStore {
  return { version: 1, ips: {} };
}

function normalizeIp(ip: string): string {
  const value = ip.trim();
  if (value.startsWith('::ffff:')) return value.slice('::ffff:'.length);
  return value || 'unknown';
}

async function readStore(): Promise<AdminSecurityStore> {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    const trimmed = raw.trim();

    if (!trimmed) {
      return resetInvalidStore('Admin security store was empty');
    }

    const parsed = JSON.parse(trimmed) as AdminSecurityStore;

    if (parsed.version !== 1 || !parsed.ips || typeof parsed.ips !== 'object') {
      throw new Error('Invalid admin security store shape');
    }

    return parsed;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return emptyStore();
    return resetInvalidStore(error);
  }
}

async function writeStore(store: AdminSecurityStore): Promise<void> {
  const dir = path.dirname(STORE_PATH);
  await mkdir(dir, { recursive: true });

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

function cleanupExpired(store: AdminSecurityStore, now: number): void {
  for (const [ip, record] of Object.entries(store.ips)) {
    const blockExpired = record.blockedUntil ? record.blockedUntil <= now : true;
    const windowExpired = record.windowStartedAt + ATTEMPT_WINDOW_MS <= now;

    if (blockExpired && windowExpired) {
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

export async function isIpBlocked(ip: string): Promise<boolean> {
  const normalizedIp = normalizeIp(ip);
  const now = Date.now();
  const store = await readStore();
  const record = store.ips[normalizedIp];

  return Boolean(record?.blockedUntil && record.blockedUntil > now);
}

export async function recordFailedAttempt(
  ip: string,
): Promise<{ attempts: number; blocked: boolean; blockedUntil?: number }> {
  const normalizedIp = normalizeIp(ip);

  return updateStore((store, now) => {
    const existing = store.ips[normalizedIp];
    const windowExpired =
      !existing || existing.windowStartedAt + ATTEMPT_WINDOW_MS <= now;

    const record: IpSecurityRecord = windowExpired
      ? {
          attempts: 1,
          windowStartedAt: now,
          updatedAt: now,
        }
      : {
          ...existing,
          attempts: existing.attempts + 1,
          updatedAt: now,
        };

    if (record.attempts >= MAX_FAILED_ATTEMPTS) {
      record.blockedAt = now;
      record.blockedUntil = now + BLOCK_WINDOW_MS;
    }

    store.ips[normalizedIp] = record;

    return {
      attempts: record.attempts,
      blocked: Boolean(record.blockedUntil && record.blockedUntil > now),
      blockedUntil: record.blockedUntil,
    };
  });
}
