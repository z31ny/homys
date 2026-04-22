import { Request, Response, NextFunction } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { reviews, users, properties, bookings } from '../db/schema';
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

    // Verify user has a completed/confirmed booking for this property (edge case 4.1)
    const [completedBooking] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.propertyId, propertyId),
          eq(bookings.userId, req.user.userId),
          sql`${bookings.status} IN ('completed', 'confirmed')`
        )
      )
      .limit(1);

    if (!completedBooking) {
      throw new AppError('You can only review properties where you have completed a stay.', 403);
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
    const propertyId = req.params.propertyId as string;

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

    const id = req.params.id as string;

    // Check current status — make idempotent (edge case 4.5)
    const [existingReview] = await db
      .select({ id: reviews.id, status: reviews.status, propertyId: reviews.propertyId })
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);

    if (!existingReview) {
      throw new AppError('Review not found.', 404);
    }

    // Guard: warn if property is archived/deleted (edge case 4.8)
    if (existingReview.propertyId) {
      const [prop] = await db
        .select({ status: properties.status })
        .from(properties)
        .where(eq(properties.id, existingReview.propertyId))
        .limit(1);
      if (!prop) {
        throw new AppError('Cannot approve — the associated property has been deleted.', 400);
      }
      if (prop.status === 'archived') {
        throw new AppError('Cannot approve — the associated property is archived.', 400);
      }
    }

    if (existingReview.status === 'approved') {
      return res.json({
        status: 'success',
        message: 'Review is already approved.',
        data: { review: existingReview },
      });
    }

    const [updated] = await db
      .update(reviews)
      .set({ status: 'approved' })
      .where(eq(reviews.id, id))
      .returning();

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

    const id = req.params.id as string;

    // Check current status — make idempotent (edge case 4.6)
    const [existingReview] = await db
      .select({ id: reviews.id, status: reviews.status })
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);

    if (!existingReview) {
      throw new AppError('Review not found.', 404);
    }

    if (existingReview.status === 'rejected') {
      return res.json({
        status: 'success',
        message: 'Review is already rejected.',
        data: { review: existingReview },
      });
    }

    const [updated] = await db
      .update(reviews)
      .set({ status: 'rejected' })
      .where(eq(reviews.id, id))
      .returning();

    res.json({
      status: 'success',
      message: 'Review rejected.',
      data: { review: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/reviews/:id
 * Authenticated — user deletes their own pending review (edge case 4.12).
 */
export const deleteMyReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const id = req.params.id as string;

    // Find the review
    const [review] = await db
      .select({ id: reviews.id, userId: reviews.userId, status: reviews.status })
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);

    if (!review) {
      throw new AppError('Review not found.', 404);
    }

    // Only the author can delete
    if (review.userId !== req.user.userId) {
      throw new AppError('You can only delete your own reviews.', 403);
    }

    // Only pending reviews can be deleted by the user
    if (review.status !== 'pending') {
      throw new AppError('Only pending reviews can be deleted. Approved or rejected reviews cannot be removed.', 400);
    }

    await db.delete(reviews).where(eq(reviews.id, id));

    res.json({
      status: 'success',
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
