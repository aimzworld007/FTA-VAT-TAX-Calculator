import jwt from 'jsonwebtoken';
export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';
export type AuthClaims = { sub: string; email: string; role: Role };
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-secret';
export const signAuthToken = (claims: AuthClaims) => jwt.sign(claims, JWT_SECRET, { expiresIn: '1d' });
export const verifyAuthToken = (token: string) => jwt.verify(token, JWT_SECRET) as AuthClaims;
