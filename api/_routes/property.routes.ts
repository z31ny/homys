import { Router } from 'express';
import {
  createProperty,
  getProperties,
  getMyProperties,
  getPropertyById,
  getPropertyAvailability,
  updateProperty,
  deleteProperty,
} from '../_controllers/property.controller';
import { authenticate, optionalAuth } from '../_middleware/auth';
import { validate } from '../_middleware/validate';
import { createPropertySchema, updatePropertySchema } from '../_validators/property';

const router = Router();

router.get('/', getProperties);

// /mine and /availability MUST come before /:id
router.get('/mine', authenticate, getMyProperties);
router.post('/', authenticate, validate(createPropertySchema), createProperty);

// Public availability check — no auth needed
router.get('/:id/availability', getPropertyAvailability);

router.patch('/:id', authenticate, validate(updatePropertySchema), updateProperty);
router.delete('/:id', authenticate, deleteProperty);

// Public detail — after named routes
router.get('/:id', optionalAuth, getPropertyById);

export default router;
