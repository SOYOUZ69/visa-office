import { CaisseManagement } from "@/components/financial/CaisseManagement";
import { TransactionHistory } from "@/components/financial/TransactionHistory";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { TransactionApproval } from "@/components/financial/TransactionApproval";
import { EmployeeManagement } from "@/components/financial/EmployeeManagement";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FinancialPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Système Financier</h1>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard">Tableau Financier</TabsTrigger>
              <TabsTrigger value="caisses">Gestion des Caisses</TabsTrigger>
              <TabsTrigger value="transactions">
                Historique des Transactions
              </TabsTrigger>
              <TabsTrigger value="approvals">Approbations</TabsTrigger>
              <TabsTrigger value="employees">Employés</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <FinancialDashboard />
            </TabsContent>

            <TabsContent value="caisses">
              <CaisseManagement />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="approvals">
              <TransactionApproval />
            </TabsContent>

            <TabsContent value="employees">
              <EmployeeManagement />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
