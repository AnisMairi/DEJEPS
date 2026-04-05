"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Save, Send, Eye, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface EvaluationCriteria {
  posture: number
  speed: number
  positioning: number
  technique: number
  tactics: number
  mentalStrength: number
  adaptability: number
  consistency: number
}

interface TechnicalEvaluationInterfaceProps {
  athleteId: string
  videoId?: string
  onSave: (evaluation: any) => void
}

export function TechnicalEvaluationInterface({ athleteId, videoId, onSave }: TechnicalEvaluationInterfaceProps) {
  const { user } = useAuth()
  const [evaluation, setEvaluation] = useState<EvaluationCriteria>({
    posture: 5,
    speed: 5,
    positioning: 5,
    technique: 5,
    tactics: 5,
    mentalStrength: 5,
    adaptability: 5,
    consistency: 5,
  })

  const [comments, setComments] = useState("")
  const [evaluationType, setEvaluationType] = useState<"video" | "general">(videoId ? "video" : "general")
  const [visibility, setVisibility] = useState<"private" | "coach" | "public">("private")

  const criteriaLabels = {
    posture: "Posture et Garde",
    speed: "Vitesse d'Exécution",
    positioning: "Positionnement",
    technique: "Technique",
    tactics: "Tactique",
    mentalStrength: "Force Mentale",
    adaptability: "Adaptabilité",
    consistency: "Régularité",
  }

  const criteriaDescriptions = {
    posture: "Position du corps, équilibre, garde défensive et offensive",
    speed: "Rapidité des mouvements, temps de réaction, vitesse d'attaque",
    positioning: "Placement sur la piste, gestion de la distance",
    technique: "Exécution des mouvements techniques, précision des gestes",
    tactics: "Stratégie de combat, lecture de l'adversaire, adaptation tactique",
    mentalStrength: "Gestion du stress, concentration, détermination",
    adaptability: "Capacité à s'adapter aux différents styles d'adversaires",
    consistency: "Régularité dans les performances, fiabilité",
  }

  const updateCriteria = (key: keyof EvaluationCriteria, value: number[]) => {
    setEvaluation((prev) => ({ ...prev, [key]: value[0] }))
  }

  const calculateOverallScore = () => {
    const values = Object.values(evaluation)
    return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)
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

  const handleSave = () => {
    const evaluationData = {
      athleteId,
      videoId,
      evaluator: user?.name,
      evaluatorRole: user?.role,
      date: new Date().toISOString(),
      type: evaluationType,
      visibility,
      criteria: evaluation,
      overallScore: calculateOverallScore(),
      comments,
    }
    onSave(evaluationData)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Évaluation Technique</h1>
        </div>
      </div>

      {/* Overall Score Display */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className={`text-6xl font-bold ${getScoreColor(Number(calculateOverallScore()))}`}>
              {calculateOverallScore()}
            </div>
            <div className="text-xl font-semibold">{getScoreLabel(Number(calculateOverallScore()))}</div>
            <div className="text-muted-foreground">Note Globale</div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Criteria */}
      <div className="grid gap-8 md:grid-cols-2">
        {Object.entries(evaluation).map(([key, value]) => (
          <Card key={key} className="shadow-sm border border-gray-200 rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle>
                <div className="flex items-center justify-between gap-4">
                  <span className="truncate max-w-[60%] text-base font-semibold tracking-tight">{criteriaLabels[key as keyof EvaluationCriteria]}</span>
                  <div className="flex items-center gap-3 min-w-[70px] justify-end">
                    <span className={`text-2xl font-bold ${getScoreColor(value)}`}>{value}</span>
                    <Star className={`h-5 w-5 ${value >= 8 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-0 pb-6">
              <p className="text-sm text-muted-foreground min-h-[36px] mb-2">{criteriaDescriptions[key as keyof EvaluationCriteria]}</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 w-full">
                  <span className="text-xs text-muted-foreground w-24 text-left">0 - À améliorer</span>
                  <Slider
                    value={[value]}
                    onValueChange={(newValue) => updateCriteria(key as keyof EvaluationCriteria, newValue)}
                    max={10}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-20 text-right">10 - Excellent</span>
                </div>
                <div className="flex justify-center mt-2">
                  <Badge variant={value >= 8 ? "default" : value >= 6 ? "secondary" : "destructive"} className="px-4 py-1 text-sm">
                    {getScoreLabel(value)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Commentaires et Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ajoutez vos observations détaillées, points forts, axes d'amélioration, recommandations..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={6}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button onClick={handleSave}>
          <Send className="h-4 w-4 mr-2" />
          Publier Évaluation
        </Button>
      </div>

      {/* Evaluation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de l'Évaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{calculateOverallScore()}</div>
              <div className="text-sm text-muted-foreground">Note Globale</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(evaluation).filter((v) => v >= 8).length}
              </div>
              <div className="text-sm text-muted-foreground">Points Forts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(evaluation).filter((v) => v >= 6 && v < 8).length}
              </div>
              <div className="text-sm text-muted-foreground">À Développer</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {Object.values(evaluation).filter((v) => v < 6).length}
              </div>
              <div className="text-sm text-muted-foreground">À Améliorer</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
