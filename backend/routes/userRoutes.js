import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getMe, updateMe, updatePassword } from '../controllers/usersController.js';

const router = Router();

router.get('/me', requireAuth, asyncHandler(getMe));
router.put('/me', requireAuth, asyncHandler(updateMe));
router.put('/me/password', requireAuth, asyncHandler(updatePassword));

export default router;
