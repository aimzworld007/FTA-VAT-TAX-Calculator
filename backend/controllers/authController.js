import bcrypt from 'bcrypt';
import { z } from 'zod';
import { query } from '../db/query.js';
import {
  hashToken,
  refreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/authTokens.js';

const registerSchema = z.object({ fullName: z.string().min(2), email: z.string().email(), password: z.string().min(8), confirmPassword: z.string().min(8) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const profileSchema = z.object({ fullName: z.string().min(2).optional() });
const cookieOpts = { httpOnly: true, secure: true, sameSite: 'lax', path: '/api/auth' };
const safeUser = (u) => ({ id: u.id, email: u.email, fullName: u.full_name, role: u.role, isActive: u.is_active });

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });
  const { fullName, email, password, confirmPassword } = parsed.data;
  if (password !== confirmPassword) return res.status(400).json({ success: false, message: 'Passwords do not match' });
  const normalizedEmail = email.toLowerCase();
  const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);
  if (existing.rowCount) return res.status(409).json({ success: false, message: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 12);
  const inserted = await query('INSERT INTO users (full_name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,full_name,email,role,is_active', [fullName, normalizedEmail, passwordHash]);
  const user = inserted.rows[0];
  const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role, fullName: user.full_name, isActive: user.is_active });
  const { token: refreshToken } = signRefreshToken({ id: user.id });
  await query('INSERT INTO refresh_tokens (user_id,token_hash,expires_at) VALUES ($1,$2,$3)', [user.id, hashToken(refreshToken), refreshTokenExpiryDate()]);
  res.cookie('refreshToken', refreshToken, cookieOpts);
  return res.status(201).json({ success: true, data: { accessToken, user: safeUser(user) } });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });
  const { email, password } = parsed.data;
  const result = await query('SELECT id,full_name,email,password_hash,role,is_active FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase()]);
  const user = result.rows[0];
  if (!user || !user.is_active) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role, fullName: user.full_name, isActive: user.is_active });
  const { token: refreshToken } = signRefreshToken({ id: user.id });
  await query('INSERT INTO refresh_tokens (user_id,token_hash,expires_at) VALUES ($1,$2,$3)', [user.id, hashToken(refreshToken), refreshTokenExpiryDate()]);
  res.cookie('refreshToken', refreshToken, cookieOpts);
  return res.json({ success: true, data: { accessToken, user: safeUser(user) } });
}

export async function refresh(req, res) {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ success: false, message: 'Missing refresh token' });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenRow = await query('SELECT user_id FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1', [payload.sub, hashToken(refreshToken)]);
    if (!tokenRow.rowCount) return res.status(401).json({ success: false, message: 'Refresh token is invalid' });
    const userRow = await query('SELECT id,full_name,email,role,is_active FROM users WHERE id = $1 LIMIT 1', [payload.sub]);
    const user = userRow.rows[0];
    if (!user || !user.is_active) return res.status(401).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: { accessToken: signAccessToken({ id: user.id, email: user.email, role: user.role, fullName: user.full_name, isActive: user.is_active }) } });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL', [hashToken(refreshToken)]);
  res.clearCookie('refreshToken', cookieOpts);
  return res.status(204).send();
}

export async function me(req, res) {
  const userResult = await query('SELECT id,full_name,email,role,is_active FROM users WHERE id = $1 LIMIT 1', [req.user.id]);
  if (!userResult.rowCount) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: { user: safeUser(userResult.rows[0]) } });
}

export async function updateProfile(req, res) {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });
  const user = await query('UPDATE users SET full_name = COALESCE($1, full_name), updated_at = NOW() WHERE id = $2 RETURNING id,full_name,email,role,is_active', [parsed.data.fullName, req.user.id]);
  return res.json({ success: true, data: { user: safeUser(user.rows[0]) } });
}
