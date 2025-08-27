import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default roles first
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'System administrator with full access',
      isActive: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'Regular user with limited access',
      isActive: true,
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@visa-office.com' },
    update: {},
    create: {
      email: 'admin@visa-office.com',
      password: adminPassword,
      roleId: adminRole.id,
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
      roleId: userRole.id,
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
