import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
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
      },
    });

    if (user && user.isActive && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: user.email, 
      sub: user.id,
      roleId: user.roleId,
      roleName: user.role?.name,
    };

    const permissions = user.role?.permissions.map(rp => rp.permission.name) || [];

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role?.name,
        permissions,
        employee: user.employee ? {
          id: user.employee.id,
          fullName: user.employee.fullName,
          department: user.employee.department,
        } : null,
      },
    };
  }

  async getProfile(userId: string) {
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
        employee: {
          select: {
            id: true,
            fullName: true,
            department: true,
            hireDate: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissions = user.role?.permissions.map(rp => rp.permission.name) || [];

    return {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name,
      permissions,
      employee: user.employee,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
