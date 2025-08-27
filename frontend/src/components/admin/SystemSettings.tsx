'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Users, Shield, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';

interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  employees: {
    total: number;
    active: number;
    inactive: number;
  };
  roles: {
    total: number;
  };
}

export default function SystemSettings() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminAPI.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSystem = async () => {
    setInitializing(true);
    try {
      const response = await fetch('/api/v1/admin/initialize-system', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Système initialisé avec succès',
        });
        loadStats();
      } else {
        throw new Error('Erreur lors de l\'initialisation');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'initialiser le système',
        variant: 'destructive',
      });
    } finally {
      setInitializing(false);
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Paramètres Système</h2>
          <p className="text-gray-600">Configuration et statistiques du système</p>
        </div>
        
        <Button onClick={loadStats} variant="outline" className="flex items-center gap-2">
          <RefreshCw size={16} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="default" className="text-xs">
                  {stats.users.active} actifs
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {stats.users.inactive} inactifs
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employés</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.employees.total}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="default" className="text-xs">
                  {stats.employees.active} actifs
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {stats.employees.inactive} inactifs
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rôles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.roles.total}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Rôles configurés
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions Système */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={20} />
              Initialisation Système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Initialise le système avec les rôles et permissions par défaut. 
              Cette action est sûre et peut être exécutée plusieurs fois.
            </p>
            <Button 
              onClick={initializeSystem}
              disabled={initializing}
              className="w-full"
            >
              {initializing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Initialisation...
                </>
              ) : (
                'Initialiser le Système'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Authentification JWT:</span>
                <Badge variant="default">Activée</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Permissions dynamiques:</span>
                <Badge variant="default">Activées</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Audit des actions:</span>
                <Badge variant="default">Activé</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations Système */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base de données:</span>
                <span className="font-medium">PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Backend:</span>
                <span className="font-medium">NestJS + Prisma</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Frontend:</span>
                <span className="font-medium">Next.js + Tailwind</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dernière mise à jour:</span>
                <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environnement:</span>
                <span className="font-medium">Développement</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}