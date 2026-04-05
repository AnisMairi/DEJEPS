"use client";
import { useParams } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ComprehensiveAthleteProfile } from "@/components/athlete/comprehensive-athlete-profile";

export default function AthleteProfilePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedRoute>
      <Layout>
        <ComprehensiveAthleteProfile athleteId={id} />
      </Layout>
    </ProtectedRoute>
  );
}
