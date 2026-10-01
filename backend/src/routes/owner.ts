import { Router } from 'express';
import { getDashboard, registerStore } from '../controllers/owner';
import { verifyToken, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(verifyToken, requireRole(['STORE_OWNER']));

router.get('/dashboard', getDashboard);
router.post('/store', upload.single('image'), registerStore);

export default router;
