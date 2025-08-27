import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function initializeRolesSystem() {
  console.log('🚀 Initialisation du système de rôles...');

  try {
    // 1. Créer les rôles de base
    console.log('1. Création des rôles...');
    
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: {
        name: 'SUPER_ADMIN',
        description: 'Administrateur système avec tous les droits',
        isSystemRole: true,
      },
    });

    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrateur avec permissions étendues',
        isSystemRole: false,
      },
    });

    const employeeRole = await prisma.role.upsert({
      where: { name: 'EMPLOYEE' },
      update: {},
      create: {
        name: 'EMPLOYEE',
        description: 'Employé standard',
        isSystemRole: false,
      },
    });

    console.log('✅ Rôles créés');

    // 2. Créer les permissions
    console.log('2. Création des permissions...');
    
    const permissions = [
      // Système
      { name: 'system.admin', module: 'system', action: 'admin', description: 'Administration système complète' },
      
      // Utilisateurs
      { name: 'users.create', module: 'users', action: 'create', description: 'Créer des utilisateurs' },
      { name: 'users.read', module: 'users', action: 'read', description: 'Consulter les utilisateurs' },
      { name: 'users.update', module: 'users', action: 'update', description: 'Modifier les utilisateurs' },
      { name: 'users.delete', module: 'users', action: 'delete', description: 'Supprimer les utilisateurs' },
      
      // Employés
      { name: 'employees.create', module: 'employees', action: 'create', description: 'Créer des employés' },
      { name: 'employees.read', module: 'employees', action: 'read', description: 'Consulter les employés' },
      { name: 'employees.update', module: 'employees', action: 'update', description: 'Modifier les employés' },
      { name: 'employees.delete', module: 'employees', action: 'delete', description: 'Supprimer les employés' },
      { name: 'employees.own', module: 'employees', action: 'own', description: 'Consulter ses propres données employé' },
      
      // Rôles
      { name: 'roles.create', module: 'roles', action: 'create', description: 'Créer des rôles' },
      { name: 'roles.read', module: 'roles', action: 'read', description: 'Consulter les rôles' },
      { name: 'roles.update', module: 'roles', action: 'update', description: 'Modifier les rôles' },
      { name: 'roles.delete', module: 'roles', action: 'delete', description: 'Supprimer les rôles' },
      
      // Clients
      { name: 'clients.create', module: 'clients', action: 'create', description: 'Créer des clients' },
      { name: 'clients.read', module: 'clients', action: 'read', description: 'Consulter les clients' },
      { name: 'clients.update', module: 'clients', action: 'update', description: 'Modifier les clients' },
      { name: 'clients.delete', module: 'clients', action: 'delete', description: 'Supprimer les clients' },
      
      // Dossiers
      { name: 'dossiers.create', module: 'dossiers', action: 'create', description: 'Créer des dossiers' },
      { name: 'dossiers.read', module: 'dossiers', action: 'read', description: 'Consulter les dossiers' },
      { name: 'dossiers.update', module: 'dossiers', action: 'update', description: 'Modifier les dossiers' },
      { name: 'dossiers.delete', module: 'dossiers', action: 'delete', description: 'Supprimer les dossiers' },
      { name: 'dossiers.assign', module: 'dossiers', action: 'assign', description: 'Assigner des dossiers' },
      
      // Services
      { name: 'services.create', module: 'services', action: 'create', description: 'Créer des services' },
      { name: 'services.read', module: 'services', action: 'read', description: 'Consulter les services' },
      { name: 'services.update', module: 'services', action: 'update', description: 'Modifier les services' },
      { name: 'services.delete', module: 'services', action: 'delete', description: 'Supprimer les services' },
      
      // Paiements
      { name: 'payments.create', module: 'payments', action: 'create', description: 'Créer des paiements' },
      { name: 'payments.read', module: 'payments', action: 'read', description: 'Consulter les paiements' },
      { name: 'payments.update', module: 'payments', action: 'update', description: 'Modifier les paiements' },
      { name: 'payments.delete', module: 'payments', action: 'delete', description: 'Supprimer les paiements' },
      
      // Financier
      { name: 'financial.create', module: 'financial', action: 'create', description: 'Créer des transactions' },
      { name: 'financial.read', module: 'financial', action: 'read', description: 'Consulter les données financières' },
      { name: 'financial.update', module: 'financial', action: 'update', description: 'Modifier les données financières' },
      { name: 'financial.approve', module: 'financial', action: 'approve', description: 'Approuver les transactions' },
      
      // Présence
      { name: 'attendance.create', module: 'attendance', action: 'create', description: 'Enregistrer la présence' },
      { name: 'attendance.read', module: 'attendance', action: 'read', description: 'Consulter les présences' },
      { name: 'attendance.own', module: 'attendance', action: 'own', description: 'Consulter sa propre présence' },
      
      // Rapports
      { name: 'reports.generate', module: 'reports', action: 'generate', description: 'Générer des rapports' },
      { name: 'reports.view', module: 'reports', action: 'view', description: 'Consulter les rapports' },
    ];

    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
      });
    }

    console.log('✅ Permissions créées');

    // 3. Assigner toutes les permissions au SUPER_ADMIN
    console.log('3. Attribution des permissions...');
    
    const allPermissions = await prisma.permission.findMany();
    
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });
    }

    // Assigner les permissions d'admin normal
    const adminPermissions = allPermissions.filter(p => 
      !p.name.includes('system.admin') && 
      !p.name.includes('roles.delete') &&
      !p.name.includes('users.delete')
    );

    for (const permission of adminPermissions) {
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

    // Assigner les permissions d'employé
    const employeePermissions = allPermissions.filter(p => 
      p.name.includes('.own') || 
      p.name.includes('clients.read') ||
      p.name.includes('dossiers.read') ||
      p.name.includes('services.read')
    );

    for (const permission of employeePermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: employeeRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: employeeRole.id,
          permissionId: permission.id,
        },
      });
    }

    console.log('✅ Permissions assignées');

    // 4. Mettre à jour les utilisateurs existants
    console.log('4. Migration des utilisateurs existants...');
    
    // Créer un super admin par défaut
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.upsert({
      where: { email: 'admin@visa-office.com' },
      update: {
        roleId: superAdminRole.id,
      },
      create: {
        email: 'admin@visa-office.com',
        password: hashedPassword,
        roleId: superAdminRole.id,
      },
    });

    // Mettre à jour l'utilisateur standard
    const userHashedPassword = await bcrypt.hash('user123', 10);
    
    await prisma.user.upsert({
      where: { email: 'user@visa-office.com' },
      update: {
        roleId: employeeRole.id,
      },
      create: {
        email: 'user@visa-office.com',
        password: userHashedPassword,
        roleId: employeeRole.id,
      },
    });

    console.log('✅ Utilisateurs mis à jour');

    // 5. Statistiques finales
    const stats = await Promise.all([
      prisma.role.count(),
      prisma.permission.count(),
      prisma.rolePermission.count(),
      prisma.user.count(),
    ]);

    console.log('📊 Statistiques finales:');
    console.log(`   - Rôles: ${stats[0]}`);
    console.log(`   - Permissions: ${stats[1]}`);
    console.log(`   - Liaisons rôles-permissions: ${stats[2]}`);
    console.log(`   - Utilisateurs: ${stats[3]}`);

    console.log('🎉 Initialisation terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  initializeRolesSystem()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { initializeRolesSystem };