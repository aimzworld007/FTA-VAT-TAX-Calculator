import { prisma } from '../lib/prisma.js';
import { ok, fail } from '../middleware/apiResponse.js';

const parseId = (req) => req.params.id;

export const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id:true, fullName:true, email:true, role:true, isActive:true, createdAt:true } });
  return ok(res, user);
};

export const upsertBusiness = async (req, res) => {
  const data = { ...req.body, userId: req.user.id };
  const row = await prisma.businessProfile.upsert({ where: { userId: req.user.id }, create: data, update: data });
  return ok(res, row);
};
export const getBusiness = async (req,res)=>ok(res, await prisma.businessProfile.findUnique({where:{userId:req.user.id}}));

function ownWhere(req,id){ return { id, userId: req.user.id }; }
export const listVat = async (req,res)=>ok(res, await prisma.vatRecord.findMany({where:{userId:req.user.id},orderBy:{updatedAt:'desc'}}));
export const createVat = async (req,res)=>ok(res, await prisma.vatRecord.create({data:{...req.body,userId:req.user.id}}));
export const getVat = async (req,res)=>{const r=await prisma.vatRecord.findFirst({where:ownWhere(req,parseId(req))}); if(!r)return fail(res,404,'Not found','NOT_FOUND'); return ok(res,r);};
export const updateVat = async (req,res)=>ok(res, await prisma.vatRecord.update({where:{id:parseId(req)},data:req.body}));
export const deleteVat = async (req,res)=>{await prisma.vatRecord.delete({where:{id:parseId(req)}}); return ok(res,{deleted:true});};

export const listTax = async (req,res)=>ok(res, await prisma.corporateTaxRecord.findMany({where:{userId:req.user.id},orderBy:{updatedAt:'desc'}}));
export const createTax = async (req,res)=>ok(res, await prisma.corporateTaxRecord.create({data:{...req.body,userId:req.user.id}}));
export const getTax = async (req,res)=>{const r=await prisma.corporateTaxRecord.findFirst({where:ownWhere(req,parseId(req))}); if(!r)return fail(res,404,'Not found','NOT_FOUND'); return ok(res,r);};
export const updateTax = async (req,res)=>ok(res, await prisma.corporateTaxRecord.update({where:{id:parseId(req)},data:req.body}));
export const deleteTax = async (req,res)=>{await prisma.corporateTaxRecord.delete({where:{id:parseId(req)}}); return ok(res,{deleted:true});};

export const listReminders = async (req,res)=>ok(res, await prisma.reminder.findMany({where:{userId:req.user.id},orderBy:{dueDate:'asc'}}));
export const createReminder = async (req,res)=>ok(res, await prisma.reminder.create({data:{...req.body,userId:req.user.id}}));
export const updateReminder = async (req,res)=>ok(res, await prisma.reminder.update({where:{id:parseId(req)},data:req.body}));
export const deleteReminder = async (req,res)=>{await prisma.reminder.delete({where:{id:parseId(req)}});return ok(res,{deleted:true});};

export const adminStats = async (_req,res)=> {
 const [users,active,inactive,vat,tax,recentUsers,recentVat,recentTax,smtp]= await Promise.all([
 prisma.user.count(), prisma.user.count({where:{isActive:true}}), prisma.user.count({where:{isActive:false}}), prisma.vatRecord.count(), prisma.corporateTaxRecord.count(),
 prisma.user.findMany({orderBy:{createdAt:'desc'},take:5,select:{id:true,fullName:true,email:true,createdAt:true,isActive:true,role:true}}),
 prisma.vatRecord.findMany({orderBy:{createdAt:'desc'},take:5}), prisma.corporateTaxRecord.findMany({orderBy:{createdAt:'desc'},take:5}), prisma.smtpSetting.findFirst({where:{isActive:true}})
 ]);
 return ok(res,{users,active,inactive,vat,tax,recentUsers,recentRecords:[...recentVat,...recentTax],smtpActive:!!smtp});
};
export const adminUsers = async (_req,res)=>ok(res, await prisma.user.findMany({select:{id:true,fullName:true,email:true,role:true,isActive:true,createdAt:true}}));
export const adminUser = async (req,res)=>ok(res, await prisma.user.findUnique({where:{id:parseId(req)},select:{id:true,fullName:true,email:true,role:true,isActive:true,createdAt:true}}));
export const adminUserStatus = async (req,res)=>ok(res, await prisma.user.update({where:{id:parseId(req)},data:{isActive: !!req.body.isActive}}));
export const adminRecords = async (_req,res)=>ok(res, {vat: await prisma.vatRecord.findMany({take:50,orderBy:{createdAt:'desc'}}), tax: await prisma.corporateTaxRecord.findMany({take:50,orderBy:{createdAt:'desc'}})});
export const getSmtp = async (_req,res)=>ok(res, await prisma.smtpSetting.findFirst({orderBy:{updatedAt:'desc'}}));
export const putSmtp = async (req,res)=> {
 const current = await prisma.smtpSetting.findFirst();
 const row = current ? await prisma.smtpSetting.update({where:{id:current.id},data:req.body}) : await prisma.smtpSetting.create({data:req.body});
 return ok(res,row);
};
