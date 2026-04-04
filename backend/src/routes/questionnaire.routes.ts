import { Router } from 'express';
import { submitQuestionnaire } from '../controllers/questionnaire.controller';
import { optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { questionnaireSchema } from '../validators/questionnaire';

const router = Router();

// Optional auth — saves userId if logged in, works anonymously too
router.post('/', optionalAuth, validate(questionnaireSchema), submitQuestionnaire);

export default router;
