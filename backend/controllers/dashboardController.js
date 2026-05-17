import { query } from '../db/query.js';

export async function getDashboard(req, res) {
  const userId = req.user.id;
  const [user, business, vatCount, ctCount, vatAgg, ctAgg, upcoming, recentVat, recentCt] = await Promise.all([
    query('SELECT id,full_name,email,role,is_active,created_at FROM users WHERE id=$1 LIMIT 1', [userId]),
    query('SELECT * FROM business_profiles WHERE user_id=$1 LIMIT 1', [userId]),
    query('SELECT COUNT(*)::int AS count FROM vat_records WHERE user_id=$1', [userId]),
    query('SELECT COUNT(*)::int AS count FROM corporate_tax_records WHERE user_id=$1', [userId]),
    query('SELECT COALESCE(SUM(sales_total),0)::numeric AS sales_total, COALESCE(SUM(expenses_total),0)::numeric AS expenses_total, COALESCE(SUM(vat_payable - vat_refundable),0)::numeric AS vat_net FROM vat_records WHERE user_id=$1', [userId]),
    query('SELECT COALESCE(SUM(sales_total),0)::numeric AS sales_total, COALESCE(SUM(expenses_total),0)::numeric AS expenses_total, COALESCE(SUM(corporate_tax_estimate),0)::numeric AS corporate_tax_estimate FROM corporate_tax_records WHERE user_id=$1', [userId]),
    query("SELECT * FROM filing_reminders WHERE user_id=$1 AND due_date >= NOW() ORDER BY due_date ASC LIMIT 5", [userId]),
    query('SELECT * FROM vat_records WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5', [userId]),
    query('SELECT * FROM corporate_tax_records WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5', [userId]),
  ]);
  return res.json({ success: true, data: { user: user.rows[0] || null, businessProfile: business.rows[0] || null, vatCount: vatCount.rows[0].count, corporateTaxCount: ctCount.rows[0].count, totals: { sales: Number(vatAgg.rows[0].sales_total) + Number(ctAgg.rows[0].sales_total), expenses: Number(vatAgg.rows[0].expenses_total) + Number(ctAgg.rows[0].expenses_total), vatNet: Number(vatAgg.rows[0].vat_net), corporateTaxEstimate: Number(ctAgg.rows[0].corporate_tax_estimate) }, upcomingReminders: upcoming.rows, recentVatRecords: recentVat.rows, recentCorporateTaxRecords: recentCt.rows } });
}
