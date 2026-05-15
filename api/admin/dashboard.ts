import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../src/lib/prisma';
import { fail, ok } from '../../src/server/apiResponse';
import { requireAuth, requireRole } from '../../src/server/requireAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res);
  if (!auth) return;
  if (!requireRole(auth, ['ADMIN', 'SUPERADMIN'])) return fail(res, 403, 'Forbidden');

  const [totalUsers, activeUsers, vatRecordsCount, taxRecordsCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.vatRecord.count(),
    prisma.corporateTaxRecord.count(),
  ]);

  return ok(res, { totalUsers, activeUsers, vatRecordsCount, taxRecordsCount, systemHealth: 'ok' });
}
