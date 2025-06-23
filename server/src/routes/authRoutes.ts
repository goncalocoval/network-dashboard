import express from 'express';
import { login, register, updatePassword } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/update-password', updatePassword);

export default router;