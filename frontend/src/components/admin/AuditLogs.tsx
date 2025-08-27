'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Eye, Clock, User } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    email: string;
    employee?: {
      fullName: string;
    };
  };
  employee?: {
    fullName: string;
  };
  oldValues?: any;
  newValues?: any;
}

interface AuditResponse {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/v1/admin/audit-logs?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data: AuditResponse = await response.json();
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('CREATE')) return 'default';
    if (action.includes('UPDATE')) return 'secondary';
    if (action.includes('DELETE')) return 'destructive';
    if (action.includes('LOGIN')) return 'outline';
    return 'secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getUserName = (log: AuditLog) => {
    if (log.user?.employee?.fullName) {
      return log.user.employee.fullName;
    }
    if (log.employee?.fullName) {
      return log.employee.fullName;
    }
    if (log.user?.email) {
      return log.user.email;
    }
    return 'Système';
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
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
      {/* Header et Filtres */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Journal d'Audit</h2>
            <p className="text-gray-600">Historique des actions des utilisateurs</p>
          </div>
          
          <Button onClick={loadLogs} variant="outline" className="flex items-center gap-2">
            <RefreshCw size={16} />
            Actualiser
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="action-filter">Filtrer par action</Label>
                <Input
                  id="action-filter"
                  placeholder="Ex: LOGIN, CREATE_CLIENT..."
                  value={filters.action}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value, page: 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="limit-select">Éléments par page</Label>
                <Select 
                  value={filters.limit.toString()}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, limit: parseInt(value), page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={loadLogs} className="w-full flex items-center gap-2">
                  <Search size={16} />
                  Rechercher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
              <div className="text-sm text-gray-600">Total des logs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{logs.filter(l => l.action.includes('CREATE')).length}</div>
              <div className="text-sm text-gray-600">Créations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{logs.filter(l => l.action.includes('UPDATE')).length}</div>
              <div className="text-sm text-gray-600">Modifications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{logs.filter(l => l.action.includes('DELETE')).length}</div>
              <div className="text-sm text-gray-600">Suppressions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                    {log.resourceType && (
                      <span className="text-sm text-gray-600">
                        {log.resourceType}
                        {log.resourceId && ` (${log.resourceId.slice(0, 8)}...)`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {getUserName(log)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDate(log.createdAt)}
                    </div>
                    {log.ipAddress && (
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        {log.ipAddress}
                      </div>
                    )}
                  </div>

                  {log.userAgent && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      User-Agent: {log.userAgent}
                    </div>
                  )}

                  {(log.oldValues || log.newValues) && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        Voir les détails des changements
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded space-y-2">
                        {log.oldValues && (
                          <div>
                            <strong>Anciennes valeurs:</strong>
                            <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(log.oldValues, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.newValues && (
                          <div>
                            <strong>Nouvelles valeurs:</strong>
                            <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(log.newValues, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {logs.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun log d'audit trouvé</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} sur {pagination.pages} 
                ({pagination.total} éléments au total)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}