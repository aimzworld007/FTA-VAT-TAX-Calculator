import { query } from '../db/query.js';
import { ok, fail } from '../middleware/apiResponse.js';

const parseId = (req) => req.params.id;

export const getMe = async (req, res) => {
  const r = await query('SELECT id, full_name, email, role, is_active, created_at FROM users WHERE id=$1', [req.user.id]);
  return ok(res, r.rows[0] || null);
};

export const upsertBusiness = async (req, res) => {
  const b = req.body || {};
  const r = await query(`INSERT INTO business_profiles (user_id,business_name,trn,address,phone,email,tax_settings,updated_at)
VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
ON CONFLICT (user_id) DO UPDATE SET business_name=EXCLUDED.business_name,trn=EXCLUDED.trn,address=EXCLUDED.address,phone=EXCLUDED.phone,email=EXCLUDED.email,tax_settings=EXCLUDED.tax_settings,updated_at=NOW()
RETURNING *`, [req.user.id, b.businessName, b.trn || b.TRN, b.address, b.phone, b.email, b.taxSettings || null]);
  return ok(res, r.rows[0]);
};
export const getBusiness = async (req,res)=>ok(res, (await query('SELECT * FROM business_profiles WHERE user_id=$1 LIMIT 1',[req.user.id])).rows[0] || null);

export const listVat = async (req,res)=>ok(res, (await query('SELECT * FROM vat_records WHERE user_id=$1 ORDER BY updated_at DESC',[req.user.id])).rows);
export const createVat = async (req,res)=>ok(res, (await query('INSERT INTO vat_records (user_id,payload,period_label,created_at,updated_at) VALUES ($1,$2,$3,NOW(),NOW()) RETURNING *',[req.user.id, req.body, req.body?.periodLabel || null])).rows[0]);
export const getVat = async (req,res)=>{const r=await query('SELECT * FROM vat_records WHERE id=$1 AND user_id=$2',[parseId(req),req.user.id]); if(!r.rowCount)return fail(res,404,'Not found','NOT_FOUND'); return ok(res,r.rows[0]);};
export const updateVat = async (req,res)=>ok(res, (await query('UPDATE vat_records SET payload=$1,updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING *',[req.body,parseId(req),req.user.id])).rows[0]);
export const deleteVat = async (req,res)=>{await query('DELETE FROM vat_records WHERE id=$1 AND user_id=$2',[parseId(req),req.user.id]); return ok(res,{deleted:true});};

export const listTax = async (req,res)=>ok(res, (await query('SELECT * FROM corporate_tax_records WHERE user_id=$1 ORDER BY updated_at DESC',[req.user.id])).rows);
export const createTax = async (req,res)=>ok(res, (await query('INSERT INTO corporate_tax_records (user_id,payload,period_label,created_at,updated_at) VALUES ($1,$2,$3,NOW(),NOW()) RETURNING *',[req.user.id, req.body, req.body?.periodLabel || null])).rows[0]);
export const getTax = async (req,res)=>{const r=await query('SELECT * FROM corporate_tax_records WHERE id=$1 AND user_id=$2',[parseId(req),req.user.id]); if(!r.rowCount)return fail(res,404,'Not found','NOT_FOUND'); return ok(res,r.rows[0]);};
export const updateTax = async (req,res)=>ok(res, (await query('UPDATE corporate_tax_records SET payload=$1,updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING *',[req.body,parseId(req),req.user.id])).rows[0]);
export const deleteTax = async (req,res)=>{await query('DELETE FROM corporate_tax_records WHERE id=$1 AND user_id=$2',[parseId(req),req.user.id]); return ok(res,{deleted:true});};

export const listReminders = async (req,res)=>ok(res, (await query('SELECT * FROM filing_reminders WHERE user_id=$1 ORDER BY due_date ASC',[req.user.id])).rows);
export const createReminder = async (req,res)=>ok(res, (await query('INSERT INTO filing_reminders (user_id,title,type,due_date,status,created_at,updated_at) VALUES ($1,$2,$3,$4,COALESCE($5,\'pending\'),NOW(),NOW()) RETURNING *',[req.user.id, req.body?.title, req.body?.type || 'GENERAL', req.body?.dueDate, req.body?.status])).rows[0]);
export const updateReminder = async (req,res)=>ok(res, (await query('UPDATE filing_reminders SET title=COALESCE($1,title),type=COALESCE($2,type),due_date=COALESCE($3,due_date),status=COALESCE($4,status),updated_at=NOW() WHERE id=$5 AND user_id=$6 RETURNING *',[req.body?.title,req.body?.type,req.body?.dueDate,req.body?.status,parseId(req),req.user.id])).rows[0]);
export const deleteReminder = async (req,res)=>{await query('DELETE FROM filing_reminders WHERE id=$1 AND user_id=$2',[parseId(req),req.user.id]);return ok(res,{deleted:true});};

export const adminStats = async (_req,res)=>ok(res,{message:'Admin stats temporarily disabled in pg cutover'});
export const adminUsers = async (_req,res)=>ok(res,[]);
export const adminUser = async (_req,res)=>ok(res,null);
export const adminUserStatus = async (_req,res)=>ok(res,null);
export const adminRecords = async (_req,res)=>ok(res,{vat:[],tax:[]});
export const getSmtp = async (_req,res)=>ok(res,null);
export const putSmtp = async (_req,res)=>ok(res,null);
