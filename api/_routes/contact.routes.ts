import { Router } from 'express';
import { submitContact } from '../_controllers/contact.controller';
import { validate } from '../_middleware/validate';
import { contactLimiter } from '../_middleware/rateLimit';
import { contactSchema } from '../_validators/contact';

const router = Router();

// Public route (rate limited — edge case 5.6)
router.post('/', contactLimiter, validate(contactSchema), submitContact);

export default router;
