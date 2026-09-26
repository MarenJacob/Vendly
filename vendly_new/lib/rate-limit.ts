const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  current.count += 1;
  return { ok: current.count <= limit, remaining: Math.max(0, limit - current.count) };
}

const failureBuckets = new Map<string, { count: number; reset: number }>();
const FAILURE_WINDOW_MS = 15 * 60_000;

export function recordFailure(key: string) {
  const now = Date.now();
  const current = failureBuckets.get(key);
  if (!current || current.reset <= now) {
    failureBuckets.set(key, { count: 1, reset: now + FAILURE_WINDOW_MS });
    return;
  }
  current.count += 1;
}

export function isSuspicious(key: string, threshold = 1) {
  const current = failureBuckets.get(key);
  if (!current || current.reset <= Date.now()) return false;
  return current.count >= threshold;
}

export function clearFailures(key: string) {
  failureBuckets.delete(key);
}
