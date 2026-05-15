import { Router } from 'express';
import { login, logout, me, refresh, register, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));
router.patch('/profile', requireAuth, asyncHandler(updateProfile));

export default router;
