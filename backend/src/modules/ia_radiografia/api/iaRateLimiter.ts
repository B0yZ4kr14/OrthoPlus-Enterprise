import { Request, Response, NextFunction } from "express";
import { redisInstance } from "@/infrastructure/redis/redisClient";
import { logger } from "@/infrastructure/logger";

function getKey(prefix: string, id: string): string {
  return `rate_limit:${prefix}:${id}`;
}

async function isLimited(
  key: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / windowMs)}`;

  const current = await redisInstance.incr(windowKey);
  if (current === 1) {
    await redisInstance.pexpire(windowKey, windowMs);
  }

  return current > max;
}

export async function iaRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const dentistId = req.user?.id as string;
  const clinicId = req.clinicId as string;

  try {
    // Por dentista: 10 uploads/analises por hora
    if (await isLimited(getKey("ia:dentist", dentistId), 10, 60 * 60 * 1000)) {
      res
        .status(429)
        .json({ error: "Rate limit excedido (dentista)", retryAfter: 3600 });
      return;
    }

    // Por clinica: 100 analises por dia
    if (
      await isLimited(getKey("ia:clinic", clinicId), 100, 24 * 60 * 60 * 1000)
    ) {
      res
        .status(429)
        .json({ error: "Rate limit excedido (clinica)", retryAfter: 86400 });
      return;
    }

    next();
  } catch (error) {
    // Fallback: allow request but log warning if Redis is unavailable
    logger.warn("[IA-RateLimiter] Redis unavailable, allowing request", {
      error,
      dentistId,
      clinicId,
    });
    next();
  }
}
