import { Request, Response, NextFunction } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { reviews, users, properties } from '../db/schema';
import { AppError } from '../middleware/errorHandler';
import type { CreateReviewInput } from '../validators/review';

/**
 * POST /api/reviews
 * Authenticated — submit a review for a property. Status starts as 'pending'.
 */
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const { propertyId, rating, comment } = req.body as CreateReviewInput;

    // Verify property exists
    const [property] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!property) {
      throw new AppError('Property not found.', 404);
    }

    // Check if user already reviewed this property
    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(
        and(
          eq(reviews.propertyId, propertyId),
          eq(reviews.userId, req.user.userId)
        )
      )
      .limit(1);

    if (existing) {
      throw new AppError('You have already reviewed this property.', 409);
    }

    const [newReview] = await db
      .insert(reviews)
      .values({
        propertyId,
        userId: req.user.userId,
        rating,
        comment: comment || null,
        status: 'pending',
      })
      .returning();

    res.status(201).json({
      status: 'success',
      message: 'Review submitted! It will be visible after admin approval.',
      data: { review: newReview },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/property/:propertyId
 * Public — returns only approved reviews for a property.
 */
export const getPropertyReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.params;

    const propertyReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userName: users.fullName,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(
        and(
          eq(reviews.propertyId, propertyId),
          eq(reviews.status, 'approved')
        )
      )
      .orderBy(desc(reviews.createdAt));

    // Calculate average rating
    const avgRating = propertyReviews.length > 0
      ? propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length
      : 0;

    res.json({
      status: 'success',
      data: {
        reviews: propertyReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: propertyReviews.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/pending
 * Admin-only — returns all pending reviews for approval.
 */
export const getPendingReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    // Check if user is admin
    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (!user || !user.isAdmin) {
      throw new AppError('Admin access required.', 403);
    }

    const pendingReviews = await db
      .select({
        id: reviews.id,
        propertyId: reviews.propertyId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userName: users.fullName,
        userEmail: users.email,
        propertyTitle: properties.title,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(properties, eq(reviews.propertyId, properties.id))
      .where(eq(reviews.status, 'pending'))
      .orderBy(desc(reviews.createdAt));

    res.json({
      status: 'success',
      data: { reviews: pendingReviews },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/reviews/:id/approve
 * Admin-only — approve a review.
 */
export const approveReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    // Check if user is admin
    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (!user || !user.isAdmin) {
      throw new AppError('Admin access required.', 403);
    }

    const { id } = req.params;

    const [updated] = await db
      .update(reviews)
      .set({ status: 'approved' })
      .where(eq(reviews.id, id))
      .returning();

    if (!updated) {
      throw new AppError('Review not found.', 404);
    }

    res.json({
      status: 'success',
      message: 'Review approved successfully.',
      data: { review: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/reviews/:id/reject
 * Admin-only — reject a review.
 */
export const rejectReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    // Check if user is admin
    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (!user || !user.isAdmin) {
      throw new AppError('Admin access required.', 403);
    }

    const { id } = req.params;

    const [updated] = await db
      .update(reviews)
      .set({ status: 'rejected' })
      .where(eq(reviews.id, id))
      .returning();

    if (!updated) {
      throw new AppError('Review not found.', 404);
    }

    res.json({
      status: 'success',
      message: 'Review rejected.',
      data: { review: updated },
    });
  } catch (error) {
    next(error);
  }
};
