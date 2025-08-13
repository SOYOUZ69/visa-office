'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { ClientForm } from '@/components/clients/ClientForm';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { clientsAPI } from '@/lib/api';
import { Client } from '@/types';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const clientId = params.id as string;

  useEffect(() => {
    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  const loadClient = async () => {
    try {
      const clientData = await clientsAPI.getById(clientId);
      setClient(clientData);
    } catch (error) {
      toast.error('Failed to load client data');
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <ProtectedRoute>
        <Layout>
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to edit clients.
              </CardDescription>
            </CardHeader>
          </Card>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading client data...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!client) {
    return (
      <ProtectedRoute>
        <Layout>
          <Card>
            <CardHeader>
              <CardTitle>Client Not Found</CardTitle>
              <CardDescription>
                The requested client could not be found.
              </CardDescription>
            </CardHeader>
          </Card>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
          <p className="text-gray-600">
            Update client information for {client.fullName}
          </p>
        </div>

        <ClientForm 
          clientType={client.clientType} 
          client={client} 
          isEdit={true} 
        />
      </div>
      </Layout>
    </ProtectedRoute>
  );
}
