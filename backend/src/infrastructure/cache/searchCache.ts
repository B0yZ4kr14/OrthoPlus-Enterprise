import { redisInstance } from "@/infrastructure/redis/redisClient";
import { logger } from "@/infrastructure/logger";
import type { SearchResultItem, SearchResponse } from "@orthoplus/shared-types";

function buildKey(
  clinicId: string,
  query: string,
  module: string | undefined,
  page: number,
  limit: number,
): string {
  const mod = module || "__all__";
  return `search:${clinicId}:${query}:${mod}:${page}:${limit}`;
}

export async function getSearchCache(
  clinicId: string,
  query: string,
  module: string | undefined,
  page: number,
  limit: number,
): Promise<SearchResponse | null> {
  try {
    const key = buildKey(clinicId, query, module, page, limit);
    const cached = await redisInstance.get(key);
    if (cached) {
      logger.debug(`[SearchCache HIT] ${key}`);
      return JSON.parse(cached) as SearchResponse;
    }
    return null;
  } catch (error) {
    logger.error("[SearchCache GET Error] Falling back to DB query", error);
    return null;
  }
}

export async function setSearchCache(
  clinicId: string,
  query: string,
  module: string | undefined,
  page: number,
  limit: number,
  data: SearchResponse,
  ttlMs: number,
): Promise<void> {
  try {
    const key = buildKey(clinicId, query, module, page, limit);
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    await redisInstance.set(key, JSON.stringify(data), "EX", ttlSeconds);
    logger.debug(`[SearchCache SET] ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    logger.error(
      "[SearchCache SET Error] Failed to cache search result",
      error,
    );
  }
}

export async function invalidateSearchCache(clinicId: string): Promise<void> {
  try {
    const pattern = `search:${clinicId}:*`;
    let cursor = "0";
    do {
      const reply = await redisInstance.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = reply[0];
      const keys = reply[1];
      if (keys.length > 0) {
        await redisInstance.del(...keys);
        logger.debug(
          `[SearchCache INVALIDATE] Deleted ${keys.length} keys for clinic ${clinicId}`,
        );
      }
    } while (cursor !== "0");
  } catch (error) {
    logger.error(
      "[SearchCache INVALIDATE Error] Failed to invalidate search cache",
      error,
    );
  }
}
