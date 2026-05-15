import { prisma } from '../src/lib/prisma.js';

async function main() {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    console.error('SUPERADMIN_EMAIL is required.');
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`No user found for ${email}. Create the user first.`);
    process.exitCode = 1;
    return;
  }

  if (user.role === 'SUPERADMIN') {
    console.log(`User ${email} is already SUPERADMIN.`);
    return;
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: 'SUPERADMIN' } });
  console.log(`User ${email} promoted to SUPERADMIN.`);
}

main()
  .catch((error) => {
    console.error('Failed to promote superadmin.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
