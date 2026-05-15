import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../src/lib/prisma.js';
import { requireAuth } from '../../src/server/requireAuth.js';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req,res); if(!auth) return;
  const records = await prisma.corporateTaxRecord.findMany({ where:{userId: auth.sub}, orderBy:{createdAt:'desc'}});
  res.status(200).json(records);
}
