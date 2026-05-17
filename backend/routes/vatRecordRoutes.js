import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { listVatRecords, createVatRecord, getVatRecord, updateVatRecord, duplicateVatRecord, deleteVatRecord } from '../controllers/vatRecordController.js';
const router = Router(); router.use(requireAuth);
router.get('/', asyncHandler(listVatRecords)); router.post('/', asyncHandler(createVatRecord));
router.get('/:id', asyncHandler(getVatRecord)); router.put('/:id', asyncHandler(updateVatRecord)); router.post('/:id/duplicate', asyncHandler(duplicateVatRecord)); router.delete('/:id', asyncHandler(deleteVatRecord));
export default router;
