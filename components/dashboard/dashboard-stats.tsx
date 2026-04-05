"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Users, Upload, TrendingUp } from "lucide-react"

export function DashboardStats() {
  const stats = [
    {
      title: "Connexions Référants",
      value: "142",
      description: "Ce mois en cours",
      icon: LogIn,
    },
    {
      title: "Coachs Actifs",
      value: "89",
      description: "Ce mois en cours",
      icon: Users,
    },
    {
      title: "Uploads de Vidéos",
      value: "1,234",
      description: "+18.5% vs mois dernier",
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
