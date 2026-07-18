import { Router } from 'express';
import {
  createReview,
  getPropertyReviews,
  getAllReviews,
  getPendingReviews,
  approveReview,
  rejectReview,
  deleteMyReview,
  adminDeleteReview,
} from '../_controllers/review.controller';
import { authenticate } from '../_middleware/auth';
import { validate } from '../_middleware/validate';
import { createReviewSchema } from '../_validators/review';

const router = Router();

// Public
router.get('/property/:propertyId', getPropertyReviews);

// Admin — must come before /:id to avoid shadowing
router.get('/all', authenticate, getAllReviews);
router.get('/pending', authenticate, getPendingReviews);
router.patch('/:id/approve', authenticate, approveReview);
router.patch('/:id/reject', authenticate, rejectReview);
router.delete('/:id/admin', authenticate, adminDeleteReview);

// User routes
router.post('/', authenticate, validate(createReviewSchema), createReview);
router.delete('/:id', authenticate, deleteMyReview);

export default router;
