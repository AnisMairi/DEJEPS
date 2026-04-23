"use client"

import React, { use, useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { saveEvaluation, assertCompleteTc } from "@/lib/demo-evaluations"
import { useAuth } from "@/lib/auth-context"
import {
  LIKERT_4_LABELS,
  TRONC_COMMUN_ITEMS,
  sumTc,
  emptyTc,
  type TCKey,
} from "@/lib/sabre-evaluation-constants"

export default function AthleteEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [athlete, setAthlete] = useState<{ id: string; first_name: string; last_name: string } | null>(null)
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([])
  const [videoId, setVideoId] = useState<string>("")
  const [tc, setTc] = useState(emptyTc())
  const [observations, setObservations] = useState("")

  useEffect(() => {
    const load = async () => {
      const { DEMO_ATHLETES } = await import("@/lib/demo-athletes")
      const { DEMO_VIDEOS } = await import("@/lib/demo-videos")
      const demoAthlete = DEMO_ATHLETES.find((a) => a.id === resolvedParams.id)
      if (demoAthlete) {
        setAthlete({
          id: demoAthlete.id,
          first_name: demoAthlete.first_name,
          last_name: demoAthlete.last_name,
        })
        const fullName = `${demoAthlete.first_name} ${demoAthlete.last_name}`
        const vids = DEMO_VIDEOS.filter(
          (v) => v.athlete === fullName || v.athlete.startsWith(demoAthlete.first_name)
        ).map((v) => ({ id: v.id, title: v.title }))
        setVideos(vids)
        if (vids.length === 1) setVideoId(vids[0].id)
      }
    }
    load()
  }, [resolvedParams.id])

  const score28 = sumTc(tc)

  const setTcVal = (key: TCKey, val: number) => {
    setTc((prev) => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async () => {
    if (!athlete) return
    if (!videoId) {
      toast({
        title: "Vidéo requise",
        description: "Sélectionnez la vidéo associée à cette pré-évaluation.",
        variant: "destructive",
      })
      return
    }
    if (!assertCompleteTc(tc)) {
      toast({
        title: "Grille incomplète",
        description: "Attribuez une note de 1 à 4 pour chaque item du tronc commun.",
        variant: "destructive",
      })
      return
    }
    try {
      setLoading(true)
      saveEvaluation({
        kind: "ma_pre",
        athleteId: athlete.id,
        videoId,
        evaluatorName: user?.name || "Maître d'armes",
        evaluatorRole: user?.role || "local_contact",
        evaluatorUserId: user?.id,
        tc,
        observations,
      })
      toast({
        title: "Pré-évaluation enregistrée",
        description: `Statut : EN ATTENTE DE VALIDATION — Score ${score28} / 28`,
      })
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["coach", "local_contact", "administrator"]}>
      <Layout>
        <div className="space-y-6 max-w-4xl">
          <div>
            <h1 className="text-3xl font-bold">Fiche évaluation — Pré-évaluation (tronc commun)</h1>
            <p className="text-muted-foreground">
              Maître d&apos;armes : grille sur 7 compétences communes (échelle 1–4). La note définitive sera
              donnée par un évaluateur fédéral.
            </p>
          </div>

          {athlete && (
            <Card>
              <CardHeader>
                <CardTitle>Athlète</CardTitle>
                <CardDescription>
                  {athlete.first_name} {athlete.last_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Vidéo évaluée *</Label>
                  <Select value={videoId} onValueChange={setVideoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une vidéo de l'athlète" />
                    </SelectTrigger>
                    <SelectContent>
                      {videos.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {videos.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucune vidéo de démo pour cet athlète — ajoutez une vidéo depuis l&apos;upload ou utilisez un
                      autre profil.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Échelle (1 à 4)</CardTitle>
              <CardDescription>Chaque item est noté indépendamment.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
              {([1, 2, 3, 4] as const).map((n) => (
                <div key={n}>
                  <span className="font-semibold text-primary">{n}</span> — {LIKERT_4_LABELS[n]}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                <span>Tronc commun</span>
                <span className="text-2xl font-bold tabular-nums">
                  {score28} / 28
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {TRONC_COMMUN_ITEMS.map(({ key, code, label }) => (
                <div key={key} className="border rounded-lg p-4 space-y-3">
                  <Label className="text-base font-medium">
                    {code} — {label}
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    {([1, 2, 3, 4] as const).map((n) => (
                      <label key={n} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={key}
                          checked={tc[key] === n}
                          onChange={() => setTcVal(key, n)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{n}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observations</CardTitle>
              <CardDescription>Remarques qualitatives libres pour la commission.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={5}
                placeholder="Points forts, axes de progrès, contexte de la vidéo…"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading || !athlete}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Enregistrement…" : "Soumettre la pré-évaluation"}
            </Button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
