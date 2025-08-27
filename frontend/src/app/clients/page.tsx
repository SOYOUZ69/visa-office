"use client";

import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewClientTab } from "@/components/clients/NewClientTab";
import { ExistingClientsTab } from "@/components/clients/ExistingClientsTab";
import { DossiersManagementTab } from "@/components/clients/DossiersManagementTab";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
            <p className="text-gray-600">Manage your visa office clients</p>
          </div>

          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new">New Client</TabsTrigger>
              <TabsTrigger value="existing">Existing Clients</TabsTrigger>
              <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-6">
              <NewClientTab />
            </TabsContent>

            <TabsContent value="existing" className="mt-6">
              <ExistingClientsTab />
            </TabsContent>

            <TabsContent value="dossiers" className="mt-6">
              <DossiersManagementTab />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
