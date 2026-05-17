import { query } from '../db/query.js';

export async function getDashboard(req, res) {
  const userId = req.user.id;
  const [user, business, vatCount, ctCount, upcoming, recentVat, recentCt] = await Promise.all([
    query('SELECT id,full_name,email,role,is_active,created_at FROM users WHERE id=$1 LIMIT 1', [userId]),
    query('SELECT * FROM business_profiles WHERE user_id=$1 LIMIT 1', [userId]),
    query('SELECT COUNT(*)::int AS count FROM vat_records WHERE user_id=$1', [userId]),
    query('SELECT COUNT(*)::int AS count FROM corporate_tax_records WHERE user_id=$1', [userId]),
    query("SELECT * FROM filing_reminders WHERE user_id=$1 AND due_date >= NOW() ORDER BY due_date ASC LIMIT 5", [userId]),
    query('SELECT * FROM vat_records WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5', [userId]),
    query('SELECT * FROM corporate_tax_records WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5', [userId]),
  ]);
  return res.json({ success: true, data: { user: user.rows[0] || null, businessProfile: business.rows[0] || null, vatCount: vatCount.rows[0].count, corporateTaxCount: ctCount.rows[0].count, upcomingReminders: upcoming.rows, recentRecords: [...recentVat.rows, ...recentCt.rows] } });
}
