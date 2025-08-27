import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Clients permissions
  { name: 'clients.create', module: 'clients', action: 'create', description: 'Create new clients' },
  { name: 'clients.read', module: 'clients', action: 'read', description: 'View clients' },
  { name: 'clients.update', module: 'clients', action: 'update', description: 'Edit client information' },
  { name: 'clients.delete', module: 'clients', action: 'delete', description: 'Delete clients' },
  
  // Services permissions
  { name: 'services.create', module: 'services', action: 'create', description: 'Create new services' },
  { name: 'services.read', module: 'services', action: 'read', description: 'View services' },
  { name: 'services.update', module: 'services', action: 'update', description: 'Edit service information' },
  { name: 'services.delete', module: 'services', action: 'delete', description: 'Delete services' },
  
  // Payments permissions
  { name: 'payments.create', module: 'payments', action: 'create', description: 'Process new payments' },
  { name: 'payments.read', module: 'payments', action: 'read', description: 'View payments' },
  { name: 'payments.update', module: 'payments', action: 'update', description: 'Edit payment information' },
  { name: 'payments.delete', module: 'payments', action: 'delete', description: 'Delete payments' },
  
  // Financial permissions
  { name: 'financial.create', module: 'financial', action: 'create', description: 'Create financial records' },
  { name: 'financial.read', module: 'financial', action: 'read', description: 'View financial data' },
  { name: 'financial.update', module: 'financial', action: 'update', description: 'Edit financial records' },
  { name: 'financial.delete', module: 'financial', action: 'delete', description: 'Delete financial records' },
  { name: 'financial.approve', module: 'financial', action: 'approve', description: 'Approve financial transactions' },
  
  // Dossiers permissions
  { name: 'dossiers.create', module: 'dossiers', action: 'create', description: 'Create new dossiers' },
  { name: 'dossiers.read', module: 'dossiers', action: 'read', description: 'View dossiers' },
  { name: 'dossiers.update', module: 'dossiers', action: 'update', description: 'Edit dossier information' },
  { name: 'dossiers.delete', module: 'dossiers', action: 'delete', description: 'Delete dossiers' },
  
  // Attachments permissions
  { name: 'attachments.create', module: 'attachments', action: 'create', description: 'Upload attachments' },
  { name: 'attachments.read', module: 'attachments', action: 'read', description: 'View attachments' },
  { name: 'attachments.delete', module: 'attachments', action: 'delete', description: 'Delete attachments' },
  
  // Employee permissions
  { name: 'employees.create', module: 'employees', action: 'create', description: 'Create new employees' },
  { name: 'employees.read', module: 'employees', action: 'read', description: 'View employees' },
  { name: 'employees.update', module: 'employees', action: 'update', description: 'Edit employee information' },
  { name: 'employees.delete', module: 'employees', action: 'delete', description: 'Delete employees' },
  
  // User management permissions
  { name: 'users.create', module: 'users', action: 'create', description: 'Create new users' },
  { name: 'users.read', module: 'users', action: 'read', description: 'View users' },
  { name: 'users.update', module: 'users', action: 'update', description: 'Edit user information' },
  { name: 'users.delete', module: 'users', action: 'delete', description: 'Delete users' },
  { name: 'users.assign_role', module: 'users', action: 'assign_role', description: 'Assign roles to users' },
  
  // Role management permissions
  { name: 'roles.create', module: 'roles', action: 'create', description: 'Create new roles' },
  { name: 'roles.read', module: 'roles', action: 'read', description: 'View roles' },
  { name: 'roles.update', module: 'roles', action: 'update', description: 'Edit role information' },
  { name: 'roles.delete', module: 'roles', action: 'delete', description: 'Delete roles' },
  { name: 'roles.assign_permissions', module: 'roles', action: 'assign_permissions', description: 'Assign permissions to roles' },
  
  // System permissions
  { name: 'system.stats', module: 'system', action: 'stats', description: 'View system statistics' },
  { name: 'system.audit', module: 'system', action: 'audit', description: 'View audit logs' },
];

const ADMIN_PERMISSIONS = [
  // All permissions for admin
  ...PERMISSIONS.map(p => p.name)
];

const USER_PERMISSIONS = [
  // Limited permissions for regular users
  'clients.create',
  'clients.read',
  'clients.update',
  'services.create',
  'services.read',
  'services.update',
  'payments.create',
  'payments.read',
  'dossiers.create',
  'dossiers.read',
  'dossiers.update',
  'attachments.create',
  'attachments.read',
];

async function main() {
  console.log('Initializing permissions system...');
  
  // Create all permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { 
        module: perm.module,
        action: perm.action,
        description: perm.description 
      },
      create: {
        name: perm.name,
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
    });
  }
  console.log(`Created ${PERMISSIONS.length} permissions`);
  
  // Get admin and user roles
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  const userRole = await prisma.role.findUnique({ where: { name: 'User' } });
  
  if (!adminRole || !userRole) {
    throw new Error('Admin or User role not found. Please run the seed script first.');
  }
  
  // Assign permissions to admin role
  for (const permName of ADMIN_PERMISSIONS) {
    const permission = await prisma.permission.findUnique({ where: { name: permName } });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }
  console.log(`Assigned ${ADMIN_PERMISSIONS.length} permissions to Admin role`);
  
  // Assign permissions to user role
  for (const permName of USER_PERMISSIONS) {
    const permission = await prisma.permission.findUnique({ where: { name: permName } });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      });
    }
  }
  console.log(`Assigned ${USER_PERMISSIONS.length} permissions to User role`);
  
  console.log('Permission system initialized successfully!');
  
  // Display summary
  const totalUsers = await prisma.user.count();
  const totalRoles = await prisma.role.count();
  const totalPermissions = await prisma.permission.count();
  
  console.log('\n=== SYSTEM SUMMARY ===');
  console.log(`Users: ${totalUsers}`);
  console.log(`Roles: ${totalRoles}`);
  console.log(`Permissions: ${totalPermissions}`);
  console.log('\n=== DEFAULT ACCOUNTS ===');
  console.log('Admin: admin@visa-office.com / admin123');
  console.log('User: user@visa-office.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });