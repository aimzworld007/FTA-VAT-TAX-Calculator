import { Router } from 'express';
import {
  createTaxRecord,
  deleteTaxRecord,
  getTaxRecord,
  listTaxRecords,
  updateTaxRecord,
} from '../controllers/taxRecordsController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(requireAuth);
router.post('/', asyncHandler(createTaxRecord));
router.get('/', asyncHandler(listTaxRecords));
router.get('/:id', asyncHandler(getTaxRecord));
router.put('/:id', asyncHandler(updateTaxRecord));
router.delete('/:id', asyncHandler(deleteTaxRecord));

export default router;
