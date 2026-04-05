import { Router } from 'express';
import {
  createProperty,
  getProperties,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../controllers/property.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPropertySchema, updatePropertySchema } from '../validators/property';

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
