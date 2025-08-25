"use client";

import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { ClientForm } from "@/components/clients/ClientForm";
import { PhoneCallClientWizard } from "@/components/clients/PhoneCallClientWizard";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function NewClientPage() {
  const searchParams = useSearchParams();
  const clientType = searchParams.get("type");
  const { user } = useAuth();

  if (user?.role !== "ADMIN") {
    return (
      <ProtectedRoute>
        <Layout>
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to create new clients.
              </CardDescription>
            </CardHeader>
          </Card>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!clientType) {
    return (
      <ProtectedRoute>
        <Layout>
          <Card>
            <CardHeader>
              <CardTitle>Invalid Request</CardTitle>
              <CardDescription>
                Please select a client type first.
              </CardDescription>
            </CardHeader>
          </Card>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Use special wizard for Phone Call clients
  if (clientType === "PHONE_CALL") {
    return (
      <ProtectedRoute>
        <Layout>
          <PhoneCallClientWizard />
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Client</h1>
            <p className="text-gray-600">
              Create a new {clientType.replace("_", " ").toLowerCase()} client
            </p>
          </div>

          <ClientForm clientType={clientType as any} />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
