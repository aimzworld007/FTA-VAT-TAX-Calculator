import jwt from 'jsonwebtoken';
import { getJwtSecret } from './env.js';

export type Role = 'USER' | 'SUPERADMIN';
export type AuthClaims = { sub: string; email: string; role: Role };

export const signAuthToken = (claims: AuthClaims) => jwt.sign(claims, getJwtSecret(), { expiresIn: '1d' });
export const verifyAuthToken = (token: string) => jwt.verify(token, getJwtSecret()) as AuthClaims;
