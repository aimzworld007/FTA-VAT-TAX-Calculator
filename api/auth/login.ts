import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { prisma } from '../../src/lib/prisma.js';
import { fail, ok } from '../../src/server/apiResponse.js';
import { signAuthToken } from '../../src/server/auth.js';
import { setAuthCookie } from '../../src/server/cookies.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  const { email, password } = req.body || {};
  if (!email || !password) return fail(res, 400, 'Missing required fields');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return fail(res, 401, 'Invalid credentials');
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return fail(res, 401, 'Invalid credentials');
  const token = signAuthToken({ sub: user.id, email: user.email, role: user.role as 'USER' | 'SUPERADMIN' });
  setAuthCookie(res, token);
  return ok(res, { user: { id: user.id, name: user.fullName, fullName: user.fullName, email: user.email, role: user.role } });
}
