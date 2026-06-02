"use client"

import { use } from "react"
import { AthleteEvaluationForm } from "@/components/athlete/athlete-evaluation-form"

export default function AthleteEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <AthleteEvaluationForm athleteId={id} />
}
