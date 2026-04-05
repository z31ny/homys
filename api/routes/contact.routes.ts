import { Router } from 'express';
import { submitContact } from '../controllers/contact.controller';
import { validate } from '../middleware/validate';
import { contactSchema } from '../validators/contact';

const router = Router();

// Public route
router.post('/', validate(contactSchema), submitContact);

export default router;
