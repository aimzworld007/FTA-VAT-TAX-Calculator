import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  hashToken,
  refreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/authTokens.js';

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const loginSchema = registerSchema;

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
};

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already exists' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  return res.status(201).json({ user: { id: user.id, email: user.email } });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken(user);
  const { token: refreshToken } = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: refreshTokenExpiryDate() },
  });

  res.cookie('refreshToken', refreshToken, cookieOpts);
  return res.json({ accessToken, user: { id: user.id, email: user.email } });
}

export async function refresh(req, res) {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'Missing refresh token' });

  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const tokenRow = await prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!tokenRow) return res.status(401).json({ error: 'Refresh token is invalid' });
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    const accessToken = signAccessToken(user);
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  res.clearCookie('refreshToken', cookieOpts);
  return res.status(204).send();
}

export async function me(req, res) {
  return res.json({ user: req.user });
}
