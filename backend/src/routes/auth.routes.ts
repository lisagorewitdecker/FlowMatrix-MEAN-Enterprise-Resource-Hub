import { Router } from 'express';
import {
  signup,
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  logout
} from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

export default router;
