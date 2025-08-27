import { SetMetadata } from '@nestjs/common';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// Décorateur pour les permissions multiples avec logique OR
export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata('anyPermissions', permissions);

// Décorateur pour marquer une route comme publique (bypass auth)
export const Public = () => SetMetadata('isPublic', true);