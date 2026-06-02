"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { assertCompleteTc, saveEvaluation } from "@/lib/demo-evaluations"
import { useAuth } from "@/lib/auth-context"
import {
  emptyTc,
  LIKERT_4_LABELS,
  sumTc,
  TRONC_COMMUN_ITEMS,
  type TCKey,
} from "@/lib/sabre-evaluation-constants"
import { getDemoAthleteById, getDemoVideos } from "@/lib/demo-local-store"

const POTENTIAL_OPTIONS = [
  "Potentiel encore à déterminer",
  "Potentiel intéressant",
  "Fort potentiel",
] as const

export function AthleteEvaluationForm({ athleteId }: { athleteId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [athlete, setAthlete] = useState<{ id: string; first_name: string; last_name: string } | null>(null)
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([])
  const [videoId, setVideoId] = useState<string>("")
  const [tc, setTc] = useState(emptyTc())
  const [generalSummary, setGeneralSummary] = useState("")
  const [potential, setPotential] = useState<(typeof POTENTIAL_OPTIONS)[number]>("Potentiel encore à déterminer")

  useEffect(() => {
    const demoAthlete = getDemoAthleteById(athleteId)
    if (!demoAthlete) return

    setAthlete({
      id: demoAthlete.id,
      first_name: demoAthlete.first_name,
      last_name: demoAthlete.last_name,
    })
    const fullName = `${demoAthlete.first_name} ${demoAthlete.last_name}`
    const vids = getDemoVideos()
      .filter((video) => video.athlete === fullName || video.athlete.startsWith(demoAthlete.first_name))
      .map((video) => ({ id: video.id, title: video.title }))
    setVideos(vids)
    if (vids.length === 1) setVideoId(vids[0].id)
  }, [athleteId])

  const score28 = sumTc(tc)

  const setTcVal = (key: TCKey, val: number) => {
    setTc((prev) => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async () => {
    if (!athlete) return
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
        observations: generalSummary,
        generalSummary,
        potential,
      })
      toast({
        title: "Pré-évaluation enregistrée",
        description: `Score ${score28} / 28`,
      })
      router.push(
        athlete.id.startsWith("local_")
          ? `/athletes/profile?id=${encodeURIComponent(athlete.id)}`
          : `/athletes/${athlete.id}`,
      )
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
              Maître d&apos;armes : grille sur 7 compétences communes (échelle 1–4).
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
                  <Label>Vidéo évaluée</Label>
                  <Select value={videoId} onValueChange={setVideoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une vidéo de l'athlète (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {videos.map((video) => (
                        <SelectItem key={video.id} value={video.id}>
                          {video.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {videos.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucune vidéo pour cet athlète. Vous pouvez tout de même valider la pré-évaluation.
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
                <span className="text-2xl font-bold tabular-nums">{score28} / 28</span>
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
              <CardTitle>Bilan individuel général</CardTitle>
              <CardDescription>Remarques qualitatives libres pour la commission.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Textarea
                value={generalSummary}
                onChange={(event) => setGeneralSummary(event.target.value)}
                rows={5}
                placeholder="Points forts, axes de progrès, contexte de la vidéo..."
              />
              <div className="space-y-3">
                <Label>Évaluation globale du potentiel</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {POTENTIAL_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer">
                      <input
                        type="radio"
                        name="potential"
                        checked={potential === option}
                        onChange={() => setPotential(option)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
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
