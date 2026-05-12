import { Router } from 'express';
import { buildVatPdfPayload, generateVatPdf } from '../services/vatPdfService.js';

const router = Router();

router.post('/vat/pdf', (req, res) => {
  try {
    const payload = buildVatPdfPayload(req.body || {});
    const safeBusiness = payload.businessName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '') || 'business';
    const safePeriod = payload.vatPeriod.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '') || 'period';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeBusiness}-${safePeriod}-vat-report.pdf"`);
    generateVatPdf(payload, res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate VAT PDF' });
  }
});

export default router;
