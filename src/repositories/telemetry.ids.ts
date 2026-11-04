const SESSION_STORAGE_KEY = 'portfolio_telemetry_session_v1';
const VISITOR_STORAGE_KEY = 'portfolio_telemetry_visitor_v1';

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }

  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function readStorage(storage: Storage, key: string): string | null {
  try {
    const value = storage.getItem(key)?.trim();
    return value && value.length >= 8 ? value : null;
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // Private mode / blocked storage — continue with in-memory id only.
  }
}

export function getOrCreateSessionKey(): string {
  const existing = readStorage(sessionStorage, SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = randomId();
  writeStorage(sessionStorage, SESSION_STORAGE_KEY, created);
  return created;
}

export function getOrCreateVisitorKey(): string {
  const existing = readStorage(localStorage, VISITOR_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = randomId();
  writeStorage(localStorage, VISITOR_STORAGE_KEY, created);
  return created;
}

export function createWatcherKey(): string {
  return randomId();
}
