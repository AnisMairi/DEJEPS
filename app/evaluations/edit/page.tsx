"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Loading } from "@/components/common/loading"
import { useToast } from "@/hooks/use-toast"
import { useEvaluationApi, type Evaluation, type EvaluationUpdate } from "@/hooks/use-evaluation-api"
import {
  ArrowLeft,
  Save,
  Trash2,
  Star,
  User,
  Video,
  Calendar,
  Target,
} from "lucide-react"
import Link from "next/link"

function EditEvaluationInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { getEvaluation, updateEvaluation, deleteEvaluation } = useEvaluationApi()

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editedEvaluation, setEditedEvaluation] = useState<EvaluationUpdate>({})

  const rawId = searchParams.get("id")

  useEffect(() => {
    const loadEvaluation = async () => {
      if (!rawId) {
        setError("Paramètre id manquant")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const evaluationData = await getEvaluation(parseInt(rawId, 10))
        setEvaluation(evaluationData)
        setEditedEvaluation({
          technique_score: evaluationData.technique_score || undefined,
          tactics_score: evaluationData.tactics_score || undefined,
          physical_score: evaluationData.physical_score || undefined,
          mental_score: evaluationData.mental_score || undefined,
          strengths: evaluationData.strengths || undefined,
          areas_for_improvement: evaluationData.areas_for_improvement || undefined,
          specific_feedback: evaluationData.specific_feedback || undefined,
          recommendations: evaluationData.recommendations || undefined,
        })
      } catch (err) {
        console.error("Error loading evaluation:", err)
        setError("Impossible de charger l'évaluation")
        toast({
          title: "Erreur",
          description: "Impossible de charger l'évaluation",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadEvaluation()
  }, [rawId, getEvaluation, toast])

  const handleSave = async () => {
    if (!evaluation) return

    try {
      setSaving(true)
      await updateEvaluation(evaluation.id, editedEvaluation)
      toast({
        title: "Évaluation mise à jour",
        description: "L'évaluation a été sauvegardée avec succès",
      })
      router.push("/evaluations")
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'évaluation",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!evaluation || !confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")) {
      return
    }

    try {
      await deleteEvaluation(evaluation.id)
      toast({
        title: "Évaluation supprimée",
        description: "L'évaluation a été supprimée avec succès",
      })
      router.push("/evaluations")
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'évaluation",
        variant: "destructive",
      })
    }
  }

  const updateScore = (field: keyof EvaluationUpdate, value: number[]) => {
    setEditedEvaluation((prev) => ({ ...prev, [field]: value[0] }))
  }

  const updateText = (field: keyof EvaluationUpdate, value: string) => {
    setEditedEvaluation((prev) => ({ ...prev, [field]: value }))
  }

  const calculateOverallScore = () => {
    const scores = [
      editedEvaluation.technique_score,
      editedEvaluation.tactics_score,
      editedEvaluation.physical_score,
      editedEvaluation.mental_score,
    ].filter((score) => score !== undefined && score !== null) as number[]

    if (scores.length === 0) return 0
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Excellent"
    if (score >= 8) return "Très Bien"
    if (score >= 7) return "Bien"
    if (score >= 6) return "Satisfaisant"
    if (score >= 5) return "Moyen"
    return "À Améliorer"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  if (error || !evaluation) {
    return (
      <ProtectedRoute allowedRoles={["coach", "administrator"]}>
        <Layout>
          <div className="text-center py-8">
            <p className="text-red-600">{error || "Évaluation non trouvée"}</p>
            <Button asChild className="mt-4">
              <Link href="/evaluations">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux évaluations
              </Link>
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["coach", "administrator"]}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/evaluations">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Modifier l&apos;Évaluation</h1>
                <p className="text-muted-foreground">
                  Évaluation de {evaluation.athlete_name} sur {evaluation.video_title}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations de l&apos;Évaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{evaluation.athlete_name}</p>
                    <p className="text-sm text-muted-foreground">Athlète</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{evaluation.video_title}</p>
                    <p className="text-sm text-muted-foreground">Vidéo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formatDate(evaluation.created_at)}</p>
                    <p className="text-sm text-muted-foreground">Créée le</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className={`font-medium ${getScoreColor(evaluation.overall_score || 0)}`}>
                      {evaluation.overall_score || "N/A"}/10
                    </p>
                    <p className="text-sm text-muted-foreground">Note globale</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Note Technique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Technique</Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(editedEvaluation.technique_score || 0)}`}>
                        {editedEvaluation.technique_score || 0}
                      </span>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <Slider
                    value={[editedEvaluation.technique_score || 0]}
                    onValueChange={(value) => updateScore("technique_score", value)}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
                <Badge variant={editedEvaluation.technique_score && editedEvaluation.technique_score >= 8 ? "default" : "secondary"}>
                  {editedEvaluation.technique_score ? getScoreLabel(editedEvaluation.technique_score) : "Non évalué"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Note Tactique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Tactique</Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(editedEvaluation.tactics_score || 0)}`}>
                        {editedEvaluation.tactics_score || 0}
                      </span>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <Slider
                    value={[editedEvaluation.tactics_score || 0]}
                    onValueChange={(value) => updateScore("tactics_score", value)}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
                <Badge variant={editedEvaluation.tactics_score && editedEvaluation.tactics_score >= 8 ? "default" : "secondary"}>
                  {editedEvaluation.tactics_score ? getScoreLabel(editedEvaluation.tactics_score) : "Non évalué"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Note Physique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Physique</Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(editedEvaluation.physical_score || 0)}`}>
                        {editedEvaluation.physical_score || 0}
                      </span>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <Slider
                    value={[editedEvaluation.physical_score || 0]}
                    onValueChange={(value) => updateScore("physical_score", value)}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
                <Badge variant={editedEvaluation.physical_score && editedEvaluation.physical_score >= 8 ? "default" : "secondary"}>
                  {editedEvaluation.physical_score ? getScoreLabel(editedEvaluation.physical_score) : "Non évalué"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Note Mentale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Mentale</Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(editedEvaluation.mental_score || 0)}`}>
                        {editedEvaluation.mental_score || 0}
                      </span>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <Slider
                    value={[editedEvaluation.mental_score || 0]}
                    onValueChange={(value) => updateScore("mental_score", value)}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
                <Badge variant={editedEvaluation.mental_score && editedEvaluation.mental_score >= 8 ? "default" : "secondary"}>
                  {editedEvaluation.mental_score ? getScoreLabel(editedEvaluation.mental_score) : "Non évalué"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Note Globale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className={`text-6xl font-bold ${getScoreColor(calculateOverallScore())}`}>{calculateOverallScore()}</div>
                <div className="text-xl font-semibold">{getScoreLabel(calculateOverallScore())}</div>
                <div className="text-muted-foreground">Note Globale Calculée (sur 10)</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Points Forts</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Décrivez les points forts de l'athlète..."
                  value={editedEvaluation.strengths || ""}
                  onChange={(e) => updateText("strengths", e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Axes d&apos;Amélioration</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Identifiez les axes d'amélioration..."
                  value={editedEvaluation.areas_for_improvement || ""}
                  onChange={(e) => updateText("areas_for_improvement", e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Commentaires Spécifiques</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ajoutez vos observations détaillées..."
                value={editedEvaluation.specific_feedback || ""}
                onChange={(e) => updateText("specific_feedback", e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Proposez des recommandations pour l'entraînement..."
                value={editedEvaluation.recommendations || ""}
                onChange={(e) => updateText("recommendations", e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

export default function EditEvaluationPage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute allowedRoles={["coach", "administrator"]}>
          <Layout>
            <div className="flex items-center justify-center min-h-[400px]">
              <Loading />
            </div>
          </Layout>
        </ProtectedRoute>
      }
    >
      <EditEvaluationInner />
    </Suspense>
  )
}
