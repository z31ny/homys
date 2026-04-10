import { z } from 'zod';

export const createReviewSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(2000, 'Comment must be at most 2000 characters').optional(),
});

export const reviewActionSchema = z.object({
  reviewId: z.string().uuid('Invalid review ID'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReviewActionInput = z.infer<typeof reviewActionSchema>;
