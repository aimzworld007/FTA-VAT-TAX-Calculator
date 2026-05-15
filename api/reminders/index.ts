import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../src/lib/prisma.js';
import { requireAuth } from '../../src/server/requireAuth.js';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req,res); if(!auth) return;
  if(req.method==='GET'){ const reminders= await prisma.reminder.findMany({where:{userId:auth.sub}, orderBy:{dueDate:'asc'}}); return res.status(200).json(reminders); }
  if(req.method==='POST'){ const body=req.body||{}; const reminder=await prisma.reminder.create({data:{userId:auth.sub,title:body.title,type:body.type,dueDate:new Date(body.dueDate)}}); return res.status(200).json(reminder); }
  if(req.method==='PUT'){ const body=req.body||{}; const reminder=await prisma.reminder.update({where:{id:body.id,userId:auth.sub} as any,data:{title:body.title,type:body.type,dueDate:new Date(body.dueDate),status:body.status}}); return res.status(200).json(reminder); }
  if(req.method==='DELETE'){ const id=(req.query.id||req.body?.id) as string; await prisma.reminder.deleteMany({where:{id,userId:auth.sub}}); return res.status(200).json({ok:true}); }
  res.status(405).json({error:'Method not allowed'});
}
