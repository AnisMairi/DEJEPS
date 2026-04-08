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
import {
  saveEvaluation,
  assertCompleteFederal,
  getFederalAggregateStatus,
  getFederalFinalScore,
} from "@/lib/demo-evaluations"
import { sabreTalentFederalBlindCategory } from "@/lib/fencing-age-category"
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

function anonVideoCode(videoId: string) {
  const n = Number(videoId)
  if (!Number.isFinite(n)) return `VID-${videoId}`
  return `VID-${String(n).padStart(4, "0")}`
}

export function FederalBlindForm({
  videoId,
  blindMode = false,
  athleteIdHint,
}: {
  videoId: string
  /** Évaluateur fédéral : masquage strict (copies anonymes) — uniquement vidéo + M13/M15 + grille */
  blindMode?: boolean
  athleteIdHint?: string
}) {
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
    const hint = athleteIdHint?.trim()
    const byHint = hint ? DEMO_ATHLETES.find((x) => x.id === hint) : undefined
    if (byHint) {
      setAthleteId(byHint.id)
      setAgeLabel(sabreTalentFederalBlindCategory(byHint.date_of_birth))
      return
    }

    const name = v.athlete.split(/\s+vs\s+/i)[0].trim()
    const a = DEMO_ATHLETES.find((x) => `${x.first_name} ${x.last_name}` === name || name.includes(x.first_name))
    if (!a) return
    setAthleteId(a.id)
    setAgeLabel(sabreTalentFederalBlindCategory(a.date_of_birth))
  }, [videoId, athleteIdHint])

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
      const agg = getFederalAggregateStatus(athleteId, videoId)
      const finalNote = getFederalFinalScore(athleteId, videoId)
      const statusLine =
        agg === "DISCORDANCE"
          ? "Discordance entre les 2 premières lectures — 3e lecture requise."
          : agg === "EN_ATTENTE_2E_LECTURE_FÉDÉRALE"
            ? "En attente de la 2e lecture fédérale indépendante."
            : agg === "DISCORDANCE_RESOLUE"
              ? `Discordance résolue — note finale (médiane) : ${finalNote != null ? `${Math.round(finalNote * 10) / 10} / 60` : "—"}`
              : finalNote != null
                ? `Note finale (moyenne des 2 lectures) : ${Math.round(finalNote * 10) / 10} / 60`
                : "Lectures fédérales en cours."
      toast({
        title: "Évaluation enregistrée",
        description: `Cette lecture : ${total} / 60 — ${statusLine}`,
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

  const hideIdentifiers = blindMode || user?.role === "federal_evaluator"

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold">Évaluation fédérale (aveugle)</h2>
        <Badge variant="secondary">Catégorie : {ageLabel}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {hideIdentifiers
          ? "Affichage réservé : vidéo, catégorie Sabre Talent (M13 ou M15) et grille /60 — sans nom, club, région, ni pré-évaluation MA."
          : "Mode administrateur / démo : titre de vidéo visible. L’évaluateur fédéral ne voit pas ces éléments identifiants."}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Vidéo</CardTitle>
          <CardDescription>Lecture seule — contexte minimal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{hideIdentifiers ? `Vidéo ${anonVideoCode(video.id)}` : video.title}</p>
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
