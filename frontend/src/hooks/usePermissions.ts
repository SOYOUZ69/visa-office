import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (roleName: string): boolean => {
    return user?.roleName === roleName;
  };

  const isAdmin = (): boolean => {
    return user?.roleName === 'Admin';
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasRole,
    isAdmin,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permissions || [],
    roleName: user?.roleName,
  };
};