'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Users, Shield, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: {
    permission: Permission;
  }[];
  users: {
    id: string;
    email: string;
    employee?: {
      fullName: string;
    };
  }[];
  _count: {
    users: number;
  };
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const { toast } = useToast();

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedPermissions: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        adminAPI.getRoles(),
        adminAPI.getPermissions(),
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = isCreateMode 
        ? '/api/v1/admin/roles'
        : `/api/v1/admin/roles/${editingRole?.id}`;
      
      const method = isCreateMode ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissions: isCreateMode ? formData.selectedPermissions : undefined,
        }),
      });

      if (response.ok) {
        if (!isCreateMode && formData.selectedPermissions.length > 0) {
          // Mettre à jour les permissions pour un rôle existant
          await fetch(`/api/v1/admin/roles/${editingRole?.id}/permissions`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({
              permissionIds: formData.selectedPermissions,
            }),
          });
        }

        toast({
          title: 'Succès',
          description: `Rôle ${isCreateMode ? 'créé' : 'modifié'} avec succès`,
        });

        resetForm();
        loadData();
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le rôle',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${roleName}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Rôle supprimé avec succès',
        });
        loadData();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le rôle',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      selectedPermissions: [],
    });
    setEditingRole(null);
    setIsCreateMode(false);
  };

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setIsCreateMode(false);
    setFormData({
      name: role.name,
      description: role.description || '',
      selectedPermissions: role.permissions.map(p => p.permission.id),
    });
  };

  const startCreate = () => {
    resetForm();
    setIsCreateMode(true);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter(id => id !== permissionId)
        : [...prev.selectedPermissions, permissionId],
    }));
  };

  // Grouper les permissions par module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Rôles</h1>
          <p className="text-gray-600">Gérez les rôles et permissions des utilisateurs</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={startCreate} className="flex items-center gap-2">
              <Plus size={16} />
              Nouveau Rôle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreateMode ? 'Créer un nouveau rôle' : 'Modifier le rôle'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du rôle</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <Label className="text-base font-medium">Permissions</Label>
                <div className="mt-2 space-y-4 max-h-60 overflow-y-auto border rounded p-4">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                    <div key={module} className="space-y-2">
                      <h4 className="font-medium text-sm uppercase text-gray-700 border-b pb-1">
                        {module}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {modulePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <Label
                              htmlFor={permission.id}
                              className="text-sm cursor-pointer"
                              title={permission.description}
                            >
                              {permission.action}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit">
                  {isCreateMode ? 'Créer' : 'Modifier'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} />
                  {role.name}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {role.isSystemRole && (
                    <Badge variant="destructive" className="text-xs">
                      Système
                    </Badge>
                  )}
                  {!role.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Inactif
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {role.description && (
                <p className="text-sm text-gray-600">{role.description}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users size={16} />
                  {role._count.users} utilisateur{role._count.users !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Settings size={16} />
                  {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(role)}
                      disabled={role.isSystemRole}
                    >
                      <Edit size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Modifier le rôle</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nom du rôle</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Permissions */}
                      <div>
                        <Label className="text-base font-medium">Permissions</Label>
                        <div className="mt-2 space-y-4 max-h-60 overflow-y-auto border rounded p-4">
                          {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                            <div key={module} className="space-y-2">
                              <h4 className="font-medium text-sm uppercase text-gray-700 border-b pb-1">
                                {module}
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {modulePermissions.map((permission) => (
                                  <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={permission.id}
                                      checked={formData.selectedPermissions.includes(permission.id)}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                    />
                                    <Label
                                      htmlFor={permission.id}
                                      className="text-sm cursor-pointer"
                                      title={permission.description}
                                    >
                                      {permission.action}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Annuler
                        </Button>
                        <Button type="submit">
                          Modifier
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(role.id, role.name)}
                  disabled={role.isSystemRole || role._count.users > 0}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              {/* Utilisateurs assignés */}
              {role.users.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Utilisateurs assignés:</p>
                  <div className="space-y-1">
                    {role.users.slice(0, 3).map((user) => (
                      <div key={user.id} className="text-xs text-gray-600 flex items-center justify-between">
                        <span>{user.employee?.fullName || user.email}</span>
                      </div>
                    ))}
                    {role.users.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{role.users.length - 3} autre{role.users.length - 3 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}