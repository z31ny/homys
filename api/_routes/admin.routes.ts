import { Router } from 'express';
import {
  getAdminStats,
  getAdminBookings,
  adminCreateBooking,
  updateBookingStatus,
  getAdminProperties,
  updatePropertyStatus,
  adminUpdateProperty,
  adminDeleteProperty,
  toggleFeatured,
  getAdminUsers,
  getAdminContacts,
  approveBookingDocs,
  setHeroImage,
  deletePropertyImage,
} from '../_controllers/admin.controller';
import { updateSection } from '../_controllers/content.controller';
import { authenticate } from '../_middleware/auth';
import { requireAdmin } from '../_middleware/requireAdmin';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);

router.get('/bookings', getAdminBookings);
router.post('/bookings', adminCreateBooking);
router.patch('/bookings/:id/status', updateBookingStatus);
router.patch('/bookings/:id/docs-status', approveBookingDocs);

router.get('/properties', getAdminProperties);
router.patch('/properties/:id/status', updatePropertyStatus);
router.patch('/properties/:id/featured', toggleFeatured);
// Admin can fully edit any property regardless of status
router.patch('/properties/:id/edit', adminUpdateProperty);
router.patch('/properties/:id/hero-image', setHeroImage);
router.delete('/properties/:id/images/:imageId', deletePropertyImage);
router.delete('/properties/:id', adminDeleteProperty);

router.get('/users', getAdminUsers);
router.get('/contacts', getAdminContacts);

router.patch('/content/:section', updateSection);

export default router;
