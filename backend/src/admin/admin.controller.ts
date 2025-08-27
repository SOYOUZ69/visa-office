import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesService } from '../roles/roles.service';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import * as bcrypt from 'bcrypt';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly rolesService: RolesService) {}

  // ========================
  // GESTION DES RÔLES
  // ========================

  @Get('roles')
  @UseGuards(PermissionGuard)
  @RequirePermissions('roles.read')
  async getAllRoles(@Query('includeInactive') includeInactive?: string) {
    return this.rolesService.getAllRoles(includeInactive === 'true');
  }

  @Get('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions('roles.read')
  async getRoleById(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @Post('roles')
  @UseGuards(PermissionGuard)
  @RequirePermissions('roles.create')
  async createRole(
    @Body()
    body: {
      name: string;
      description?: string;
      permissions?: string[];
    },
    @Request() req,
  ) {
    if (!body.name?.trim()) {
      throw new BadRequestException('Le nom du rôle est obligatoire');
    }

    return this.rolesService.createRole({
      ...body,
      createdBy: req.user.userId,
    });
  }

  @Put('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions('roles.update')
  async updateRole(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.rolesService.updateRole(id, body);
  }

  @Delete('roles/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions('roles.delete')
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  @Put('roles/:roleId/permissions')
  @UseGuards(PermissionGuard)
  @RequirePermissions('roles.update')
  async assignPermissionsToRole(
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: string[] },
    @Request() req,
  ) {
    return this.rolesService.assignPermissionsToRole(
      roleId,
      body.permissionIds,
      req.user.userId,
    );
  }

  // ========================
  // GESTION DES PERMISSIONS
  // ========================

  @Get('permissions')
  @UseGuards(PermissionGuard)
  @RequirePermissions('roles.read')
  async getAllPermissions() {
    return this.rolesService.getAllPermissions();
  }

  // ========================
  // GESTION DES UTILISATEURS
  // ========================

  @Get('users')
  @UseGuards(PermissionGuard)
  @RequirePermissions('users.read')
  async getAllUsers(@Query('includeInactive') includeInactive?: string) {
    return this.rolesService.getAllUsers(includeInactive === 'true');
  }

  @Get('users/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions('users.read')
  async getUserById(@Param('id') id: string) {
    return this.rolesService.getUserById(id);
  }

  @Post('users')
  @UseGuards(PermissionGuard)
  @RequirePermissions('users.create')
  async createUser(
    @Body()
    body: {
      email: string;
      password: string;
      roleId?: string;
      employeeData?: {
        fullName: string;
        department?: string;
        hireDate?: Date;
        salaryType: 'MONTHLY' | 'CLIENTCOMMISSION' | 'PERIODCOMMISSION';
        salaryAmount: number;
        commissionPercentage: string;
      };
    },
  ) {
    if (!body.email?.trim() || !body.password?.trim()) {
      throw new BadRequestException('Email et mot de passe sont obligatoires');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(body.password, 10);

    return this.rolesService.createUser({
      ...body,
      password: hashedPassword,
    });
  }

  @Put('users/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions('users.update')
  async updateUser(
    @Param('id') id: string,
    @Body()
    body: {
      email?: string;
      password?: string;
      roleId?: string;
      isActive?: boolean;
    },
  ) {
    // Hasher le nouveau mot de passe si fourni
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    return this.rolesService.updateUser(id, body);
  }

  @Delete('users/:id')
  @UseGuards(PermissionGuard)
  @RequirePermissions('users.delete')
  async deleteUser(@Param('id') id: string) {
    return this.rolesService.deleteUser(id);
  }

  @Put('users/:userId/role')
  @UseGuards(PermissionGuard)
  @RequirePermissions('users.update')
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Body() body: { roleId: string },
  ) {
    if (!body.roleId) {
      throw new BadRequestException('ID du rôle obligatoire');
    }

    return this.rolesService.assignRoleToUser(userId, body.roleId);
  }

  // ========================
  // STATISTIQUES ADMIN
  // ========================

  @Get('statistics')
  @UseGuards(PermissionGuard)
  @RequirePermissions('system.admin')
  async getAdminStatistics() {
    const [
      totalUsers,
      activeUsers,
      totalRoles,
      totalEmployees,
      activeEmployees,
    ] = await Promise.all([
      this.rolesService['prisma'].user.count(),
      this.rolesService['prisma'].user.count({ where: { isActive: true } }),
      this.rolesService['prisma'].role.count(),
      this.rolesService['prisma'].employee.count(),
      this.rolesService['prisma'].employee.count({ where: { isActive: true } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees,
      },
      roles: {
        total: totalRoles,
      },
    };
  }

  // ========================
  // AUDIT LOGS
  // ========================

  @Get('audit-logs')
  @UseGuards(PermissionGuard)
  @RequirePermissions('system.admin')
  async getAuditLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      this.rolesService['prisma'].auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              employee: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          employee: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.rolesService['prisma'].auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  // ========================
  // INITIALISATION SYSTÈME
  // ========================

  @Post('initialize-system')
  @UseGuards(PermissionGuard)
  @RequirePermissions('system.admin')
  async initializeSystem() {
    return this.rolesService.initializeSystemRoles();
  }
}