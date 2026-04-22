import { Router } from 'express';
import {
  getAdminStats,
  getAdminBookings,
  getAdminProperties,
  updatePropertyStatus,
  getAdminUsers,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/bookings', getAdminBookings);
router.get('/properties', getAdminProperties);
router.patch('/properties/:id/status', updatePropertyStatus);
router.get('/users', getAdminUsers);

export default router;
