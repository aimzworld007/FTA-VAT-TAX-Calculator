import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../src/lib/prisma.js';
import { requireAuth } from '../../src/server/requireAuth.js';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = requireAuth(req,res); if(!auth) return;
  if(req.method==='GET'){ const profile= await prisma.businessProfile.findUnique({where:{userId:auth.sub}}); return res.status(200).json(profile); }
  if(req.method==='POST' || req.method==='PUT'){ const body=req.body||{}; const profile=await prisma.businessProfile.upsert({where:{userId:auth.sub},create:{userId:auth.sub,businessName:body.businessName,trn:body.TRN,email:body.email,phone:body.phone,address:body.address,emirate:body.emirate,taxPeriodType:body.taxPeriodType},update:{businessName:body.businessName,trn:body.TRN,email:body.email,phone:body.phone,address:body.address,emirate:body.emirate,taxPeriodType:body.taxPeriodType}}); return res.status(200).json(profile); }
  res.status(405).json({error:'Method not allowed'});
}
