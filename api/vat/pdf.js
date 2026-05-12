import { put } from '@vercel/blob';
import { PassThrough } from 'node:stream';
import { buildVatPdfPayload, generateVatPdf } from '../../backend/services/vatPdfService.js';

async function renderPdfBuffer(payload) {
  return await new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);

    try {
      generateVatPdf(payload, stream);
    } catch (error) {
      reject(error);
    }
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = buildVatPdfPayload(req.body || {});
    const safeBusiness = payload.businessName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '') || 'business';
    const safePeriod = payload.vatPeriod.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '') || 'period';
    const filename = `${safeBusiness}-${safePeriod}-vat-report.pdf`;

    const pdfBuffer = await renderPdfBuffer(payload);

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`vat-reports/${Date.now()}-${filename}`, pdfBuffer, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: true
      });
      return res.status(200).json({ filename, url: blob.url });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate VAT PDF' });
  }
}
