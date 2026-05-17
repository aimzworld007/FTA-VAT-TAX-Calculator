import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { listCorporateTaxRecords, createCorporateTaxRecord, getCorporateTaxRecord, updateCorporateTaxRecord, duplicateCorporateTaxRecord, deleteCorporateTaxRecord } from '../controllers/corporateTaxRecordController.js';
const router = Router(); router.use(requireAuth);
router.get('/', asyncHandler(listCorporateTaxRecords)); router.post('/', asyncHandler(createCorporateTaxRecord));
router.get('/:id', asyncHandler(getCorporateTaxRecord)); router.put('/:id', asyncHandler(updateCorporateTaxRecord)); router.post('/:id/duplicate', asyncHandler(duplicateCorporateTaxRecord)); router.delete('/:id', asyncHandler(deleteCorporateTaxRecord));
export default router;
