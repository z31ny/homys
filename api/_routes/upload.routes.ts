import { Router } from 'express';
import { getPresignedUrl, deleteUpload } from '../_controllers/upload.controller';
import { authenticate } from '../_middleware/auth';

const router = Router();

router.post('/presign', authenticate, getPresignedUrl);
router.delete('/:key(*)', authenticate, deleteUpload);

export default router;
