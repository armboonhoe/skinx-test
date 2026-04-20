// Per-email login failure tracker — defends against credential stuffing where
// attackers rotate source IPs to evade the IP-based rate limiter. In-memory only;
// swap for Redis when running multiple server instances.

const MAX_FAILURES = 5;
const LOCK_WINDOW_MS = 15 * 60_000;
const MAX_ENTRIES = 10_000;

interface Entry {
  failures: number;
  lockedUntil: number | null;
  firstFailureAt: number;
}

const store = new Map<string, Entry>();

const key = (email: string): string => email.trim().toLowerCase();

const sweep = (now: number): void => {
  if (store.size < MAX_ENTRIES) return;
  for (const [k, v] of store) {
    if (v.lockedUntil && v.lockedUntil <= now) store.delete(k);
    else if (!v.lockedUntil && now - v.firstFailureAt > LOCK_WINDOW_MS) store.delete(k);
  }
};

export const lockout = {
  /** Returns ms remaining if the email is currently locked, otherwise 0. */
  check(email: string): number {
    const entry = store.get(key(email));
    if (!entry?.lockedUntil) return 0;
    const now = Date.now();
    if (entry.lockedUntil <= now) {
      store.delete(key(email));
      return 0;
    }
    return entry.lockedUntil - now;
  },

  recordFailure(email: string): void {
    const now = Date.now();
    sweep(now);

    const k = key(email);
    const entry = store.get(k);
    if (!entry || now - entry.firstFailureAt > LOCK_WINDOW_MS) {
      store.set(k, { failures: 1, lockedUntil: null, firstFailureAt: now });
      return;
    }
    entry.failures += 1;
    if (entry.failures >= MAX_FAILURES) {
      entry.lockedUntil = now + LOCK_WINDOW_MS;
    }
  },

  reset(email: string): void {
    store.delete(key(email));
  },

  /** Test-only: wipe all tracked emails. */
  clearAll(): void {
    store.clear();
  },
};
