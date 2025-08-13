'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { clientsAPI, metaAPI } from '@/lib/api';
import { Client, QueryParams } from '@/types';
import { toast } from 'sonner';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function ExistingClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QueryParams>({
    page: 1,
    limit: 10,
  });
  const [meta, setMeta] = useState<any>(null);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [clientTypes, setClientTypes] = useState<string[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadMetaData();
  }, []);

  useEffect(() => {
    loadClients();
  }, [filters]);

  const loadMetaData = async () => {
    try {
      const [statusesData, typesData] = await Promise.all([
        metaAPI.getClientStatuses(),
        metaAPI.getVisaTypes(),
      ]);
      setStatuses(statusesData);
      setClientTypes(['INDIVIDUAL', 'FAMILY', 'GROUP', 'PHONE_CALL']);
    } catch (error) {
      console.error('Failed to load meta data:', error);
    }
  };

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await clientsAPI.getAll(filters);
      setClients(response.data);
      setMeta(response.meta);
    } catch (error) {
      toast.error('Failed to load clients');
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof QueryParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      await clientsAPI.delete(id);
      toast.success('Client deleted successfully');
      loadClients();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && clients.length === 0) {
    return <div className="text-center py-8">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Existing Clients</h2>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => router.push('/clients/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search by name, email, or passport..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.clientType || 'all'}
          onValueChange={(value) => handleFilterChange('clientType', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {clientTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.fullName}</TableCell>
                <TableCell>{client.clientType.replace('_', ' ')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    client.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    client.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    client.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    client.status === 'PENDING_DOCS' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell>{client.destination}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{formatDate(client.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {user?.role === 'ADMIN' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/clients/${client.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => handleFilterChange('page', meta.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => handleFilterChange('page', meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
