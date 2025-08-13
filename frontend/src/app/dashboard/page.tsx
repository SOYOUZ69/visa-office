'use client';

import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Clock, CheckCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Clients',
      value: '0',
      description: 'All time clients',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Pending Documents',
      value: '0',
      description: 'Awaiting documents',
      icon: FileText,
      color: 'text-yellow-600',
    },
    {
      title: 'In Review',
      value: '0',
      description: 'Currently reviewing',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Approved',
      value: '0',
      description: 'Successfully approved',
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.email} ({user?.role.toLowerCase()})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest client activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">No recent activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">• Add new client</p>
                <p className="text-sm text-gray-500">• View client list</p>
                <p className="text-sm text-gray-500">• Upload documents</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </Layout>
    </ProtectedRoute>
  );
}
