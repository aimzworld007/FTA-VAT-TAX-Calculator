import { prisma } from '../lib/prisma.js';

export async function getDashboard(req, res) {
  const userId = req.user.id;
  const [vatCount, ctCount, upcoming, overdue, recentVat, recentCt] = await Promise.all([
    prisma.vatRecord.count({ where: { userId } }),
    prisma.corporateTaxRecord.count({ where: { userId } }),
    prisma.filingReminder.findMany({ where: { userId, status: { in: ['UPCOMING', 'DUE_SOON'] } }, orderBy: { dueDate: 'asc' }, take: 5 }),
    prisma.filingReminder.findMany({ where: { userId, status: 'OVERDUE' }, orderBy: { dueDate: 'asc' }, take: 5 }),
    prisma.vatRecord.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.corporateTaxRecord.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);
  return res.json({ vatCount, corporateTaxCount: ctCount, upcomingReminders: upcoming, overdueReminders: overdue, recentRecords: [...recentVat, ...recentCt].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,8) });
}
