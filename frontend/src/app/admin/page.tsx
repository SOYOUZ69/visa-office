'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, Activity } from 'lucide-react';
import RoleManagement from '@/components/admin/RoleManagement';
import UserManagement from '@/components/admin/UserManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import AuditLogs from '@/components/admin/AuditLogs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('roles');

  return (
    <AdminProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
            </div>
            <p className="text-gray-600">
              Gérez les utilisateurs, rôles, permissions et paramètres système
            </p>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Shield size={16} />
                Rôles & Permissions
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users size={16} />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings size={16} />
                Paramètres
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <Activity size={16} />
                Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roles">
              <RoleManagement />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="settings">
              <SystemSettings />
            </TabsContent>

            <TabsContent value="audit">
              <AuditLogs />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </AdminProtectedRoute>
  );
}