import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../_db';
import { users } from '../_db/schema';
import { AppError } from './errorHandler';

/**
 * Middleware that checks if the authenticated user is an admin.
 * Must be used AFTER the `authenticate` middleware.
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (!user || !user.isAdmin) {
      throw new AppError('Admin access required.', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
