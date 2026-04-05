import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { NotificationSystem } from "@/components/notifications/notification-system"

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <NotificationSystem />
      </Layout>
    </ProtectedRoute>
  )
}
