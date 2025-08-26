"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { financialAPI } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [pendingTransactions, setPendingTransactions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await financialAPI.getPendingTransactions();
      setPendingTransactions(data.length);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Clients",
      value: "0",
      description: "All time clients",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Pending Documents",
      value: "0",
      description: "Awaiting documents",
      icon: FileText,
      color: "text-yellow-600",
    },
    {
      title: "In Review",
      value: "0",
      description: "Currently reviewing",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Approved",
      value: "0",
      description: "Successfully approved",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Pending Transactions",
      value: pendingTransactions.toString(),
      description: "Awaiting approval",
      icon: AlertTriangle,
      color: "text-red-600",
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                <CardDescription>Latest client activities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">No recent activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/clients/new">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Add new client
                    </Button>
                  </Link>
                  <Link href="/clients">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View client list
                    </Button>
                  </Link>
                  {pendingTransactions > 0 && (
                    <Link href="/financial?tab=approvals">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Review pending transactions ({pendingTransactions})
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
