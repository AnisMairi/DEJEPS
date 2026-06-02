"use client"

import { useSearchParams } from "next/navigation"
import { AthleteEvaluationForm } from "@/components/athlete/athlete-evaluation-form"

export function AthleteEvaluateContent() {
  const id = useSearchParams().get("id") || ""
  return <AthleteEvaluationForm athleteId={id} />
}
