"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Users,
  Video,
  Star,
  Target,
  Award,
  Activity,
  MapPin,
  Calendar,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useEffect, useState } from "react"
import type { DemoEvaluation } from "@/lib/demo-evaluations"
import type { DemoAthlete } from "@/lib/demo-athletes"

/** Score 0–100 pour comparer pré-éval MA (/28) et fédéral (/60) */
function evaluationScorePercent(e: DemoEvaluation): number {
  if (e.kind === "ma_pre") return (e.totalScore / 28) * 100
  return (e.totalScore / 60) * 100
}

function scoreCategory(percent: number): "À suivre" | "Prometteur" | "Talent détecté" {
  if (percent < 50) return "À suivre"
  if (percent < 75) return "Prometteur"
  return "Talent détecté"
}

export default function AnalyticsPage() {
  const [athletesData, setAthletesData] = useState<DemoAthlete[]>([])
  const [evaluationsData, setEvaluationsData] = useState<DemoEvaluation[]>([])
  const [videosData, setVideosData] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const { DEMO_ATHLETES: athletes } = await import("@/lib/demo-athletes")
        setAthletesData(athletes)

        const { getEvaluations } = await import("@/lib/demo-evaluations")
        const { seedDemoEvaluations } = await import("@/lib/demo-evaluations-seed")
        await seedDemoEvaluations()
        setEvaluationsData(getEvaluations())

        const { DEMO_VIDEOS } = await import("@/lib/demo-videos")
        setVideosData(DEMO_VIDEOS)
      } catch (err) {
        console.error("Error loading analytics data:", err)
      }
    }
    loadData()
  }, [])

  // Statistiques par arme
  const weaponStats = athletesData.reduce((acc, athlete) => {
    const w = athlete.weapon
    const weapon =
      w === "epee" || w === "épée" ? "Épée" : w === "foil" ? "Fleuret" : "Sabre"
    acc[weapon] = (acc[weapon] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const weaponChartData = Object.entries(weaponStats).map(([name, value]) => ({
    name,
    value,
  }))

  // Statistiques par région
  const regionStats = athletesData.reduce((acc, athlete) => {
    acc[athlete.region] = (acc[athlete.region] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const regionChartData = Object.entries(regionStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  // Distribution des scores d'évaluation (normalisés 0–100)
  const scoreDistribution = evaluationsData.reduce((acc, evaluation) => {
    const p = evaluationScorePercent(evaluation)
    const range = scoreCategory(p)
    acc[range] = (acc[range] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const scoreChartData = Object.entries(scoreDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  // Évolution des évaluations par mois
  const monthlyEvaluations = evaluationsData.reduce((acc, evaluation) => {
    const date = new Date(evaluation.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    acc[monthKey] = (acc[monthKey] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const monthlyChartData = Object.entries(monthlyEvaluations)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(-6) // 6 derniers mois

  // Top clubs
  const clubStats = athletesData.reduce((acc, athlete) => {
    acc[athlete.club] = (acc[athlete.club] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topClubs = Object.entries(clubStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // Distribution par niveau de compétence
  const skillLevelStats = athletesData.reduce((acc, athlete) => {
    const level = athlete.skill_level === "beginner" ? "Débutant" :
                 athlete.skill_level === "intermediate" ? "Intermédiaire" :
                 athlete.skill_level === "advanced" ? "Avancé" : "Élite"
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const skillChartData = Object.entries(skillLevelStats).map(([name, value]) => ({
    name,
    value,
  }))

  // Couleurs pour les graphiques
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe", "#00c49f", "#ffbb28", "#ff8042"]

  const totalAthletes = athletesData.length
  const totalEvaluations = evaluationsData.length
  const totalVideos = videosData.length
  const averageScore = evaluationsData.length > 0
    ? (
        evaluationsData.reduce((sum, e) => sum + evaluationScorePercent(e), 0) / evaluationsData.length
      ).toFixed(1)
    : "0.0"

  return (
    <ProtectedRoute allowedRoles={["coach", "administrator"]}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analyses de la Plateforme</h1>
            <p className="text-muted-foreground">
              Statistiques détaillées sur la détection de jeunes talents en escrime
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Athlètes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAthletes}</div>
                <p className="text-xs text-muted-foreground">Athlètes enregistrés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Évaluations</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEvaluations}</div>
                <p className="text-xs text-muted-foreground">Évaluations réalisées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vidéos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVideos}</div>
                <p className="text-xs text-muted-foreground">Vidéos uploadées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageScore}%</div>
                <p className="text-xs text-muted-foreground">Score moyen global</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="athletes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="athletes">Athlètes</TabsTrigger>
              <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
              <TabsTrigger value="geography">Géographie</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {/* Tab: Athlètes */}
            <TabsContent value="athletes" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par Arme</CardTitle>
                    <CardDescription>Distribution des athlètes selon leur arme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={weaponChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(((percent ?? 0) as number) * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {weaponChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Niveaux de Compétence</CardTitle>
                    <CardDescription>Distribution des athlètes par niveau</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={skillChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Clubs</CardTitle>
                  <CardDescription>Clubs avec le plus d'athlètes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topClubs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune donnée club.</p>
                    ) : (
                      topClubs.map((club, index) => {
                        const maxVal = topClubs[0]?.value || 1
                        return (
                          <div key={club.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">#{index + 1}</Badge>
                              <span className="font-medium">{club.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${(club.value / maxVal) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold">{club.value}</span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Évaluations */}
            <TabsContent value="evaluations" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution des Scores</CardTitle>
                    <CardDescription>Répartition des évaluations par catégorie</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={scoreChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {scoreChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Évolution des Évaluations</CardTitle>
                    <CardDescription>Nombre d'évaluations par mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" name="Évaluations" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Géographie */}
            <TabsContent value="geography" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition Régionale</CardTitle>
                  <CardDescription>Distribution des athlètes par région</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={regionChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Performance */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performances</CardTitle>
                    <CardDescription>Meilleures évaluations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...evaluationsData]
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .slice(0, 5)
                        .map((evaluation, index) => {
                          const athlete = athletesData.find((x) => x.id === evaluation.athleteId)
                          const name = athlete
                            ? `${athlete.first_name} ${athlete.last_name}`
                            : `Athlète ${evaluation.athleteId}`
                          const club = athlete?.club ?? "—"
                          const pct = evaluationScorePercent(evaluation)
                          const label =
                            evaluation.kind === "ma_pre"
                              ? `MA ${evaluation.totalScore}/28`
                              : `Fédéral ${evaluation.totalScore}/60`
                          return (
                            <div key={evaluation.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">#{index + 1}</Badge>
                                <div>
                                  <p className="font-medium">{name}</p>
                                  <p className="text-xs text-muted-foreground">{club}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">{pct.toFixed(0)}%</p>
                                <Badge variant="secondary" className="text-xs">
                                  {label}
                                </Badge>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Potentiel Détecté</CardTitle>
                    <CardDescription>Répartition par potentiel</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(["ma_pre", "federal"] as const).map((kind) => {
                        const label = kind === "ma_pre" ? "Pré-évaluations MA" : "Évaluations fédérales"
                        const count = evaluationsData.filter((e) => e.kind === kind).length
                        const pctNum =
                          evaluationsData.length > 0 ? (count / evaluationsData.length) * 100 : 0
                        const pctStr = pctNum.toFixed(1)
                        return (
                          <div key={kind} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{label}</span>
                              <span className="text-muted-foreground">
                                {count} ({pctStr}%)
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${pctNum}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

