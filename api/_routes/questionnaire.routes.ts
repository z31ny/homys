import { Router } from 'express';
import { submitQuestionnaire } from '../_controllers/questionnaire.controller';
import { optionalAuth } from '../_middleware/auth';
import { validate } from '../_middleware/validate';
import { contactLimiter } from '../_middleware/rateLimit';
import { questionnaireSchema } from '../_validators/questionnaire';

const router = Router();

// Optional auth — saves userId if logged in, works anonymously too (rate limited — edge case 5.6)
router.post('/', contactLimiter, optionalAuth, validate(questionnaireSchema), submitQuestionnaire);

export default router;
