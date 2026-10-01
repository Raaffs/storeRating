import { Router } from 'express';
import { signup, login, updatePassword } from '../controllers/auth';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/update-password', verifyToken, updatePassword);

export default router;
