import { Request, Response, NextFunction } from "express";
import { redisInstance } from "@/infrastructure/redis/redisClient";
import { logger } from "@/infrastructure/logger";

const DEFAULT_LIMIT = parseInt(
  process.env.SEARCH_RATE_LIMIT_PER_MINUTE || "30",
  10,
);
const VIP_LIMIT = parseInt(
  process.env.SEARCH_RATE_LIMIT_VIP_PER_MINUTE || "100",
  10,
);
const WINDOW_SECONDS = 60;

function getVipClinicIds(): Set<string> {
  return new Set(
    (process.env.SEARCH_RATE_LIMIT_VIP_CLINIC_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

function resolveLimit(clinicId: string): number {
  return getVipClinicIds().has(clinicId) ? VIP_LIMIT : DEFAULT_LIMIT;
}

function resolveRetryAfter(ttlSeconds: number): number {
  return ttlSeconds > 0 ? ttlSeconds : WINDOW_SECONDS;
}

/**
 * Clinic-aware Redis-backed rate limiter for the search endpoint.
 *
 * - Key: ratelimit:search:{clinicId}
 * - Window: 60 seconds (Redis TTL)
 * - Default limit: SEARCH_RATE_LIMIT_PER_MINUTE (default 30)
 * - VIP limit: SEARCH_RATE_LIMIT_VIP_PER_MINUTE (default 100)
 * - VIP clinics: comma-separated list in SEARCH_RATE_LIMIT_VIP_CLINIC_IDS
 *
 * Graceful degradation: if Redis is unavailable, the request is allowed
 * (fail open) and a warning is logged.
 */
export async function searchRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const clinicId = req.user?.clinicId;

  if (!clinicId) {
    res.status(403).json({ error: "Missing clinic context" });
    return;
  }

  const key = `ratelimit:search:${clinicId}`;
  const limit = resolveLimit(clinicId);

  try {
    const pipeline = redisInstance.pipeline();
    pipeline.incr(key);
    pipeline.ttl(key);
    const results = await pipeline.exec();

    if (!results) {
      logger.warn(`Redis pipeline returned null for rate limit key ${key}`);
      next();
      return;
    }

    const [incrResult, ttlResult] = results;

    if (incrResult[0]) {
      throw incrResult[0];
    }

    if (ttlResult[0]) {
      throw ttlResult[0];
    }

    const count = incrResult[1] as number;
    const ttl = ttlResult[1] as number;

    // Set TTL on first request in window
    if (count === 1 && ttl === -1) {
      await redisInstance.expire(key, WINDOW_SECONDS);
    }

    // Remaining window in seconds for Retry-After
    const remainingTtl = ttl > 0 ? ttl : WINDOW_SECONDS;
    const remaining = Math.max(0, limit - count);

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);

    if (count > limit) {
      res.setHeader("Retry-After", resolveRetryAfter(remainingTtl));
      res.status(429).json({
        error: "Too many search requests. Please try again later.",
        retryAfter: remainingTtl,
      });
      return;
    }

    next();
  } catch (error) {
    logger.warn(
      `Redis rate limiter error for clinic ${clinicId}: ${error instanceof Error ? error.message : String(error)}`,
    );
    // Fail open: allow request when Redis is down
    next();
  }
}
