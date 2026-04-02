import { Request, Response, NextFunction } from 'express';
import { redisInstance } from './redisClient';
import { logger } from '../logger';

/**
 * Cache Middleware using Redis
 * @param ttlSeconds Time-to-live in seconds for the cached route response
 * @param keyFn Optional function to derive the cache key from the request.
 *              Use this when the response is tenant- or user-specific to
 *              prevent cached data from leaking across different users/clinics.
 *              Defaults to `cache:<originalUrl>`.
 */
export const cacheRoute = (
  ttlSeconds: number = 300,
  keyFn?: (req: Request) => string,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Construct unique cache key
    const key = keyFn
      ? keyFn(req)
      : `cache:${req.originalUrl || req.url}`;
    
    try {
      const cached = await redisInstance.get(key);
      if (cached) {
        logger.debug(`[Cache HIT] Serving ${key} from Redis`);
        res.setHeader('Content-Type', 'application/json');
        return res.send(cached);
      }
      
      // Monkey patch res.send to capture the response body and cache it
      const originalSend = res.send.bind(res);
      res.send = (body: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        // Cache the body. We assume body is a parsed JSON string or Buffer (if from res.json it's usually stringified)
        let dataToCache = body;
        if (typeof body === 'object') {
          dataToCache = JSON.stringify(body);
        }

        redisInstance.set(key, dataToCache, 'EX', ttlSeconds).catch(err => {
          logger.error(`[Cache Set Error] Failed to cache ${key}`, err);
        });
        
        return originalSend(body);
      };
      
      next();
    } catch (error) {
      logger.error('[Cache Error] Failed to check cache', error);
      next();
    }
  };
};
