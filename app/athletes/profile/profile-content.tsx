"use client"

import { useSearchParams } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ComprehensiveAthleteProfile } from "@/components/athlete/comprehensive-athlete-profile"

export function AthleteProfileContent() {
  const id = useSearchParams().get("id") || ""

  return (
    <ProtectedRoute>
      <Layout>
        <ComprehensiveAthleteProfile athleteId={id} />
      </Layout>
    </ProtectedRoute>
  )
}
