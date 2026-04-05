import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBookingSchema } from '../validators/booking';

const router = Router();

// All booking routes require authentication
router.post('/', authenticate, validate(createBookingSchema), createBooking);
router.get('/', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/cancel', authenticate, cancelBooking);

export default router;
