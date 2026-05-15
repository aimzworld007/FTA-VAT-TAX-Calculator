import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../src/lib/prisma.js';

const fail = (res: VercelResponse, status: number, message: string, code?: string) =>
  res.status(status).json({ ok: false, message, ...(code ? { code } : {}) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return fail(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name ASC
    `;

    return res.status(200).json({
      ok: true,
      count: rows.length,
      tables: rows.map((row) => row.table_name)
    });
  } catch (error) {
    console.error('DB_TABLES_ERROR', error);
    return fail(res, 500, 'Unable to inspect database tables', 'DB_TABLES_FAILED');
  }
}
