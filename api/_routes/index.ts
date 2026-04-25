import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import bookingRoutes from './booking.routes';
import contactRoutes from './contact.routes';
import questionnaireRoutes from './questionnaire.routes';
import reviewRoutes from './review.routes';
import adminRoutes from './admin.routes';
import discountRoutes from './discount.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/bookings', bookingRoutes);
router.use('/contact', contactRoutes);
router.use('/questionnaire', questionnaireRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/discounts', discountRoutes);

export default router;
