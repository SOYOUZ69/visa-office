import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // =================
  // GESTION DES RÔLES
  // =================

  async createRole(data: {
    name: string;
    description?: string;
    permissions?: string[];
    createdBy: string;
  }) {
    const { permissions, createdBy, ...roleData } = data;

    const role = await this.prisma.role.create({
      data: roleData,
    });

    // Assigner les permissions si fournies
    if (permissions && permissions.length > 0) {
      await this.assignPermissionsToRole(role.id, permissions, createdBy);
    }

    return this.getRoleWithPermissions(role.id);
  }

  async getAllRoles(includeInactive = false) {
    return this.prisma.role.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                fullName: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getRoleById(roleId: string) {
    const role = await this.getRoleWithPermissions(roleId);
    if (!role) {
      throw new NotFoundException(`Rôle avec l'ID ${roleId} introuvable`);
    }
    return role;
  }

  async updateRole(
    roleId: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    // Vérifier que ce n'est pas un rôle système
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Rôle avec l'ID ${roleId} introuvable`);
    }

    if (role.isSystemRole) {
      throw new ForbiddenException(
        'Impossible de modifier un rôle système',
      );
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async deleteRole(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Rôle avec l'ID ${roleId} introuvable`);
    }

    if (role.isSystemRole) {
      throw new ForbiddenException(
        'Impossible de supprimer un rôle système',
      );
    }

    if (role.users.length > 0) {
      throw new BadRequestException(
        'Impossible de supprimer un rôle assigné à des utilisateurs',
      );
    }

    return this.prisma.role.delete({
      where: { id: roleId },
    });
  }

  // ========================
  // GESTION DES PERMISSIONS
  // ========================

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
    grantedBy: string,
  ) {
    // Supprimer les permissions existantes
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Ajouter les nouvelles permissions
    const rolePermissions = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
      grantedBy,
    }));

    await this.prisma.rolePermission.createMany({
      data: rolePermissions,
    });

    return this.getRoleWithPermissions(roleId);
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  // ========================
  // GESTION DES UTILISATEURS
  // ========================

  async createUser(data: {
    email: string;
    password: string;
    roleId?: string;
    employeeData?: {
      fullName: string;
      department?: string;
      hireDate?: Date;
      salaryType: string;
      salaryAmount: number;
      commissionPercentage: string;
    };
  }) {
    const { employeeData, ...userData } = data;

    return this.prisma.$transaction(async (prisma) => {
      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: userData.password,
          role: userData.roleId ? {
            connect: { id: userData.roleId }
          } : undefined,
        },
      });

      // Créer l'employé si des données employé sont fournies
      if (employeeData) {
        await prisma.employee.create({
          data: {
            fullName: employeeData.fullName,
            department: employeeData.department,
            hireDate: employeeData.hireDate ? new Date(employeeData.hireDate) : undefined,
            salaryType: employeeData.salaryType as any,
            salaryAmount: employeeData.salaryAmount.toString(),
            commissionPercentage: employeeData.commissionPercentage,
            email: user.email,
            userId: user.id,
          },
        });
      }

      return this.getUserWithDetails(user.id);
    });
  }

  async getAllUsers(includeInactive = false) {
    return this.prisma.user.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        employee: {
          select: {
            fullName: true,
            department: true,
            hireDate: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(userId: string) {
    const user = await this.getUserWithDetails(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable`);
    }
    return user;
  }

  async updateUser(
    userId: string,
    data: {
      email?: string;
      roleId?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        role: true,
        employee: true,
      },
    });
  }

  async deleteUser(userId: string) {
    // Vérifier s'il y a un employé lié
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable`);
    }

    return this.prisma.$transaction(async (prisma) => {
      // Supprimer l'employé s'il existe
      if (user.employee) {
        await prisma.employee.delete({
          where: { userId },
        });
      }

      // Supprimer l'utilisateur
      await prisma.user.delete({
        where: { id: userId },
      });
    });
  }


  async assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  // ====================
  // VÉRIFICATION PERMISSIONS
  // ====================

  async userHasPermission(userId: string, permissionName: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.role) {
      return false;
    }

    return user.role.permissions.some(
      (rp) => rp.permission.name === permissionName,
    );
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.role) {
      return [];
    }

    return user.role.permissions.map((rp) => rp.permission);
  }

  // =============
  // MÉTHODES UTILITAIRES
  // =============

  private async getRoleWithPermissions(roleId: string) {
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });
  }

  private async getUserWithDetails(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        employee: true,
        sessions: {
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            lastActivity: 'desc',
          },
          take: 5,
        },
      },
    });
  }

  // ====================
  // INITIALISATION SYSTÈME
  // ====================

  async initializeSystemRoles() {
    // Créer le rôle SUPER_ADMIN s'il n'existe pas
    const superAdminRole = await this.prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: {
        name: 'SUPER_ADMIN',
        description: 'Administrateur système avec tous les droits',
        isSystemRole: true,
      },
    });

    // Créer toutes les permissions de base
    await this.createDefaultPermissions();

    // Assigner toutes les permissions au SUPER_ADMIN
    const allPermissions = await this.prisma.permission.findMany();
    const rolePermissions = allPermissions.map((permission) => ({
      roleId: superAdminRole.id,
      permissionId: permission.id,
      grantedBy: null, // Système
    }));

    await this.prisma.rolePermission.createMany({
      data: rolePermissions,
      skipDuplicates: true,
    });

    return superAdminRole;
  }

  private async createDefaultPermissions() {
    const permissions = [
      // Gestion utilisateurs
      { name: 'users.create', module: 'users', action: 'create', description: 'Créer des utilisateurs' },
      { name: 'users.read', module: 'users', action: 'read', description: 'Consulter les utilisateurs' },
      { name: 'users.update', module: 'users', action: 'update', description: 'Modifier les utilisateurs' },
      { name: 'users.delete', module: 'users', action: 'delete', description: 'Supprimer les utilisateurs' },
      
      // Gestion employés
      { name: 'employees.create', module: 'employees', action: 'create', description: 'Créer des employés' },
      { name: 'employees.read', module: 'employees', action: 'read', description: 'Consulter les employés' },
      { name: 'employees.update', module: 'employees', action: 'update', description: 'Modifier les employés' },
      { name: 'employees.delete', module: 'employees', action: 'delete', description: 'Supprimer les employés' },
      
      // Gestion rôles
      { name: 'roles.create', module: 'roles', action: 'create', description: 'Créer des rôles' },
      { name: 'roles.read', module: 'roles', action: 'read', description: 'Consulter les rôles' },
      { name: 'roles.update', module: 'roles', action: 'update', description: 'Modifier les rôles' },
      { name: 'roles.delete', module: 'roles', action: 'delete', description: 'Supprimer les rôles' },
      
      // Gestion clients
      { name: 'clients.create', module: 'clients', action: 'create', description: 'Créer des clients' },
      { name: 'clients.read', module: 'clients', action: 'read', description: 'Consulter les clients' },
      { name: 'clients.update', module: 'clients', action: 'update', description: 'Modifier les clients' },
      { name: 'clients.delete', module: 'clients', action: 'delete', description: 'Supprimer les clients' },
      
      // Gestion financière
      { name: 'financial.create', module: 'financial', action: 'create', description: 'Créer des transactions financières' },
      { name: 'financial.read', module: 'financial', action: 'read', description: 'Consulter les données financières' },
      { name: 'financial.update', module: 'financial', action: 'update', description: 'Modifier les données financières' },
      { name: 'financial.approve', module: 'financial', action: 'approve', description: 'Approuver les transactions' },
      
      // Permissions spéciales
      { name: 'system.admin', module: 'system', action: 'admin', description: 'Administration système complète' },
      { name: 'reports.generate', module: 'reports', action: 'generate', description: 'Générer des rapports' },
    ];

    for (const permission of permissions) {
      await this.prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
      });
    }
  }
}