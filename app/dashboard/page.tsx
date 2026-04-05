import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RoleBasedContent } from "@/components/dashboard/role-based-content"
import { RecentVideosTable } from "@/components/dashboard/recent-videos-table"
import { TopAthletes } from "@/components/dashboard/top-athletes"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex flex-col min-h-full pb-4 sm:pb-6">
          <div className="space-y-4 sm:space-y-6 flex-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                Bienvenue sur votre plateforme de détection de jeunes talents en escrime
              </p>
            </div>

            <DashboardStats />
            <RoleBasedContent />
            <RecentVideosTable />
            <TopAthletes />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
