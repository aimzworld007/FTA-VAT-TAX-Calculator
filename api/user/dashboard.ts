import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../src/lib/prisma';
import { ok } from '../../src/server/apiResponse';
import { requireAuth } from '../../src/server/requireAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res);
  if (!auth) return;
  const userId = auth.sub;
  const [vatCount, taxCount] = await Promise.all([
    prisma.vatRecord.count({ where: { userId } }),
    prisma.corporateTaxRecord.count({ where: { userId } }),
  ]);
  return ok(res, { totalVatRecords: vatCount, totalCorporateTaxRecords: taxCount });
}
