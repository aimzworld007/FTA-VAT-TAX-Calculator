import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearAuthCookie } from '../../src/server/cookies.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  clearAuthCookie(res);
  return res.status(204).send('');
}
