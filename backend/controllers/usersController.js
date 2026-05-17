import bcrypt from 'bcrypt';
import { z } from 'zod';
import { query } from '../db/query.js';

const profileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const mapUser = (row) => ({
  id: row.id,
  email: row.email,
  fullName: row.full_name,
  role: row.role,
  isActive: row.is_active,
  phone: row.phone,
  address: row.address,
});

export async function getMe(req, res) {
  const result = await query(
    `SELECT u.id,u.email,u.full_name,u.role,u.is_active,up.phone,up.address
     FROM users u
     LEFT JOIN user_profiles up ON up.user_id = u.id
     WHERE u.id = $1
     LIMIT 1`,
    [req.user.id]
  );
  if (!result.rowCount) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: { user: mapUser(result.rows[0]) } });
}

export async function updateMe(req, res) {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });

  const { fullName, phone, address } = parsed.data;
  await query('BEGIN');
  try {
    if (typeof fullName === 'string') {
      await query('UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2', [fullName, req.user.id]);
    }
    if (typeof phone !== 'undefined' || typeof address !== 'undefined') {
      await query(
        `INSERT INTO user_profiles (user_id, phone, address)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id)
         DO UPDATE SET
           phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
           address = COALESCE(EXCLUDED.address, user_profiles.address),
           updated_at = NOW()`,
        [req.user.id, phone ?? null, address ?? null]
      );
    }

    const updated = await query(
      `SELECT u.id,u.email,u.full_name,u.role,u.is_active,up.phone,up.address
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.id = $1
       LIMIT 1`,
      [req.user.id]
    );
    await query('COMMIT');
    return res.json({ success: true, data: { user: mapUser(updated.rows[0]) } });
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
}

export async function updatePassword(req, res) {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });

  const { currentPassword, newPassword } = parsed.data;
  const existing = await query('SELECT id,email,full_name,password_hash,role,is_active FROM users WHERE id = $1 LIMIT 1', [req.user.id]);
  if (!existing.rowCount) return res.status(404).json({ success: false, message: 'User not found' });

  const user = existing.rows[0];
  const passwordOk = await bcrypt.compare(currentPassword, user.password_hash);
  if (!passwordOk) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

  const nextHash = await bcrypt.hash(newPassword, 12);
  await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [nextHash, req.user.id]);

  return res.json({
    success: true,
    data: {
      user: mapUser({ ...user, phone: null, address: null }),
    },
  });
}
