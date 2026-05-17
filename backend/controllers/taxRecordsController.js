import { z } from 'zod';
import { query } from '../db/query.js';

const createRecordSchema = z.object({
  taxType: z.enum(['VAT', 'CORPORATE']),
  periodStart: z.string().datetime().optional().nullable(),
  periodEnd: z.string().datetime().optional().nullable(),
  inputPayload: z.record(z.any()),
  resultPayload: z.record(z.any()),
});

export async function createTaxRecord(req, res) {
  const parsed = createRecordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });

  const { taxType, periodStart, periodEnd, inputPayload, resultPayload } = parsed.data;

  const created = await query(
    `INSERT INTO tax_records (user_id,tax_type,filing_period_start,filing_period_end,input_payload,result_payload)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, taxType, periodStart ? new Date(periodStart) : null, periodEnd ? new Date(periodEnd) : null, inputPayload, resultPayload]
  );

  if (taxType === 'VAT') {
    await query(
      `INSERT INTO vat_records (user_id,filing_period_start,filing_period_end,payload)
       VALUES ($1,$2,$3,$4)`,
      [req.user.id, periodStart ? new Date(periodStart) : null, periodEnd ? new Date(periodEnd) : null, resultPayload]
    );
  } else {
    await query(
      `INSERT INTO corporate_tax_records (user_id,filing_period_start,filing_period_end,payload)
       VALUES ($1,$2,$3,$4)`,
      [req.user.id, periodStart ? new Date(periodStart) : null, periodEnd ? new Date(periodEnd) : null, resultPayload]
    );
  }

  return res.status(201).json({ success: true, data: { record: created.rows[0] } });
}

export async function listTaxRecords(req, res) {
  const rows = await query('SELECT * FROM tax_records WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
  return res.json({ success: true, data: { records: rows.rows } });
}
