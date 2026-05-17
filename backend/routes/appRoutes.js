import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as c from '../controllers/appController.js';

const r = Router();
r.use(requireAuth);
r.get('/users/me', asyncHandler(c.getMe));
r.get('/business-profile', asyncHandler(c.getBusiness));
r.post('/business-profile', asyncHandler(c.upsertBusiness));
r.put('/business-profile', asyncHandler(c.upsertBusiness));
r.get('/vat-records', asyncHandler(c.listVat)); r.post('/vat-records', asyncHandler(c.createVat));
r.get('/vat-records/:id', asyncHandler(c.getVat)); r.put('/vat-records/:id', asyncHandler(c.updateVat)); r.post('/vat-records/:id/duplicate', asyncHandler(c.duplicateVat)); r.delete('/vat-records/:id', asyncHandler(c.deleteVat));
r.get('/corporate-tax-records', asyncHandler(c.listTax)); r.post('/corporate-tax-records', asyncHandler(c.createTax));
r.get('/corporate-tax-records/:id', asyncHandler(c.getTax)); r.put('/corporate-tax-records/:id', asyncHandler(c.updateTax)); r.post('/corporate-tax-records/:id/duplicate', asyncHandler(c.duplicateTax)); r.delete('/corporate-tax-records/:id', asyncHandler(c.deleteTax));
r.get('/reminders', asyncHandler(c.listReminders)); r.post('/reminders', asyncHandler(c.createReminder)); r.put('/reminders/:id', asyncHandler(c.updateReminder)); r.delete('/reminders/:id', asyncHandler(c.deleteReminder));

r.get('/admin/stats', requireRole('SUPERADMIN'), asyncHandler(c.adminStats));
r.get('/admin/users', requireRole('SUPERADMIN'), asyncHandler(c.adminUsers));
r.get('/admin/users/:id', requireRole('SUPERADMIN'), asyncHandler(c.adminUser));
r.put('/admin/users/:id/status', requireRole('SUPERADMIN'), asyncHandler(c.adminUserStatus));
r.get('/admin/records', requireRole('SUPERADMIN'), asyncHandler(c.adminRecords));
r.get('/admin/smtp', requireRole('SUPERADMIN'), asyncHandler(c.getSmtp));
r.put('/admin/smtp', requireRole('SUPERADMIN'), asyncHandler(c.putSmtp));

export default r;
