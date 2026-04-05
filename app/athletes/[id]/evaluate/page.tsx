"use client"
import React, { useState, useEffect } from "react"
import { use } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import evaluationSchema from "@/schema/evaluationSchema.json"
import { saveEvaluation } from "@/lib/demo-evaluations"
import { useAuth } from "@/lib/auth-context"

interface EvaluationFormData {
  // Athlete metadata
  lastName: string
  firstName: string
  club: string
  regionalCommittee: string
  birthDate: string
  armedArm: string
  natRankU15: string
  // Domain evaluations (Likert 4)
  physique: number | null
  technique: number | null
  garde: number | null
  motivation: number | null
  main: number | null
  mobilite: number | null
  cognitif: number | null
  // Summary and potential
  bilan: string
  potential: string
}

export default function AthleteEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [athlete, setAthlete] = useState<any>(null)
  const [formData, setFormData] = useState<EvaluationFormData>({
    lastName: "",
    firstName: "",
    club: "",
    regionalCommittee: "",
    birthDate: "",
    armedArm: "",
    natRankU15: "",
    physique: null,
    technique: null,
    garde: null,
    motivation: null,
    main: null,
    mobilite: null,
    cognitif: null,
    bilan: "",
    potential: "",
  })

  // Load athlete data in demo mode
  useEffect(() => {
    const loadAthlete = async () => {
      try {
        const { DEMO_ATHLETES } = await import("@/lib/demo-athletes")
        const demoAthlete = DEMO_ATHLETES.find(a => a.id === resolvedParams.id)
        
        if (demoAthlete) {
          setAthlete(demoAthlete)
          // Pre-fill form with athlete data
          setFormData(prev => ({
            ...prev,
            lastName: demoAthlete.last_name,
            firstName: demoAthlete.first_name,
            club: demoAthlete.club,
            regionalCommittee: demoAthlete.region,
            birthDate: demoAthlete.date_of_birth,
            armedArm: "Droitier", // Default, can be changed
          }))
        }
      } catch (err) {
        console.error("Error loading athlete:", err)
      }
    }
    loadAthlete()
  }, [resolvedParams.id])

  const handleInputChange = (key: keyof EvaluationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const calculateDomainScore = (): number => {
    const domainValues = [
      formData.physique,
      formData.technique,
      formData.garde,
      formData.motivation,
      formData.main,
      formData.mobilite,
      formData.cognitif,
    ].filter((v): v is number => v !== null)
    
    if (domainValues.length === 0) return 0
    const avg = domainValues.reduce((sum, val) => sum + val, 0) / domainValues.length
    return Math.round(avg * 25 * 10) / 10 // avg * 25, rounded to 1 decimal
  }

  const getScoreLabel = (score: number): string => {
    const labels = evaluationSchema.scoring.labels
    for (const label of labels) {
      if (score >= label.min && score <= label.max) {
        return label.label
      }
    }
    return labels[0].label
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.lastName || !formData.firstName || !formData.birthDate || !formData.armedArm) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires des métadonnées de l'athlète",
        variant: "destructive",
      })
      return
    }

    if (!formData.potential) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner le potentiel de l'athlète",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      const globalScore = calculateDomainScore()
      const scoreLabel = getScoreLabel(globalScore)
      
      // Sauvegarder l'évaluation en mode démo
      saveEvaluation({
        athleteId: resolvedParams.id,
        evaluatorName: user?.name || "Évaluateur",
        evaluatorRole: user?.role || "coach",
        lastName: formData.lastName,
        firstName: formData.firstName,
        club: formData.club,
        regionalCommittee: formData.regionalCommittee,
        birthDate: formData.birthDate,
        armedArm: formData.armedArm,
        natRankU15: formData.natRankU15,
        physique: formData.physique || 0,
        technique: formData.technique || 0,
        garde: formData.garde || 0,
        motivation: formData.motivation || 0,
        main: formData.main || 0,
        mobilite: formData.mobilite || 0,
        cognitif: formData.cognitif || 0,
        bilan: formData.bilan,
        potential: formData.potential,
        globalScore,
        scoreLabel,
      })
      
      toast({
        title: "Succès",
        description: `Évaluation enregistrée avec succès. Score global: ${globalScore.toFixed(1)}% (${scoreLabel})`,
      })
      
      // Optionally reset form or navigate away
    } catch (err) {
      console.error("Error saving evaluation:", err)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'évaluation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const globalScore = calculateDomainScore()
  const scoreLabel = getScoreLabel(globalScore)

  return (
    <ProtectedRoute allowedRoles={["coach", "administrator"]}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{evaluationSchema.meta.title}</h1>
            <p className="text-muted-foreground">Évaluation des jeunes talents en escrime</p>
            <p className="text-xs text-muted-foreground mt-1">Source: {evaluationSchema.meta.source}</p>
          </div>

          {/* Athlete Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Métadonnées Athlète</CardTitle>
              <CardDescription>Informations de base sur l'athlète évalué</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {evaluationSchema.athleteFields.map((field) => {
                  if (field.type === "text") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.key}
                          value={formData[field.key as keyof EvaluationFormData] as string}
                          onChange={(e) => handleInputChange(field.key as keyof EvaluationFormData, e.target.value)}
                          required={field.required}
                        />
                      </div>
                    )
                  } else if (field.type === "date") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.key}
                          type="date"
                          value={formData[field.key as keyof EvaluationFormData] as string}
                          onChange={(e) => handleInputChange(field.key as keyof EvaluationFormData, e.target.value)}
                          required={field.required}
                        />
                      </div>
                    )
                  } else if (field.type === "select") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Select
                          value={formData[field.key as keyof EvaluationFormData] as string}
                          onValueChange={(value) => handleInputChange(field.key as keyof EvaluationFormData, value)}
                          required={field.required}
                        >
                          <SelectTrigger id={field.key}>
                            <SelectValue placeholder={`Sélectionner ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  } else if (field.type === "number") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.key}
                          type="number"
                          min={field.min}
                          value={formData[field.key as keyof EvaluationFormData] as string}
                          onChange={(e) => handleInputChange(field.key as keyof EvaluationFormData, e.target.value)}
                          required={field.required}
                        />
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Domains */}
          <Card>
            <CardHeader>
              <CardTitle>Items évalués</CardTitle>
              <CardDescription>
                Échelle à 4 niveaux — Mettre une croix par élément évalué
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scale Legend */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Échelle (Likert 4 points)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {evaluationSchema.scale.values.map((scaleValue) => (
                    <div key={scaleValue.value} className="text-sm">
                      <span className="font-bold text-primary">{scaleValue.value} = </span>
                      <span className="text-muted-foreground">{scaleValue.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domain Evaluations */}
              <div className="space-y-4">
                {evaluationSchema.domains.map((domain) => (
                  <div key={domain.key} className="border rounded-lg p-4 space-y-3">
                    <Label className="text-base font-medium">{domain.label}</Label>
                    <div className="flex gap-4">
                      {evaluationSchema.scale.values.map((scaleValue) => (
                        <div key={scaleValue.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`${domain.key}-${scaleValue.value}`}
                            name={domain.key}
                            value={scaleValue.value}
                            checked={formData[domain.key as keyof EvaluationFormData] === scaleValue.value}
                            onChange={() => handleInputChange(domain.key as keyof EvaluationFormData, scaleValue.value)}
                            className="h-4 w-4 text-primary"
                          />
                          <Label
                            htmlFor={`${domain.key}-${scaleValue.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {scaleValue.value}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Champs libres & synthèse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={evaluationSchema.summary.key}>
                  {evaluationSchema.summary.label}
                  {evaluationSchema.summary.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Textarea
                  id={evaluationSchema.summary.key}
                  value={formData.bilan}
                  onChange={(e) => handleInputChange("bilan", e.target.value)}
                  placeholder="Rédigez le bilan individuel général de l'athlète..."
                  rows={6}
                  maxLength={evaluationSchema.summary.maxLength}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bilan.length} / {evaluationSchema.summary.maxLength} caractères
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Potential */}
          <Card>
            <CardHeader>
              <CardTitle>Potentiel de l'athlète</CardTitle>
              <CardDescription>Évaluation du potentiel (obligatoire)</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.potential}
                onValueChange={(value) => handleInputChange("potential", value)}
                className="space-y-3"
              >
                {evaluationSchema.potential.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Score Summary */}
          {globalScore > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">
                    {globalScore.toFixed(1)}%
                  </div>
                  <div className="text-xl font-semibold">{scoreLabel}</div>
                  <div className="text-sm text-muted-foreground">Score global calculé</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                "Enregistrement..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer l'évaluation
                </>
              )}
            </Button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
