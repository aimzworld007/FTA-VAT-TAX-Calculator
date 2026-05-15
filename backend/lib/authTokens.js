import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role, fullName: user.fullName, isActive: user.isActive }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
}

export function signRefreshToken(user) {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign({ sub: user.id, tokenId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d`,
  });
  return { token, tokenId };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function refreshTokenExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
  return expiresAt;
}
