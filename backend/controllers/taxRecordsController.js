import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const createRecordSchema = z.object({
  taxType: z.enum(['VAT', 'CORPORATE']),
  periodStart: z.string().datetime().optional().nullable(),
  periodEnd: z.string().datetime().optional().nullable(),
  inputPayload: z.record(z.any()),
  resultPayload: z.record(z.any()),
});

export async function createTaxRecord(req, res) {
  const parsed = createRecordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  const { taxType, periodStart, periodEnd, inputPayload, resultPayload } = parsed.data;

  const created = await prisma.taxRecord.create({
    data: {
      userId: req.user.id,
      taxType,
      periodStart: periodStart ? new Date(periodStart) : null,
      periodEnd: periodEnd ? new Date(periodEnd) : null,
      inputPayload,
      resultPayload,
    },
  });

  return res.status(201).json({ record: created });
}

export async function listTaxRecords(req, res) {
  const rows = await prisma.taxRecord.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ records: rows });
}
