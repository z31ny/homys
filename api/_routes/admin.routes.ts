import { Router } from 'express';
import {
  getAdminStats,
  getAdminBookings,
  getAdminProperties,
  updatePropertyStatus,
  getAdminUsers,
  getAdminContacts,
} from '../_controllers/admin.controller';
import { authenticate } from '../_middleware/auth';
import { requireAdmin } from '../_middleware/requireAdmin';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/bookings', getAdminBookings);
router.get('/properties', getAdminProperties);
router.patch('/properties/:id/status', updatePropertyStatus);
router.get('/users', getAdminUsers);
router.get('/contacts', getAdminContacts);

export default router;
