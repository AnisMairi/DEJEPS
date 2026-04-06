"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loading } from "@/components/common/loading"
import { useToast } from "@/hooks/use-toast"
import {
  getEvaluations,
  deleteEvaluation,
  getPanelStatusForEvaluation,
  type DemoEvaluation,
  type PanelEvaluationStatus,
} from "@/lib/demo-evaluations"
import { DEMO_ATHLETES } from "@/lib/demo-athletes"
import { DEMO_VIDEOS } from "@/lib/demo-videos"
import { Search, Trash2 } from "lucide-react"
import Link from "next/link"

function statusBadge(status: PanelEvaluationStatus) {
  const map: Record<PanelEvaluationStatus, { label: string; className: string }> = {
    EN_ATTENTE_DE_VALIDATION: {
      label: "EN ATTENTE DE VALIDATION",
      className: "bg-amber-400/90 text-amber-950 hover:bg-amber-400",
    },
    VALIDÉE: { label: "VALIDÉE", className: "bg-emerald-600 text-white hover:bg-emerald-600" },
    DISCORDANCE: {
      label: "DISCORDANCE — 3ÈME LECTURE REQUISE",
      className: "bg-red-600 text-white hover:bg-red-600",
    },
    DISCORDANCE_RESOLUE: {
      label: "VALIDÉE (médiane)",
      className: "bg-emerald-700 text-white hover:bg-emerald-700",
    },
  }
  const m = map[status]
  return (
    <Badge className={`${m.className} max-w-[280px] whitespace-normal text-center`}>{m.label}</Badge>
  )
}

export default function EvaluationsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<DemoEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const load = () => {
    const all = getEvaluations()
    setRows(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  useEffect(() => {
    const run = async () => {
      try {
        const { seedDemoEvaluations } = await import("@/lib/demo-evaluations-seed")
        await seedDemoEvaluations()
      } catch (e) {
        console.warn(e)
      }
      load()
      setLoading(false)
    }
    run()
  }, [])

  const filtered = rows.filter((e) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    const athlete = DEMO_ATHLETES.find((a) => a.id === e.athleteId)
    const name = athlete ? `${athlete.first_name} ${athlete.last_name}` : ""
    const vid = DEMO_VIDEOS.find((v) => v.id === e.videoId)
    return (
      name.toLowerCase().includes(q) ||
      (vid?.title ?? "").toLowerCase().includes(q) ||
      e.observations.toLowerCase().includes(q)
    )
  })

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cette évaluation ?")) return
    deleteEvaluation(id)
    load()
    toast({ title: "Évaluation supprimée" })
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["coach", "administrator"]}>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["coach", "administrator"]}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Panel des évaluations</h1>
            <p className="text-muted-foreground">
              Pré-évaluations maîtres d&apos;armes (/28) et grilles fédérales (/60). La discordance compare uniquement
              deux scores fédéraux sur 60 (seuil : écart &gt; 6 points).
            </p>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Rechercher athlète, vidéo…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Aucune évaluation.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Athlète</TableHead>
                      <TableHead>Vidéo</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => {
                      const athlete = DEMO_ATHLETES.find((a) => a.id === e.athleteId)
                      const video = DEMO_VIDEOS.find((v) => v.id === e.videoId)
                      const name = athlete ? `${athlete.first_name} ${athlete.last_name}` : e.athleteId
                      const status = getPanelStatusForEvaluation(e, rows)
                      const scoreLabel =
                        e.kind === "ma_pre" ? `${e.totalScore} / 28` : `${e.totalScore} / 60`
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{video?.title ?? e.videoId}</TableCell>
                          <TableCell>
                            {e.kind === "ma_pre" ? (
                              <Badge variant="outline">Pré-éval. MA</Badge>
                            ) : (
                              <Badge variant="secondary">Fédéral</Badge>
                            )}
                          </TableCell>
                          <TableCell className="tabular-nums font-semibold">{scoreLabel}</TableCell>
                          <TableCell>{statusBadge(status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(e.createdAt).toLocaleString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/videos/${e.videoId}`}>Vidéo</Link>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
