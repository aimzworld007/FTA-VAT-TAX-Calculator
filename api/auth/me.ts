import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../src/lib/prisma.js';
import { fail, ok } from '../../src/server/apiResponse.js';
import { requireAuth } from '../../src/server/requireAuth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req, res);
  if (!auth) return;
  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return fail(res, 404, 'User not found');
  return ok(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
