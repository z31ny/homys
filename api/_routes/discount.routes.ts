import { Router } from 'express';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../_controllers/discount.controller';
import { authenticate } from '../_middleware/auth';
import { requireAdmin } from '../_middleware/requireAdmin';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', getDiscounts);
router.post('/', createDiscount);
router.patch('/:id', updateDiscount);
router.delete('/:id', deleteDiscount);

export default router;
