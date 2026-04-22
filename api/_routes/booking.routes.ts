import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../_controllers/booking.controller';
import { authenticate } from '../_middleware/auth';
import { validate } from '../_middleware/validate';
import { createBookingSchema } from '../_validators/booking';

const router = Router();

// All booking routes require authentication
router.post('/', authenticate, validate(createBookingSchema), createBooking);
router.get('/', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/cancel', authenticate, cancelBooking);

export default router;
