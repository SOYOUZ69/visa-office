'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { ClientDetail } from '@/components/clients/ClientDetail';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = params.id as string;

  if (!clientId) {
    return (
      <ProtectedRoute>
        <Layout>
          <Card>
            <CardHeader>
              <CardTitle>Invalid Client ID</CardTitle>
              <CardDescription>
                No client ID provided.
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Details</h1>
              <p className="text-gray-600">
                View and manage client information
              </p>
            </div>
          </div>
          {user?.role === 'ADMIN' && (
            <Button
              onClick={() => router.push(`/clients/${clientId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </Button>
          )}
        </div>

        <ClientDetail clientId={clientId} />
      </div>
      </Layout>
    </ProtectedRoute>
  );
}
