import { Router } from 'express';
import { submitContact } from '../controllers/contact.controller';
import { validate } from '../middleware/validate';
import { contactLimiter } from '../middleware/rateLimit';
import { contactSchema } from '../validators/contact';

const router = Router();

// Public route (rate limited — edge case 5.6)
router.post('/', contactLimiter, validate(contactSchema), submitContact);

export default router;
