"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getEvaluations } from "@/lib/demo-evaluations"
import { DEMO_VIDEOS } from "@/lib/demo-videos"
import { DEMO_ATHLETES } from "@/lib/demo-athletes"
import { FederalBlindForm } from "@/components/evaluation/federal-blind-form"
import { ArrowLeft } from "lucide-react"

function FederalQueueInner() {
  const searchParams = useSearchParams()
  const videoIdParam = searchParams.get("videoId")
  const [rows, setRows] = useState<{ videoId: string; title: string; ageLabel: string; athleteId: string }[]>([])

  useEffect(() => {
    const ma = getEvaluations().filter((e) => e.kind === "ma_pre")
    const federal = getEvaluations().filter((e) => e.kind === "federal")
    const pending = ma.filter((m) => {
      const done = federal.some((f) => f.videoId === m.videoId && f.athleteId === m.athleteId)
      return !done
    })
    const uniq = new Map<string, (typeof rows)[0]>()
    for (const m of pending) {
      const v = DEMO_VIDEOS.find((x) => x.id === m.videoId)
      const a = DEMO_ATHLETES.find((x) => x.id === m.athleteId)
      const ageLabel = v?.ageCategory ?? (a ? a.age_category : "M13")
      uniq.set(m.videoId, {
        videoId: m.videoId,
        title: v?.title ?? `Vidéo ${m.videoId}`,
        ageLabel: typeof ageLabel === "string" ? ageLabel : "M13",
        athleteId: m.athleteId,
      })
    }
    setRows([...uniq.values()])
  }, [])

  if (videoIdParam) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/evaluations/federal">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la file
          </Link>
        </Button>
        <FederalBlindForm videoId={videoIdParam} />
      </div>
    )
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">Évaluations fédérales (aveugle)</h1>
        <p className="text-muted-foreground max-w-2xl">
          Sélectionnez une vidéo : vous verrez uniquement la vidéo, la catégorie d&apos;âge (M13 / M15) et la grille 15
          items — sans club, région ni note du maître d&apos;armes.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucune vidéo en attente d&apos;évaluation fédérale. Les pré-évaluations MA apparaissent ici après soumission.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => (
            <Card key={r.videoId}>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{r.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  Catégorie d&apos;âge
                  <Badge variant="secondary">{r.ageLabel}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={`/evaluations/federal?videoId=${encodeURIComponent(r.videoId)}`}>Évaluer en aveugle</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Accès direct (démo)</CardTitle>
          <CardDescription>Toutes les vidéos de démo — pour test sans file d&apos;attente.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {DEMO_VIDEOS.map((v) => (
            <Button key={v.id} variant="outline" size="sm" asChild>
              <Link href={`/evaluations/federal?videoId=${encodeURIComponent(v.id)}`}>Vidéo {v.id}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </>
  )
}

export default function FederalQueuePage() {
  return (
    <ProtectedRoute allowedRoles={["federal_evaluator", "administrator"]}>
      <Layout>
        <Suspense fallback={<div className="p-8 text-muted-foreground">Chargement…</div>}>
          <div className="space-y-6">
            <FederalQueueInner />
          </div>
        </Suspense>
      </Layout>
    </ProtectedRoute>
  )
}
