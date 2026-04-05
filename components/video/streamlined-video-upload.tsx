"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Upload,
  X,
  Check,
  ChevronsUpDown,
  User,
  Calendar,
  Users,
  Sword,
  Trophy,
  AlertTriangle,
  Loader2,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useVideoApi } from "@/hooks/use-video-api";
import { useAthleteApi } from "@/hooks/use-athlete-api";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { COMPETITION_TYPES, COMPETITION_GROUPS } from "@/lib/utils"
import React from "react"

interface Athlete {
  id: number
  first_name: string
  last_name: string
  date_of_birth: string
  gender: "male" | "female"
  weapon: "foil" | "sabre" | "épée"
  skill_level: "beginner" | "intermediate" | "advanced" | "elite"
  club?: string
  region?: string
}

interface UploadedFile {
  file: File
  progress: number
  status: "uploading" | "completed" | "error"
}

// Real athletes will be loaded from API

// Weapon mapping: French display names to English backend values
const weapons = [
  { display: "Fleuret", value: "foil" },
  { display: "Sabre", value: "sabre" },
  { display: "Épée", value: "epee" }
]

function AthleteSelect({
  label,
  selectedAthlete,
  setSelectedAthlete,
  excludeAthleteId,
  error,
  athletes,
  loadingAthletes,
}: {
  label: string
  selectedAthlete: Athlete | null
  setSelectedAthlete: (athlete: Athlete) => void
  excludeAthleteId?: number
  error?: string
  athletes: Athlete[]
  loadingAthletes: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const filtered = athletes.filter(
    (athlete) =>
      (!excludeAthleteId || athlete.id !== excludeAthleteId) &&
      (search === "" || 
        (athlete.first_name + " " + athlete.last_name).toLowerCase().includes(search.toLowerCase()) ||
        (athlete.club || "").toLowerCase().includes(search.toLowerCase()))
  )
  return (
    <div className="space-y-1">
      <Label className="text-base font-medium flex items-center gap-2">
        <User className="h-4 w-4" />
        {label}
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            disabled={loadingAthletes}
            className={cn("w-full justify-between bg-transparent", error && "border-red-500")}
          >
            {loadingAthletes ? "Chargement des athlètes..." : selectedAthlete ? `${selectedAthlete.first_name} ${selectedAthlete.last_name}` : "Sélectionner un athlète..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Rechercher un athlète..."
              value={search}
              onValueChange={setSearch}
              autoFocus
            />
            <CommandList>
              <CommandEmpty>
                {loadingAthletes ? "Chargement..." : "Aucun athlète trouvé."}
              </CommandEmpty>
              <CommandGroup>
                {loadingAthletes ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Chargement des athlètes...</span>
                  </div>
                ) : (
                  filtered.map((athlete) => (
                  <CommandItem
                    key={athlete.id}
                    value={`${athlete.first_name} ${athlete.last_name} ${athlete.id}`}
                    onSelect={() => {
                      setSelectedAthlete(athlete)
                      setIsOpen(false)
                      setSearch("")
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedAthlete?.id === athlete.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{athlete.first_name} {athlete.last_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date().getFullYear() - new Date(athlete.date_of_birth).getFullYear()} ans • {athlete.gender === "male" ? "Homme" : "Femme"} • {athlete.weapon}
                      </span>
                      <span className="text-xs text-muted-foreground">{athlete.club || "Club non spécifié"}</span>
                    </div>
                  </CommandItem>
                ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedAthlete && (
        <Card className="bg-muted/50 mt-2">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date().getFullYear() - new Date(selectedAthlete.date_of_birth).getFullYear()} ans</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{selectedAthlete.gender === "male" ? "Homme" : "Femme"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sword className="h-4 w-4 text-muted-foreground" />
                <span>{selectedAthlete.weapon}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{selectedAthlete.club || "Club non spécifié"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  )
}

export function StreamlinedVideoUpload() {
  const [athleteMode, setAthleteMode] = useState<"single" | "dual">("single")
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)
  const [selectedAthleteLeft, setSelectedAthleteLeft] = useState<Athlete | null>(null)
  const [selectedAthleteRight, setSelectedAthleteRight] = useState<Athlete | null>(null)
  const [selectedWeapon, setSelectedWeapon] = useState("")
  const [selectedWeaponValue, setSelectedWeaponValue] = useState("")
  const [competitionType, setCompetitionType] = useState("")
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [athleteError, setAthleteError] = useState<string>("")
  const [athleteLeftError, setAthleteLeftError] = useState<string>("")
  const [athleteRightError, setAthleteRightError] = useState<string>("")
  // Add state for video title, date, and description
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDate, setVideoDate] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  // Add state for scores
  const [scoreSingle, setScoreSingle] = useState("");
  const [scoreLeft, setScoreLeft] = useState("");
  const [scoreRight, setScoreRight] = useState("");
  // Add state for video preview
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  // Add state for athletes loading
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loadingAthletes, setLoadingAthletes] = useState(true)

  const router = useRouter();
  const { uploadVideo } = useVideoApi();
  const { getAthletes } = useAthleteApi();

  // Load athletes on component mount
  useEffect(() => {
    const loadAthletes = async () => {
      try {
        setLoadingAthletes(true)
        const athletesData = await getAthletes({ limit: 100 })
        setAthletes(athletesData)
      } catch (error) {
        console.error('Error loading athletes:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des athlètes",
          variant: "destructive",
        })
      } finally {
        setLoadingAthletes(false)
      }
    }

    loadAthletes()
  }, [getAthletes])

  // Add a useEffect to reset form fields when athleteMode changes
  useEffect(() => {
    setSelectedAthlete(null);
    setSelectedAthleteLeft(null);
    setSelectedAthleteRight(null);
    setScoreSingle("");
    setScoreLeft("");
    setScoreRight("");
    setAthleteError("");
    setAthleteLeftError("");
    setAthleteRightError("");
    // Optionally reset more fields if needed
  }, [athleteMode]);

  const handleFileUpload = useCallback((uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    const file = uploadedFiles[0];
    setFiles([{ file, progress: 100, status: "completed" }]);
    setVideoPreview(URL.createObjectURL(file));
  }, []);

  // Weapon compatibility: compare display name with API weapon value
  const isWeaponCompatible = selectedAthlete && selectedWeapon ? 
    weapons.find(w => w.display === selectedWeapon)?.value === selectedAthlete.weapon : true

  // Compute isFormValid based on athleteMode
  const isFormValid = athleteMode === "single"
    ? selectedAthlete && videoTitle && competitionType && videoDate && files.length > 0
    : selectedAthleteLeft && selectedAthleteRight && videoTitle && competitionType && videoDate && files.length > 0 && scoreLeft && scoreRight;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Téléchargement de Vidéo Simplifié
          </CardTitle>
          <CardDescription>
            Interface simplifiée pour télécharger des vidéos d'escrime avec toutes les informations nécessaires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="video-upload" className="text-base font-medium">
              Fichiers Vidéo *
            </Label>
            {files.length === 0 ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Glissez-déposez vos vidéos ici</p>
                  <p className="text-sm text-muted-foreground">ou cliquez pour sélectionner des fichiers</p>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => handleFileUpload(e.target.files)}
                  />
                  <Button variant="outline" onClick={() => document.getElementById("video-upload")?.click()}>
                    Sélectionner des fichiers
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 mt-4 relative">
                <button
                  type="button"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-gray-700/80 text-white p-3 rounded-full shadow hover:bg-gray-800/90 transition flex items-center justify-center"
                  onClick={() => setShowPreview(true)}
                  style={{ display: showPreview ? 'none' : 'flex' }}
                >
                  <Play className="h-7 w-7" />
                </button>
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                  <DialogContent className="max-w-3xl">
                    <video
                      src={videoPreview}
                      className="w-full h-[70vh] object-contain rounded shadow"
                      controls
                      autoPlay
                      muted={false}
                    />
                  </DialogContent>
                </Dialog>
                {videoLoading && (
                  <div className="flex items-center justify-center w-48 h-32">
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className={`w-48 h-32 object-cover rounded shadow ${videoLoading ? 'hidden' : ''}`}
                  controls={false}
                  autoPlay={false}
                  muted
                  poster=""
                  onLoadedData={() => setVideoLoading(false)}
                  onLoadStart={() => setVideoLoading(true)}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setFiles([]);
                    setVideoPreview("");
                    setVideoLoading(false);
                    setShowPreview(false);
                  }}
                >
                  Supprimer la vidéo
                </Button>
              </div>
            )}

            {/* Upload Progress */}
            {files.length > 0 && (
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{file.file.name}</span>
                      <span className="text-muted-foreground">
                        {file.status === "completed" ? "Terminé" : `${file.progress}%`}
                      </span>
                    </div>
                    <Progress value={file.progress} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Title Field */}
          <div className="space-y-4">
            <div className="mt-8">
              <Label htmlFor="video-title">Titre de la vidéo *</Label>
              <Input
                id="video-title"
                placeholder="Entrez le titre de la vidéo"
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Athlete Mode Selection with Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Nombre d'athlètes :</span>
            </div>
            <Tabs value={athleteMode} onValueChange={(value) => setAthleteMode(value as "single" | "dual")}
              className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="single" className="w-1/2">Un athlète</TabsTrigger>
                <TabsTrigger value="dual" className="w-1/2">Deux athlètes</TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <AthleteSelect
                  label="Sélection d'Athlète *"
                  selectedAthlete={selectedAthlete}
                  setSelectedAthlete={setSelectedAthlete}
                  error={athleteError}
                  athletes={athletes}
                  loadingAthletes={loadingAthletes}
                />
              </TabsContent>
              <TabsContent value="dual">
                <div className="flex flex-col gap-4">
                  <AthleteSelect
                    label="Athlète à gauche"
                    selectedAthlete={selectedAthleteLeft}
                    setSelectedAthlete={setSelectedAthleteLeft}
                    excludeAthleteId={selectedAthleteRight?.id}
                    error={athleteLeftError}
                    athletes={athletes}
                    loadingAthletes={loadingAthletes}
                  />
                  <AthleteSelect
                    label="Athlète à droite"
                    selectedAthlete={selectedAthleteRight}
                    setSelectedAthlete={setSelectedAthleteRight}
                    excludeAthleteId={selectedAthleteLeft?.id}
                    error={athleteRightError}
                    athletes={athletes}
                    loadingAthletes={loadingAthletes}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Weapon Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Sword className="h-4 w-4" />
              Sélection d'Arme *
            </Label>
            <Select value={selectedWeapon} onValueChange={setSelectedWeapon}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une arme..." />
              </SelectTrigger>
              <SelectContent>
                {weapons.map((weapon) => (
                  <SelectItem key={weapon.value} value={weapon.display}>
                    {weapon.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Weapon Compatibility Warning */}
            {selectedAthlete && selectedWeapon && !isWeaponCompatible && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Attention: {selectedAthlete.first_name} {selectedAthlete.last_name} ne pratique habituellement pas le {selectedWeapon}. Arme
                  pratiquée: {selectedAthlete.weapon}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Competition Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Type de Compétition *
            </Label>
            <Select value={competitionType} onValueChange={value => setCompetitionType(value === 'clear' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de compétition..." />
              </SelectTrigger>
              <SelectContent className="max-h-64 overflow-y-auto">
                <SelectItem value="clear" className="text-muted-foreground italic">Aucune sélection</SelectItem>
                {COMPETITION_GROUPS.map((group: { level: string; competitions: string[] }) => (
                  <React.Fragment key={group.level}>
                    <div className="px-3 py-1 text-sm font-semibold text-muted-foreground bg-muted/30 border-t border-muted cursor-default select-none">
                      {group.level}
                    </div>
                    {group.competitions.map((competition: string) => (
                      <SelectItem key={competition} value={competition}>
                        {competition}
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Video Date and Description Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-date">Date de la vidéo *</Label>
              <Input
                id="video-date"
                type="date"
                value={videoDate}
                onChange={e => setVideoDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="video-description">Description</Label>
              <textarea
                id="video-description"
                className="w-full border rounded p-2 min-h-[80px]"
                placeholder="Décrivez le contenu de la vidéo (optionnel)"
                value={videoDescription}
                onChange={e => setVideoDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Scores Inputs */}
          {athleteMode === "dual" && (
            <div className="flex flex-col gap-2 mt-4">
              <Label>Scores des athlètes</Label>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex flex-col items-center">
                  <Label htmlFor="score-left" className="block mb-1 text-xs">Gauche</Label>
                  <Input
                    id="score-left"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={scoreLeft}
                    onChange={e => setScoreLeft(e.target.value)}
                    className={`w-20 h-12 mx-auto text-center rounded-lg shadow-sm focus:ring-2 focus:ring-primary font-bold transition-colors ${scoreLeft && scoreRight ? (Number(scoreLeft) > Number(scoreRight) ? 'border-green-500 text-green-700' : Number(scoreLeft) < Number(scoreRight) ? 'border-red-500 text-red-700' : 'border-gray-400') : ''}`}
                  />
                </div>
                <span className="font-bold text-lg text-muted-foreground">-</span>
                <div className="flex flex-col items-center">
                  <Label htmlFor="score-right" className="block mb-1 text-xs">Droite</Label>
                  <Input
                    id="score-right"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={scoreRight}
                    onChange={e => setScoreRight(e.target.value)}
                    className={`w-20 h-12 mx-auto text-center rounded-lg shadow-sm focus:ring-2 focus:ring-primary font-bold transition-colors ${scoreLeft && scoreRight ? (Number(scoreRight) > Number(scoreLeft) ? 'border-green-500 text-green-700' : Number(scoreRight) < Number(scoreLeft) ? 'border-red-500 text-red-700' : 'border-gray-400') : ''}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              onClick={async () => {
                setUploading(true);
                setUploadError(null);
                setUploadSuccess(null);
                
                // Log form data for debugging
                console.log('=== FORM DATA BEING SENT ===');
                console.log('Athlete Mode:', athleteMode);
                console.log('Video Title:', videoTitle);
                console.log('Video Description:', videoDescription);
                console.log('Selected Weapon:', selectedWeapon);
                console.log('Competition Type:', competitionType);
                console.log('Video Date:', videoDate);
                console.log('File:', files[0]?.file);
                if (athleteMode === "single") {
                  console.log('Selected Athlete:', selectedAthlete);
                } else {
                  console.log('Selected Athlete Left:', selectedAthleteLeft);
                  console.log('Selected Athlete Right:', selectedAthleteRight);
                  console.log('Score Left:', scoreLeft);
                  console.log('Score Right:', scoreRight);
                }
                console.log('===========================');
                
                // Validation checks
                console.log('=== VALIDATION CHECKS ===');
                console.log('Form Valid:', isFormValid);
                console.log('Has File:', files.length > 0);
                console.log('Has Title:', !!videoTitle);
                console.log('Has Competition Type:', !!competitionType);
                console.log('Has Date:', !!videoDate);
                if (athleteMode === "single") {
                  console.log('Has Athlete:', !!selectedAthlete);
                } else {
                  console.log('Has Athlete Left:', !!selectedAthleteLeft);
                  console.log('Has Athlete Right:', !!selectedAthleteRight);
                  console.log('Has Score Left:', !!scoreLeft);
                  console.log('Has Score Right:', !!scoreRight);
                }
                console.log('========================');
                
                try {
                  let response;
                  
                  if (athleteMode === "single") {
                    if (!selectedAthlete || !selectedAthlete.id) throw new Error("Veuillez sélectionner un athlète.");
                    response = await uploadVideo({
                      file: files[0].file,
                      title: videoTitle,
                      description: videoDescription,
                      athleteRight_id: Number(selectedAthlete.id),
                      athleteLeft_id: Number(selectedAthlete.id),
                      weapon_type: weapons.find(w => w.display === selectedWeapon)?.value as "foil" | "sabre" | "epee" | undefined,
                      competition_name: competitionType,
                      competition_date: videoDate,
                      is_public: true,
                    });
                  } else {
                    if (!selectedAthleteRight || !selectedAthleteRight.id || !selectedAthleteLeft || !selectedAthleteLeft.id) throw new Error("Veuillez sélectionner les deux athlètes.");
                    response = await uploadVideo({
                      file: files[0].file,
                      title: videoTitle,
                      description: videoDescription,
                      athleteRight_id: Number(selectedAthleteRight.id),
                      athleteLeft_id: Number(selectedAthleteLeft.id),
                      weapon_type: weapons.find(w => w.display === selectedWeapon)?.value as "foil" | "sabre" | "epee" | undefined,
                      competition_name: competitionType,
                      competition_date: videoDate,
                      score: `${scoreLeft}-${scoreRight}`,
                      is_public: true,
                    });
                  }
                  setUploadSuccess("Vidéo envoyée avec succès !");
                  toast({
                    title: "Succès",
                    description: "La vidéo a été ajoutée avec succès !",
                  });
                  // Reset form
                  setFiles([]);
                  setVideoPreview("");
                  setVideoLoading(false);
                  setShowPreview(false);
                  setSelectedAthlete(null);
                  setSelectedAthleteLeft(null);
                  setSelectedAthleteRight(null);
                  setScoreSingle("");
                  setScoreLeft("");
                  setScoreRight("");
                  setSelectedWeapon("");
                  setCompetitionType("");
                  setVideoDate("");
                  setVideoDescription("");
                  setAthleteError("");
                  setAthleteLeftError("");
                  setAthleteRightError("");
                  // Do not redirect
                } catch (err: any) {
                  console.error("=== UPLOAD COMPONENT ERROR ===");
                  console.error("Error object:", err);
                  console.error("Error message:", err.message);
                  console.error("Error stack:", err.stack);
                  console.error("=============================");
                  
                  // Provide more specific error messages
                  let errorMessage = err.message;
                  if (err.message.includes('422')) {
                    errorMessage = "Erreur de validation: Vérifiez que tous les champs requis sont remplis correctement.";
                  } else if (err.message.includes('401')) {
                    errorMessage = "Erreur d'authentification: Veuillez vous reconnecter.";
                  } else if (err.message.includes('403')) {
                    errorMessage = "Accès refusé: Vous n'avez pas les permissions nécessaires.";
                  } else if (err.message.includes('500')) {
                    errorMessage = "Erreur serveur: Veuillez réessayer plus tard.";
                  }
                  
                  setUploadError(errorMessage);
                  toast({
                    title: "Erreur",
                    description: errorMessage,
                    variant: "destructive",
                  });
                } finally {
                  setUploading(false);
                }
              }}
              className="w-full"
              size="lg"
              disabled={!isFormValid || uploading}
            >
              {uploading ? 'Envoi en cours...' : 'Télécharger les Vidéos'}
            </Button>
            {uploading && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
              </div>
            )}
            {uploadError && <div className="text-red-500 text-center mt-2">{uploadError}</div>
            }
            {uploadSuccess && <div className="text-green-600 text-center mt-2">{uploadSuccess}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
