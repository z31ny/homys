import { Router } from 'express';
import {
  createProperty,
  getProperties,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../_controllers/property.controller';
import { authenticate, optionalAuth } from '../_middleware/auth';
import { validate } from '../_middleware/validate';
import { createPropertySchema, updatePropertySchema } from '../_validators/property';

const router = Router();

// Public routes
router.get('/', getProperties);

// Protected routes — /mine MUST come before /:id to avoid "mine" being treated as a UUID
router.get('/mine', authenticate, getMyProperties);
router.post('/', authenticate, validate(createPropertySchema), createProperty);
router.patch('/:id', authenticate, validate(updatePropertySchema), updateProperty);
router.delete('/:id', authenticate, deleteProperty);

// Public detail — after /mine so it doesn't shadow it
router.get('/:id', optionalAuth, getPropertyById);

export default router;
