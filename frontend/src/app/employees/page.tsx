import EmployeeManagement from "@/components/employees/EmployeeManagement";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function EmployeesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <EmployeeManagement />
      </Layout>
    </ProtectedRoute>
  );
}
