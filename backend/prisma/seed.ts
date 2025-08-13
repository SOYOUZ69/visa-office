import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@visa-office.com' },
    update: {},
    create: {
      email: 'admin@visa-office.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@visa-office.com' },
    update: {},
    create: {
      email: 'user@visa-office.com',
      password: userPassword,
      role: UserRole.USER,
    },
  });

  console.log('Seed completed:');
  console.log('Admin user:', admin.email);
  console.log('Regular user:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
