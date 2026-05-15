import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { prisma } from '../../src/lib/prisma.js';
import { signAuthToken } from '../../src/server/auth.js';
import { setAuthCookie } from '../../src/server/cookies.js';

const jsonError = (res: VercelResponse, status: number, message: string, code?: string) =>
  res.status(status).json({ ok: false, message, ...(code ? { code } : {}) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return jsonError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    if (!process.env.DATABASE_URL?.trim()) {
      return jsonError(res, 500, 'Server configuration error', 'MISSING_DATABASE_URL');
    }

    if (!process.env.JWT_SECRET?.trim()) {
      return jsonError(res, 500, 'Server configuration error', 'MISSING_JWT_SECRET');
    }

    const { name, email, password } = req.body || {};

    if (typeof name !== 'string' || name.trim().length === 0) {
      return jsonError(res, 400, 'Name is required', 'INVALID_NAME');
    }

    if (typeof email !== 'string' || email.trim().length === 0) {
      return jsonError(res, 400, 'Email is required', 'INVALID_EMAIL');
    }

    if (typeof password !== 'string' || password.length < 8) {
      return jsonError(res, 400, 'Password must be at least 8 characters', 'INVALID_PASSWORD');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return jsonError(res, 409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        fullName: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'USER'
      }
    });

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role as 'USER' | 'SUPERADMIN'
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      ok: true,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('REGISTER_ERROR', error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return jsonError(res, 409, 'Email already registered');
    }

    return jsonError(res, 500, 'Unable to register user', 'REGISTER_FAILED');
  }
}
