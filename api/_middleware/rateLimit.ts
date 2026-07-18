import { Request, Response, NextFunction } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../_db';

/**
 * Distributed rate limiter backed by Postgres (Neon).
 *
 * Why not in-memory: Vercel runs the API as many independent serverless
 * instances, each with its own memory. An in-memory counter is therefore
 * per-instance and resets on cold start, so the effective limit is far higher
 * than intended. Storing the counter in the shared database means every
 * instance sees the same count — a real, enforceable limit.
 *
 * The increment is a single atomic upsert, so concurrent requests can't race
 * past the limit. The `rate_limits` table is created by the boot-time schema
 * guard (see _db/migrate.ts).
 *
 * Fail-open policy: if the DB call errors, we allow the request rather than
 * locking out legitimate users over an infrastructure hiccup.
 */
export const rateLimit = (maxRequests: number, windowMs: number) => {
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.ip ||
      'unknown';
    const key = `${ip}:${req.path}`;

    try {
      // Atomic: insert a fresh window, or increment within the current window,
      // or reset if the previous window has expired. Returns the new count and
      // seconds remaining until reset.
      const result: any = await db.execute(sql`
        INSERT INTO rate_limits (key, count, reset_at)
        VALUES (${key}, 1, NOW() + (${windowSeconds} * INTERVAL '1 second'))
        ON CONFLICT (key) DO UPDATE SET
          count = CASE
            WHEN rate_limits.reset_at < NOW() THEN 1
            ELSE rate_limits.count + 1
          END,
          reset_at = CASE
            WHEN rate_limits.reset_at < NOW() THEN NOW() + (${windowSeconds} * INTERVAL '1 second')
            ELSE rate_limits.reset_at
          END
        RETURNING count, CEIL(EXTRACT(EPOCH FROM (reset_at - NOW())))::int AS retry_after
      `);

      const row = (result?.rows ?? result)?.[0];
      const count = Number(row?.count ?? 0);
      const retryAfter = Math.max(1, Number(row?.retry_after ?? windowSeconds));

      if (count > maxRequests) {
        res.set('Retry-After', retryAfter.toString());
        return res.status(429).json({
          status: 'error',
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        });
      }

      next();
    } catch (err) {
      // Fail open — never block a real user because of a rate-limit store error.
      console.error('[rateLimit] store error, allowing request:', err);
      next();
    }
  };
};

/**
 * Pre-configured rate limiters for different endpoint types.
 */

// Auth endpoints: 10 attempts per 15 minutes
export const authLimiter = rateLimit(10, 15 * 60 * 1000);

// Contact/Questionnaire: 5 submissions per 15 minutes
export const contactLimiter = rateLimit(5, 15 * 60 * 1000);

// General API: 100 requests per minute
export const generalLimiter = rateLimit(100, 60 * 1000);
