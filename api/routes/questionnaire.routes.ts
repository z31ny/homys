import { Router } from 'express';
import { submitQuestionnaire } from '../controllers/questionnaire.controller';
import { optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { contactLimiter } from '../middleware/rateLimit';
import { questionnaireSchema } from '../validators/questionnaire';

const router = Router();

// Optional auth — saves userId if logged in, works anonymously too (rate limited — edge case 5.6)
router.post('/', contactLimiter, optionalAuth, validate(questionnaireSchema), submitQuestionnaire);

export default router;
