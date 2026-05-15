import { Router } from 'express';
import { createTaxRecord, listTaxRecords } from '../controllers/taxRecordsController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.post('/', asyncHandler(createTaxRecord));
router.get('/', asyncHandler(listTaxRecords));

export default router;
