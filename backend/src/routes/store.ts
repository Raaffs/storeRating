import { Router } from 'express';
import { listStores, rateStore, uploadPhoto, getStoreDetails } from '../controllers/store';
import { verifyToken, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(verifyToken, requireRole(['USER', 'ADMIN', 'STORE_OWNER']));

router.get('/', listStores);
router.get('/:id', getStoreDetails);
router.post('/:id/rate', rateStore);
router.post('/:id/photos', upload.single('image'), uploadPhoto);

export default router;
