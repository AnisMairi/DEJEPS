"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Users, Upload, TrendingUp } from "lucide-react"
import { getDemoAthletes, getDemoVideos } from "@/lib/demo-local-store"
import { getEvaluations, initializeDemoFederalEvaluations } from "@/lib/demo-evaluations"

export function DashboardStats() {
  const [counts, setCounts] = useState({ athletes: 0, videos: 0, evaluations: 0 })

  useEffect(() => {
    initializeDemoFederalEvaluations()
    setCounts({
      athletes: getDemoAthletes().length,
      videos: getDemoVideos().length,
      evaluations: getEvaluations().length,
    })
  }, [])

  const stats = [
    {
      title: "Athlètes suivis",
      value: counts.athletes.toString(),
      description: "Mock data + ajouts locaux",
      icon: LogIn,
    },
    {
      title: "Évaluations",
      value: counts.evaluations.toString(),
      description: "Pré-évaluations et lectures fédérales",
      icon: Users,
    },
    {
      title: "Uploads de Vidéos",
      value: counts.videos.toString(),
      description: "Mock data + vidéos locales",
      icon: Upload,
      trend: "+18.5%",
    },
    {
      title: "Taux de Progression",
      value: "87%",
      description: "+5.2% par rapport au trimestre dernier",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
