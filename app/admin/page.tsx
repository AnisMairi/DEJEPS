import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { AdminManagementInterface } from "@/components/admin/admin-management-interface"

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["administrator"]}>
      <Layout>
        <AdminManagementInterface />
      </Layout>
    </ProtectedRoute>
  )
}
