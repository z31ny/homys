import { Request, Response, NextFunction } from 'express';

/**
 * XSS input sanitization middleware (edge case 8.8).
 * 
 * Strips HTML tags from all string values in request body.
 * React's JSX already escapes output, but this provides defense-in-depth
 * by sanitizing on input — preventing stored XSS even if content is
 * later rendered in emails, admin tools, or non-React contexts.
 */

/**
 * Strip HTML tags from a string, preserving text content.
 */
function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Recursively sanitize all string values in an object or array.
 */
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return stripTags(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
}

/**
 * Express middleware that sanitizes req.body by stripping HTML tags.
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
};
