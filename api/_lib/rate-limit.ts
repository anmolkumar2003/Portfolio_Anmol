interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function isRateLimited(
  key: string,
  limitPerMinute: number,
): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return { limited: false, retryAfterSec: 0 };
  }

  if (existing.count >= limitPerMinute) {
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { limited: false, retryAfterSec: 0 };
}

/** Best-effort cleanup to keep memory bounded on warm serverless instances. */
export function pruneRateLimitBuckets(maxEntries = 5_000): void {
  if (buckets.size <= maxEntries) {
    return;
  }

  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  if (buckets.size <= maxEntries) {
    return;
  }

  const overflow = buckets.size - maxEntries;
  let removed = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    removed += 1;
    if (removed >= overflow) {
      break;
    }
  }
}
