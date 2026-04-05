"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

interface VideoAnalysisData {
  category: "U13" | "U15" | null
  duration: "<1min" | "1-2min" | null
  context: "Match libre" | "Lecon" | "Competition" | null
  // Lecture générale
  attitude: number | null
  equilibre: number | null
  deplacement: number | null
  // Aspects techniques
  fente: number | null
  brasArme: number | null
  enchainements: number | null
  precision: number | null
  // Tactique
  initiative: number | null
  variation: number | null
  distance: number | null
  adaptation: number | null
  // Bilan
  comportement: string[]
  profil: string[]
  remarques: string
}

interface VideoAnalysisGridProps {
  videoId: string
  onSave?: (data: VideoAnalysisData) => void
}

export function VideoAnalysisGrid({ videoId, onSave }: VideoAnalysisGridProps) {
  const [formData, setFormData] = useState<VideoAnalysisData>({
    category: null,
    duration: null,
    context: null,
    attitude: null,
    equilibre: null,
    deplacement: null,
    fente: null,
    brasArme: null,
    enchainements: null,
    precision: null,
    initiative: null,
    variation: null,
    distance: null,
    adaptation: null,
    comportement: [],
    profil: [],
    remarques: "",
  })

  const handleCategoryChange = (value: "U13" | "U15") => {
    setFormData(prev => ({
      ...prev,
      category: prev.category === value ? null : value,
    }))
  }

  const handleDurationChange = (value: "<1min" | "1-2min") => {
    setFormData(prev => ({
      ...prev,
      duration: prev.duration === value ? null : value,
    }))
  }

  const handleContextChange = (value: "Match libre" | "Lecon" | "Competition") => {
    setFormData(prev => ({
      ...prev,
      context: prev.context === value ? null : value,
    }))
  }

  const handleComportementChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      comportement: prev.comportement.includes(value)
        ? prev.comportement.filter(v => v !== value)
        : [...prev.comportement, value],
    }))
  }

  const handleProfilChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      profil: prev.profil.includes(value)
        ? prev.profil.filter(v => v !== value)
        : [...prev.profil, value],
    }))
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
    }
    // En mode démo, on pourrait sauvegarder dans localStorage
    console.log("Analysis data saved:", formData)
  }

  const RatingScale = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string
    value: number | null
    onChange: (value: number) => void 
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`w-10 h-10 rounded border-2 transition-colors ${
              value === num
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grille de Visionnage - Analyse Video Sabre Talent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations générales */}
        <div className="space-y-4 border-b pb-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Catégorie observée :</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="category-u13"
                  checked={formData.category === "U13"}
                  onCheckedChange={() => handleCategoryChange("U13")}
                />
                <Label htmlFor="category-u13" className="cursor-pointer">U13</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="category-u15"
                  checked={formData.category === "U15"}
                  onCheckedChange={() => handleCategoryChange("U15")}
                />
                <Label htmlFor="category-u15" className="cursor-pointer">U15</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Durée de la vidéo :</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="duration-1min"
                  checked={formData.duration === "<1min"}
                  onCheckedChange={() => handleDurationChange("<1min")}
                />
                <Label htmlFor="duration-1min" className="cursor-pointer">&lt;1min</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="duration-1-2min"
                  checked={formData.duration === "1-2min"}
                  onCheckedChange={() => handleDurationChange("1-2min")}
                />
                <Label htmlFor="duration-1-2min" className="cursor-pointer">1-2min</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Contexte :</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="context-match"
                  checked={formData.context === "Match libre"}
                  onCheckedChange={() => handleContextChange("Match libre")}
                />
                <Label htmlFor="context-match" className="cursor-pointer">Match libre</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="context-lecon"
                  checked={formData.context === "Lecon"}
                  onCheckedChange={() => handleContextChange("Lecon")}
                />
                <Label htmlFor="context-lecon" className="cursor-pointer">Leçon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="context-competition"
                  checked={formData.context === "Competition"}
                  onCheckedChange={() => handleContextChange("Competition")}
                />
                <Label htmlFor="context-competition" className="cursor-pointer">Compétition</Label>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Lecture générale du tireur */}
        <div className="space-y-4 border-b pb-4">
          <h3 className="text-lg font-semibold">1. Lecture générale du tireur</h3>
          <div className="grid gap-4 md:grid-cols-1">
            <RatingScale
              label="Attitude / Engagement (motivé, attentif, volontaire)"
              value={formData.attitude}
              onChange={(value) => setFormData(prev => ({ ...prev, attitude: value }))}
            />
            <RatingScale
              label="Équilibre / Posture (appuis stables, posture offensive)"
              value={formData.equilibre}
              onChange={(value) => setFormData(prev => ({ ...prev, equilibre: value }))}
            />
            <RatingScale
              label="Qualité du déplacement (avant/arrière, latéralité)"
              value={formData.deplacement}
              onChange={(value) => setFormData(prev => ({ ...prev, deplacement: value }))}
            />
          </div>
        </div>

        {/* 2. Aspects techniques visibles */}
        <div className="space-y-4 border-b pb-4">
          <h3 className="text-lg font-semibold">2. Aspects techniques visibles</h3>
          <div className="grid gap-4 md:grid-cols-1">
            <RatingScale
              label="Fente (fluidité, précision)"
              value={formData.fente}
              onChange={(value) => setFormData(prev => ({ ...prev, fente: value }))}
            />
            <RatingScale
              label="Maîtrise du bras armé"
              value={formData.brasArme}
              onChange={(value) => setFormData(prev => ({ ...prev, brasArme: value }))}
            />
            <RatingScale
              label="Enchaînements simples (attaque/parade/reprise)"
              value={formData.enchainements}
              onChange={(value) => setFormData(prev => ({ ...prev, enchainements: value }))}
            />
            <RatingScale
              label="Précision des touches"
              value={formData.precision}
              onChange={(value) => setFormData(prev => ({ ...prev, precision: value }))}
            />
          </div>
        </div>

        {/* 3. Tactique visible en situation */}
        <div className="space-y-4 border-b pb-4">
          <h3 className="text-lg font-semibold">3. Tactique visible en situation</h3>
          <div className="grid gap-4 md:grid-cols-1">
            <RatingScale
              label="Prise d'initiative / attaque"
              value={formData.initiative}
              onChange={(value) => setFormData(prev => ({ ...prev, initiative: value }))}
            />
            <RatingScale
              label="Capacité à varier (ligne, tempo)"
              value={formData.variation}
              onChange={(value) => setFormData(prev => ({ ...prev, variation: value }))}
            />
            <RatingScale
              label="Gestion de la distance"
              value={formData.distance}
              onChange={(value) => setFormData(prev => ({ ...prev, distance: value }))}
            />
            <RatingScale
              label="Capacité d'adaptation (lecture)"
              value={formData.adaptation}
              onChange={(value) => setFormData(prev => ({ ...prev, adaptation: value }))}
            />
          </div>
        </div>

        {/* 4. Bilan de visionnage */}
        <div className="space-y-4 border-b pb-4">
          <h3 className="text-lg font-semibold">4. Bilan de visionnage</h3>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Comportement observé :</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Dynamique", "En retrait", "Inconstant", "Confiant", "A revoir"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`comportement-${option}`}
                    checked={formData.comportement.includes(option)}
                    onCheckedChange={() => handleComportementChange(option)}
                  />
                  <Label htmlFor={`comportement-${option}`} className="cursor-pointer text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ce profil mérite :</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Suivi immédiat", "Observation secondaire", "Retour au club", "A revoir"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`profil-${option}`}
                    checked={formData.profil.includes(option)}
                    onCheckedChange={() => handleProfilChange(option)}
                  />
                  <Label htmlFor={`profil-${option}`} className="cursor-pointer text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Remarques */}
        <div className="space-y-2">
          <Label htmlFor="remarques" className="text-sm font-semibold">Remarques (libres) :</Label>
          <Textarea
            id="remarques"
            placeholder="Ajoutez vos remarques ici..."
            value={formData.remarques}
            onChange={(e) => setFormData(prev => ({ ...prev, remarques: e.target.value }))}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="min-w-[120px]">
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

