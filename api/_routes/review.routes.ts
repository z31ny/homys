import { Router } from 'express';
import {
  createReview,
  getPropertyReviews,
  getPendingReviews,
  approveReview,
  rejectReview,
  deleteMyReview,
} from '../_controllers/review.controller';
import { authenticate } from '../_middleware/auth';
import { validate } from '../_middleware/validate';
import { createReviewSchema } from '../_validators/review';

const router = Router();

// Public — get approved reviews for a property
router.get('/property/:propertyId', getPropertyReviews);

// Protected — submit a review
router.post('/', authenticate, validate(createReviewSchema), createReview);

// Protected — delete own pending review (edge case 4.12)
router.delete('/:id', authenticate, deleteMyReview);

// Admin — get pending reviews
router.get('/pending', authenticate, getPendingReviews);

// Admin — approve / reject
router.patch('/:id/approve', authenticate, approveReview);
router.patch('/:id/reject', authenticate, rejectReview);

export default router;
