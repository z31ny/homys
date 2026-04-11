import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter for serverless environments (edge cases 5.6, 8.4).
 * 
 * Note: In Vercel serverless, each function instance has its own memory,
 * so this won't share state across cold starts. It still prevents rapid-fire
 * abuse within a single instance's lifetime. For production at scale,
 * use Redis-backed rate limiting (e.g., Upstash).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipStore) {
    if (now > entry.resetAt) {
      ipStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Creates a rate limiter middleware.
 * @param maxRequests - Maximum requests allowed within the window.
 * @param windowMs - Time window in milliseconds.
 */
export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim()
      || req.ip
      || 'unknown';

    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const entry = ipStore.get(key);

    if (!entry || now > entry.resetAt) {
      // New window
      ipStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      return res.status(429).json({
        status: 'error',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      });
    }

    entry.count++;
    next();
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
