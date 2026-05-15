import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fail } from './apiResponse.js';
import { verifyAuthToken, type AuthClaims, type Role } from './auth.js';
import { readAuthCookie } from './cookies.js';
export function requireAuth(req: VercelRequest, res: VercelResponse): AuthClaims | null {
  const token = readAuthCookie(req);
  if (!token) return fail(res, 401, 'Unauthorized'), null;
  try { return verifyAuthToken(token); } catch { return fail(res, 401, 'Invalid session'), null; }
}
export const requireRole = (user: AuthClaims, allowed: Role[]) => allowed.includes(user.role);
