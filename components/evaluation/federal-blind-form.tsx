"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { saveEvaluation, assertCompleteFederal } from "@/lib/demo-evaluations"
import {
  LIKERT_4_LABELS,
  TRONC_COMMUN_ITEMS,
  SABRE_SPECIFIC_ITEMS,
  sumFederal,
  emptyTc,
  emptyS,
  type TCKey,
  type SKey,
} from "@/lib/sabre-evaluation-constants"
import { DEMO_VIDEOS } from "@/lib/demo-videos"
import { DEMO_ATHLETES } from "@/lib/demo-athletes"

export function FederalBlindForm({ videoId }: { videoId: string }) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [ageLabel, setAgeLabel] = useState<"M13" | "M15">("M13")
  const [athleteId, setAthleteId] = useState<string>("")
  const [tc, setTc] = useState(emptyTc())
  const [s, setS] = useState(emptyS())
  const [observations, setObservations] = useState("")

  useEffect(() => {
    const v = DEMO_VIDEOS.find((x) => x.id === videoId)
    if (!v) return
    setAgeLabel(v.ageCategory === "M15" ? "M15" : "M13")
    const name = v.athlete.split(/\s+vs\s+/i)[0].trim()
    const a = DEMO_ATHLETES.find(
      (x) => `${x.first_name} ${x.last_name}` === name || name.includes(x.first_name)
    )
    if (a) setAthleteId(a.id)
  }, [videoId])

  const total = sumFederal(tc, s)

  const setTcVal = (key: TCKey, val: number) => setTc((prev) => ({ ...prev, [key]: val }))
  const setSVal = (key: SKey, val: number) => setS((prev) => ({ ...prev, [key]: val }))

  const submit = async () => {
    if (!athleteId) {
      toast({
        title: "Athlète introuvable",
        description: "Impossible d'associer la vidéo à un athlète de démo.",
        variant: "destructive",
      })
      return
    }
    if (!assertCompleteFederal(tc, s)) {
      toast({ title: "Grille incomplète", description: "Notez chaque item de 1 à 4.", variant: "destructive" })
      return
    }
    try {
      setLoading(true)
      saveEvaluation({
        kind: "federal",
        athleteId,
        videoId,
        evaluatorName: user?.name || "Évaluateur fédéral",
        evaluatorRole: "federal_evaluator",
        evaluatorUserId: user?.id,
        tc,
        s,
        observations,
      })
      toast({
        title: "Évaluation enregistrée",
        description: `Statut : VALIDÉE — Score ${total} / 60`,
      })
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const video = DEMO_VIDEOS.find((x) => x.id === videoId)

  if (!video) {
    return <p className="text-muted-foreground">Vidéo inconnue.</p>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold">Évaluation fédérale (aveugle)</h2>
        <Badge variant="secondary">Âge : {ageLabel}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Aucune information sur le club, la région ou la pré-évaluation du MA n&apos;est affichée.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Vidéo</CardTitle>
          <CardDescription>Lecture seule — contexte minimal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{video.title}</p>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
            Lecteur vidéo (démo) — fichier joint sur la plateforme
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Échelle 1 à 4</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2 text-sm">
          {([1, 2, 3, 4] as const).map((n) => (
            <div key={n}>
              <span className="font-semibold">{n}</span> — {LIKERT_4_LABELS[n]}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tronc commun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {TRONC_COMMUN_ITEMS.map(({ key, code, label }) => (
            <div key={key} className="border rounded-lg p-4 space-y-2">
              <Label className="text-base">
                {code} — {label}
              </Label>
              <div className="flex flex-wrap gap-4">
                {([1, 2, 3, 4] as const).map((n) => (
                  <label key={n} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`fed-${key}`}
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
          <CardTitle>Spécifiques sabre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {SABRE_SPECIFIC_ITEMS.map(({ key, code, label }) => (
            <div key={key} className="border rounded-lg p-4 space-y-2">
              <Label className="text-base">
                {code} — {label}
              </Label>
              <div className="flex flex-wrap gap-4">
                {([1, 2, 3, 4] as const).map((n) => (
                  <label key={n} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`fed-${key}`}
                      checked={s[key] === n}
                      onChange={() => setSVal(key, n)}
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
          <CardTitle className="flex flex-wrap justify-between gap-2">
            <span>Observations</span>
            <span className="text-2xl font-bold tabular-nums">{total} / 60</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={5}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Commentaires libres…"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Envoi…" : "Soumettre l'évaluation fédérale"}
        </Button>
      </div>
    </div>
  )
}
