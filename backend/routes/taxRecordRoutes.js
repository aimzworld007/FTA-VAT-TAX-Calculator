import { Router } from 'express';
import { createTaxRecord, listTaxRecords } from '../controllers/taxRecordsController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);
router.post('/', createTaxRecord);
router.get('/', listTaxRecords);

export default router;
