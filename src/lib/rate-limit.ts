import { AppError } from "@/lib/errors";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  message?: string;
};

const globalRateLimitStore = globalThis as typeof globalThis & {
  rateLimitStore?: Map<string, RateLimitBucket>;
};

function getStore() {
  globalRateLimitStore.rateLimitStore ??= new Map<string, RateLimitBucket>();
  return globalRateLimitStore.rateLimitStore;
}

function cleanupExpiredBuckets(now: number) {
  const store = getStore();

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function assertRateLimit({
  key,
  limit,
  windowMs,
  message = "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
}: RateLimitOptions) {
  const now = Date.now();
  const store = getStore();

  cleanupExpiredBuckets(now);

  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (bucket.count >= limit) {
    throw new AppError(message, "RATE_LIMITED", 429);
  }

  bucket.count += 1;
  store.set(key, bucket);
}
