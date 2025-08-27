import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    // Récupérer l'utilisateur complet avec ses permissions
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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
            isActive: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const permissions = user.role?.permissions.map(rp => rp.permission.name) || [];

    return {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name,
      permissions,
      employee: user.employee,
    };
  }
}
