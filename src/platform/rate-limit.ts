import { AppError } from "@/platform/errors";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Per-process limiter for auth attempts.
 * Replace this map with Redis when the app runs on more than one instance.
 */
export function assertRateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  existing.count += 1;
  if (existing.count > limit) {
    throw new AppError("Too many attempts. Wait a minute and try again.", 429, "rate_limited");
  }
}
