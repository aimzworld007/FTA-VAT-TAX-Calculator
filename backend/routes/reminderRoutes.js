import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { listReminders, createReminder, updateReminder, deleteReminder, completeReminder } from '../controllers/reminderController.js';
const router = Router(); router.use(requireAuth);
router.get('/', asyncHandler(listReminders)); router.post('/', asyncHandler(createReminder)); router.put('/:id', asyncHandler(updateReminder)); router.delete('/:id', asyncHandler(deleteReminder)); router.patch('/:id/complete', asyncHandler(completeReminder));
export default router;
