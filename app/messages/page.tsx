"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Fonctionnalité non disponible dans cette démo.</p>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
