'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, User, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  email: string;
  roleId?: string;
  role?: Role;
  isActive: boolean;
  employee?: {
    id: string;
    fullName: string;
    department?: string;
  };
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const { toast } = useToast();

  // Formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roleId: '',
    isActive: true,
    employeeData: {
      fullName: '',
      department: '',
      salaryType: 'MONTHLY' as const,
      salaryAmount: 0,
      commissionPercentage: '0',
    },
    createEmployee: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getRoles(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
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
      const body = {
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        roleId: formData.roleId,
        isActive: formData.isActive,
        ...(isCreateMode && formData.createEmployee && {
          employeeData: formData.employeeData,
        }),
      };

      if (isCreateMode) {
        await adminAPI.createUser(body);
      } else {
        await adminAPI.updateUser(editingUser!.id, body);
      }

      toast({
        title: 'Succès',
        description: `Utilisateur ${isCreateMode ? 'créé' : 'modifié'} avec succès`,
      });

      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userEmail}" ?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      
      toast({
        title: 'Succès',
        description: 'Utilisateur supprimé avec succès',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'utilisateur',
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateUser(userId, {
        isActive: !currentStatus,
      });
      
      toast({
        title: 'Succès',
        description: `Utilisateur ${!currentStatus ? 'activé' : 'désactivé'}`,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      roleId: '',
      isActive: true,
      employeeData: {
        fullName: '',
        department: '',
        salaryType: 'MONTHLY',
        salaryAmount: 0,
        commissionPercentage: '0',
      },
      createEmployee: false,
    });
    setEditingUser(null);
    setIsCreateMode(false);
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setIsCreateMode(false);
    setFormData({
      email: user.email,
      password: '',
      roleId: user.roleId || '',
      isActive: user.isActive,
      employeeData: {
        fullName: user.employee?.fullName || '',
        department: user.employee?.department || '',
        salaryType: 'MONTHLY',
        salaryAmount: 0,
        commissionPercentage: '0',
      },
      createEmployee: false,
    });
  };

  const startCreate = () => {
    resetForm();
    setIsCreateMode(true);
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-gray-600">Gérez les comptes utilisateurs et employés</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={startCreate} className="flex items-center gap-2">
              <Plus size={16} />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreateMode ? 'Créer un nouvel utilisateur' : 'Modifier l\'utilisateur'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    Mot de passe {!isCreateMode && '(laisser vide pour ne pas changer)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={isCreateMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <Select 
                    value={formData.roleId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Compte actif</Label>
                </div>
              </div>

              {isCreateMode && (
                <div className="border rounded p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      id="createEmployee"
                      checked={formData.createEmployee}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, createEmployee: checked }))}
                    />
                    <Label htmlFor="createEmployee">Créer aussi un profil employé</Label>
                  </div>

                  {formData.createEmployee && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Nom complet</Label>
                          <Input
                            id="fullName"
                            value={formData.employeeData.fullName}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              employeeData: { ...prev.employeeData, fullName: e.target.value }
                            }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="department">Département</Label>
                          <Input
                            id="department"
                            value={formData.employeeData.department}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              employeeData: { ...prev.employeeData, department: e.target.value }
                            }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="salaryType">Type de salaire</Label>
                          <Select 
                            value={formData.employeeData.salaryType}
                            onValueChange={(value: 'MONTHLY' | 'CLIENTCOMMISSION' | 'PERIODCOMMISSION') => 
                              setFormData(prev => ({
                                ...prev,
                                employeeData: { ...prev.employeeData, salaryType: value }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MONTHLY">Mensuel</SelectItem>
                              <SelectItem value="CLIENTCOMMISSION">Commission Client</SelectItem>
                              <SelectItem value="PERIODCOMMISSION">Commission Période</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="salaryAmount">Montant salaire</Label>
                          <Input
                            id="salaryAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.employeeData.salaryAmount}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              employeeData: { ...prev.employeeData, salaryAmount: parseFloat(e.target.value) }
                            }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="commission">Commission (%)</Label>
                          <Input
                            id="commission"
                            value={formData.employeeData.commissionPercentage}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              employeeData: { ...prev.employeeData, commissionPercentage: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {user.isActive ? (
                    <UserCheck size={20} className="text-green-600" />
                  ) : (
                    <UserX size={20} className="text-red-600" />
                  )}
                  {user.employee?.fullName || user.email}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {user.roleName && (
                    <Badge variant="outline">
                      {user.roleName}
                    </Badge>
                  )}
                  {!user.isActive && (
                    <Badge variant="destructive">
                      Inactif
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                
                {user.employee && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Département:</span>
                      <span className="font-medium">{user.employee.department || 'Non défini'}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Créé le:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={() => toggleUserStatus(user.id, user.isActive)}
                    size="sm"
                  />
                  <span className="text-sm text-gray-600">
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(user)}
                      >
                        <Edit size={16} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Modifier l'utilisateur</DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="password">
                              Nouveau mot de passe (optionnel)
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="role">Rôle</Label>
                            <Select 
                              value={formData.roleId} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un rôle" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isActive"
                              checked={formData.isActive}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="isActive">Compte actif</Label>
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
                    onClick={() => handleDelete(user.id, user.email)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}