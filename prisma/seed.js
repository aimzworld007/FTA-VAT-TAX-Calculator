import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;
  const fullName = process.env.SUPERADMIN_NAME?.trim() || 'Super Admin';
  if (!email || !password) {
    console.log('Seed skipped: set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD to create initial SUPERADMIN.');
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({ where: { email }, update: { fullName, role: 'SUPERADMIN', passwordHash, isActive: true }, create: { email, fullName, passwordHash, role: 'SUPERADMIN', isActive: true } });
  console.log(`SUPERADMIN ensured: ${email}`);
}

main().finally(() => prisma.$disconnect());
