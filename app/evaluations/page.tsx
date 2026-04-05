"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loading } from "@/components/common/loading"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useEvaluationApi, type Evaluation } from "@/hooks/use-evaluation-api"
import { useUserApi } from "@/hooks/use-user-api"
import { useAthleteApi } from "@/hooks/use-athlete-api"
import { useVideoApi } from "@/hooks/use-video-api"
import {
  Search,
  Filter,
  Star,
  Calendar,
  User,
  Video,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Clock,
  Plus,
} from "lucide-react"
import Link from "next/link"

export default function EvaluationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { getAllEvaluations, deleteEvaluation } = useEvaluationApi()
  const { getMe } = useUserApi()
  const { getAthlete } = useAthleteApi()
  const { getVideo } = useVideoApi()
  
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filters, setFilters] = useState({
    dateRange: "all", // all, week, month, quarter, year
    scoreRange: "all", // all, excellent (8+), good (6-7), needs-improvement (0-5)
    sortBy: "date", // date, score, athlete, video
    sortOrder: "desc" // asc, desc
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Charger les évaluations de l'API (anciennes)
        let apiEvaluations: Evaluation[] = []
        try {
          const userData = await getMe()
          setCurrentUser(userData)
          const response = await getAllEvaluations({ evaluator_id: userData.id })
          apiEvaluations = response.evaluations || []
        } catch (apiErr) {
          console.warn("API evaluations not available (demo mode):", apiErr)
          // En mode démo, on continue sans les évaluations API
        }
        
        // Initialiser les évaluations de démo si nécessaire
        try {
          const { seedDemoEvaluations } = await import("@/lib/demo-evaluations-seed")
          await seedDemoEvaluations()
        } catch (seedErr) {
          console.warn("Could not seed demo evaluations:", seedErr)
        }
        
        // Charger les évaluations de démo depuis localStorage (nouvelles)
        let demoEvaluations: Evaluation[] = []
        try {
          const { getEvaluations } = await import("@/lib/demo-evaluations")
          const { DEMO_ATHLETES } = await import("@/lib/demo-athletes")
          
          const allDemoEvaluations = getEvaluations()
          
          // Transformer les évaluations de démo au format Evaluation
          demoEvaluations = allDemoEvaluations.map((demoEval) => {
            const athlete = DEMO_ATHLETES.find(a => a.id === demoEval.athleteId)
            const athleteName = athlete 
              ? `${athlete.first_name} ${athlete.last_name}`
              : `${demoEval.firstName} ${demoEval.lastName}`
            
            // Convertir le score global (0-100%) en score sur 10
            const scoreOn10 = (demoEval.globalScore / 100) * 10
            
            return {
              id: parseInt(demoEval.id.replace(/\D/g, '')) || Date.now(), // Convertir l'ID en nombre
              athlete_id: parseInt(demoEval.athleteId) || 0,
              athlete_name: athleteName,
              video_id: 0, // Pas de vidéo associée pour les nouvelles évaluations
              video_title: "Évaluation générale",
              evaluator_id: 0,
              evaluator_name: demoEval.evaluatorName,
              technique_score: (demoEval.technique / 4) * 10, // Convertir Likert 4 en score sur 10
              tactics_score: (demoEval.cognitif / 4) * 10, // Utiliser cognitif comme tactique
              physical_score: (demoEval.physique / 4) * 10,
              mental_score: (demoEval.motivation / 4) * 10,
              overall_score: scoreOn10,
              comments: demoEval.bilan || "",
              specific_feedback: demoEval.bilan || "",
              strengths: "",
              areas_for_improvement: "",
              recommendations: "",
              created_at: demoEval.createdAt,
              updated_at: demoEval.createdAt,
            } as Evaluation
          })
        } catch (demoErr) {
          console.warn("Demo evaluations not available:", demoErr)
        }
        
        // Combiner les deux listes (API + démo)
        const combinedEvaluations = [...apiEvaluations, ...demoEvaluations]
        
        // Trier par date (plus récentes en premier)
        combinedEvaluations.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        
        setEvaluations(combinedEvaluations)
      } catch (err) {
        console.error("Error loading evaluations:", err)
        setError("Erreur lors du chargement des évaluations")
        toast({
          title: "Erreur",
          description: "Impossible de charger les évaluations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, []) // Only run once on mount

  // Fetch missing athlete and video names
  useEffect(() => {
    const fetchMissingNames = async () => {
      const updatedEvaluations = await Promise.all(
        evaluations.map(async (evaluation) => {
          let athleteName = evaluation.athlete_name
          let videoTitle = evaluation.video_title
          if (!athleteName && evaluation.athlete_id) {
            try {
              const athlete = await getAthlete(evaluation.athlete_id)
              athleteName = athlete.first_name + ' ' + athlete.last_name
            } catch {}
          }
          if (!videoTitle && evaluation.video_id) {
            try {
              const video = await getVideo(evaluation.video_id)
              videoTitle = video.title
            } catch {}
          }
          return { ...evaluation, athlete_name: athleteName, video_title: videoTitle }
        })
      )
      setEvaluations(updatedEvaluations)
    }
    // Only run if there are missing names
    if (evaluations.some(e => !e.athlete_name || !e.video_title)) {
      fetchMissingNames()
    }
  }, [evaluations, getAthlete, getVideo])

  const handleDeleteEvaluation = async (evaluationId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")) {
      return
    }

    try {
      // Vérifier si c'est une évaluation de démo (ID très grand = probablement généré depuis eval_)
      const evaluation = evaluations.find(e => e.id === evaluationId)
      const isDemoEvaluation = evaluation && evaluation.video_title === "Évaluation générale"
      
      if (isDemoEvaluation) {
        // Supprimer depuis localStorage - on doit trouver l'ID original
        const { getEvaluations, deleteEvaluation: deleteDemoEvaluation } = await import("@/lib/demo-evaluations")
        const allDemoEvaluations = getEvaluations()
        const demoEvalToDelete = allDemoEvaluations.find(e => {
          const numericId = parseInt(e.id.replace(/\D/g, ''))
          return numericId === evaluationId || e.id.includes(String(evaluationId))
        })
        
        if (demoEvalToDelete) {
          deleteDemoEvaluation(demoEvalToDelete.id)
        }
        setEvaluations(evaluations.filter(e => e.id !== evaluationId))
        toast({
          title: "Évaluation supprimée",
          description: "L'évaluation a été supprimée avec succès",
        })
      } else {
        // Supprimer via l'API
        await deleteEvaluation(evaluationId)
        setEvaluations(evaluations.filter(e => e.id !== evaluationId))
        toast({
          title: "Évaluation supprimée",
          description: "L'évaluation a été supprimée avec succès",
        })
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'évaluation",
        variant: "destructive",
      })
    }
  }

  // Enhanced filtering and sorting logic
  const filteredAndSortedEvaluations = evaluations
    .filter(evaluation => {
      // Search filter
      const matchesSearch = !searchTerm || 
        evaluation.athlete_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.video_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.specific_feedback?.toLowerCase().includes(searchTerm.toLowerCase())

      // Date range filter
      const matchesDateRange = (() => {
        if (filters.dateRange === "all") return true
        const evaluationDate = new Date(evaluation.created_at)
        const now = new Date()
        const diffDays = (now.getTime() - evaluationDate.getTime()) / (1000 * 60 * 60 * 24)
        
        switch (filters.dateRange) {
          case "week": return diffDays <= 7
          case "month": return diffDays <= 30
          case "quarter": return diffDays <= 90
          case "year": return diffDays <= 365
          default: return true
        }
      })()

      // Score range filter
      const matchesScoreRange = (() => {
        const score = evaluation.overall_score || 0
        switch (filters.scoreRange) {
          case "excellent": return score >= 8
          case "good": return score >= 6 && score < 8
          case "needs-improvement": return score < 6
          default: return true
        }
      })()

      return matchesSearch && matchesDateRange && matchesScoreRange
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case "score":
          comparison = (a.overall_score || 0) - (b.overall_score || 0)
          break
        case "athlete":
          comparison = (a.athlete_name || "").localeCompare(b.athlete_name || "")
          break
        case "video":
          comparison = (a.video_title || "").localeCompare(b.video_title || "")
          break
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      
      return filters.sortOrder === "desc" ? -comparison : comparison
    })

  const isRecent = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 30
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateAverageScore = () => {
    if (evaluations.length === 0) return 0
    const total = evaluations.reduce((sum, evaluation) => sum + (evaluation.overall_score || 0), 0)
    return total / evaluations.length
  }

  const getTopScores = () => {
    return evaluations
      .filter(e => e.overall_score)
      .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
      .slice(0, 5)
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

  return (
    <ProtectedRoute allowedRoles={["coach", "administrator"]}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Mes Évaluations</h1>
              <p className="text-muted-foreground">
                Gérez et consultez toutes vos évaluations d'athlètes
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Évaluations</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{evaluations.length}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredAndSortedEvaluations.length} affichées
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateAverageScore().toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  sur 10 points
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Évaluations Récentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {evaluations.filter(e => isRecent(e.created_at)).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  ce mois
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excellentes Notes</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {evaluations.filter(e => (e.overall_score || 0) >= 8).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  ≥ 8/10
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par athlète, vidéo ou commentaire..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Période</Label>
                    <Select 
                      value={filters.dateRange} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les périodes</SelectItem>
                        <SelectItem value="week">Cette semaine</SelectItem>
                        <SelectItem value="month">Ce mois</SelectItem>
                        <SelectItem value="quarter">Ce trimestre</SelectItem>
                        <SelectItem value="year">Cette année</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Score Range Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Note</Label>
                    <Select 
                      value={filters.scoreRange} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, scoreRange: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les notes</SelectItem>
                        <SelectItem value="excellent">Excellent (8+)</SelectItem>
                        <SelectItem value="good">Bon (6-7)</SelectItem>
                        <SelectItem value="needs-improvement">À améliorer (0-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Trier par</Label>
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="score">Note</SelectItem>
                        <SelectItem value="athlete">Athlète</SelectItem>
                        <SelectItem value="video">Vidéo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Ordre</Label>
                    <Select 
                      value={filters.sortOrder} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Décroissant</SelectItem>
                        <SelectItem value="asc">Croissant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Summary */}
                {(filters.dateRange !== "all" || filters.scoreRange !== "all") && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Filtres actifs:</span>
                    {filters.dateRange !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.dateRange === "week" ? "Cette semaine" :
                         filters.dateRange === "month" ? "Ce mois" :
                         filters.dateRange === "quarter" ? "Ce trimestre" :
                         "Cette année"}
                      </Badge>
                    )}
                    {filters.scoreRange !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.scoreRange === "excellent" ? "Excellent (8+)" :
                         filters.scoreRange === "good" ? "Bon (6-7)" :
                         "À améliorer (0-5)"}
                      </Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFilters({
                        dateRange: "all",
                        scoreRange: "all",
                        sortBy: "date",
                        sortOrder: "desc"
                      })}
                      className="h-6 px-2 text-xs"
                    >
                      Effacer
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Evaluations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Évaluations</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : filteredAndSortedEvaluations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "Aucune évaluation trouvée pour cette recherche." : "Aucune évaluation créée pour le moment."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Athlète</TableHead>
                      <TableHead>Vidéo</TableHead>
                      <TableHead>Note Globale</TableHead>
                      <TableHead>Détails</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedEvaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://placehold.co/64x64?text=${evaluation.athlete_name?.charAt(0) ?? "A"}`} />
                              <AvatarFallback>{evaluation.athlete_name?.charAt(0) ?? "A"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{(evaluation as any).athlete_name || "Athlète inconnu"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{(evaluation as any).video_title || "Vidéo sans titre"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getScoreColor(evaluation.overall_score || 0)}`}>
                              {evaluation.overall_score ? evaluation.overall_score.toFixed(1) : "N/A"}
                            </span>
                            <Badge variant={evaluation.overall_score && evaluation.overall_score >= 8 ? "default" : "secondary"}>
                              {evaluation.overall_score ? getScoreLabel(evaluation.overall_score) : "N/A"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {evaluation.technique_score && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs w-16">Technique:</span>
                                <Progress value={evaluation.technique_score * 10} className="h-2 flex-1" />
                                <span className="text-xs w-8">{evaluation.technique_score}</span>
                              </div>
                            )}
                            {evaluation.tactics_score && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs w-16">Tactique:</span>
                                <Progress value={evaluation.tactics_score * 10} className="h-2 flex-1" />
                                <span className="text-xs w-8">{evaluation.tactics_score}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(evaluation.created_at)}</p>
                            {evaluation.updated_at && evaluation.updated_at !== evaluation.created_at && (
                              <p className="text-muted-foreground">Modifiée: {formatDate(evaluation.updated_at)}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/videos/${evaluation.video_id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/evaluations/edit?id=${evaluation.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteEvaluation(evaluation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Top Performances */}
          {getTopScores().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Meilleures Évaluations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getTopScores().map((evaluation, index) => (
                    <div key={evaluation.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{evaluation.athlete_name}</span>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {evaluation.overall_score.toFixed(1)}/10
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {evaluation.video_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(evaluation.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
} 