import { Router } from 'express';
import { getSection, getAllSections } from '../_controllers/content.controller';

const router = Router();

router.get('/', getAllSections);
router.get('/:section', getSection);

export default router;
