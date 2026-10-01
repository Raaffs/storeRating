import { Router } from 'express';
import { 
  getDashboard, 
  getUsersList, 
  getUserDetails, 
  createUser, 
  getStoresList, 
  createStore 
} from '../controllers/admin';
import { verifyToken, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(verifyToken, requireRole(['ADMIN']));

router.get('/dashboard', getDashboard);
router.get('/users', getUsersList);
router.get('/users/:id', getUserDetails);
router.post('/users', createUser);
router.get('/stores', getStoresList);

router.post('/stores', upload.single('image'), createStore);

export default router;
