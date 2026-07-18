import { Router } from 'express';
import { initiatePayment, initiateRemainingPayment, paymentCallback, paymentWebhook } from '../_controllers/payment.controller';
import { authenticate } from '../_middleware/auth';

const router = Router();

// Authenticated — start deposit payment for a booking
router.post('/initiate', authenticate, initiatePayment);

// Authenticated — start remaining 50% payment (after docs approved)
router.post('/initiate-remaining', authenticate, initiateRemainingPayment);

// Paymob redirects user here after payment (GET with query params)
router.get('/callback', paymentCallback);

// Paymob server-to-server webhook (POST)
router.post('/webhook', paymentWebhook);

export default router;
