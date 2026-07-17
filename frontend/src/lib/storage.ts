type CacheEntry<T> = {
  value: T;
  expiresAt: number | null;
};

const isBrowser = typeof window !== "undefined";

function safeGetRaw(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // localStorage disabled/private mode/quota errors
    return null;
  }
}

function safeSetRaw(key: string, value: string): boolean {
  if (!isBrowser) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveRaw(key: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

/**
 * Store a value with an optional TTL (in ms).
 */
export function setItem<T>(key: string, value: T, ttlMs?: number): boolean {
  const entry: CacheEntry<T> = {
    value,
    expiresAt: ttlMs ? Date.now() + ttlMs : null,
  };
  try {
    return safeSetRaw(key, JSON.stringify(entry));
  } catch {
    return false;
  }
}

/**
 * Retrieve a value. Returns null if missing, expired, or unparsable.
 * Expired entries are auto-removed.
 */
export function getItem<T>(key: string): T | null {
  const raw = safeGetRaw(key);
  if (!raw) return null;

  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      safeRemoveRaw(key);
      return null;
    }
    return entry.value;
  } catch {
    safeRemoveRaw(key);
    return null;
  }
}

export function removeItem(key: string): void {
  safeRemoveRaw(key);
}

/**
 * Remove all keys matching a prefix, e.g. clearByPrefix("reports:")
 */
export function clearByPrefix(prefix: string): void {
  if (!isBrowser) return;
  try {
    const keys = Object.keys(window.localStorage).filter((k) =>
      k.startsWith(prefix)
    );
    keys.forEach((k) => safeRemoveRaw(k));
  } catch {
    // no-op
  }
}

/** Clear everything under this wrapper's control (all keys). */
export function clearAll(): void {
  if (!isBrowser) return;
  try {
    window.localStorage.clear();
  } catch {
    // no-op
  }
}

/**
 * Get a cached value, or compute + store it if missing/expired.
 * Useful for caching expensive derived data (e.g. entity lookups) client-side.
 */
export async function getOrSet<T>(
  key: string,
  compute: () => Promise<T> | T,
  ttlMs?: number
): Promise<T> {
  const cached = getItem<T>(key);
  if (cached !== null) return cached;

  const value = await compute();
  setItem(key, value, ttlMs);
  return value;
}

/**
 * Namespaced convenience wrapper. Prefixes all keys automatically.
 * const reportCache = createNamespace("reports");
 * reportCache.set("123", data, 60_000);
 */
export function createNamespace(namespace: string) {
  const prefixKey = (key: string) => `${namespace}:${key}`;

  return {
    set: <T>(key: string, value: T, ttlMs?: number) =>
      setItem(prefixKey(key), value, ttlMs),
    get: <T>(key: string) => getItem<T>(prefixKey(key)),
    remove: (key: string) => removeItem(prefixKey(key)),
    clear: () => clearByPrefix(`${namespace}:`),
    getOrSet: <T>(key: string, compute: () => Promise<T> | T, ttlMs?: number) =>
      getOrSet<T>(prefixKey(key), compute, ttlMs),
  };
}