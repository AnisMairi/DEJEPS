"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { VideoCard } from "@/components/video/video-card"
import {
  Calendar,
  MapPin,
  Trophy,
  TrendingUp,
  Edit,
  Mail,
  User,
  Video,
  BarChart3,
  Target,
  Star,
  Clock,
  Activity,
} from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface AthleteProfile {
  id: string
  firstName: string
  lastName: string
  age: number
  gender: string
  weapon: string
  skillLevel: string
  avatar: string
  region: string
  club: string
  coach: string
  email: string
  phone: string
  joinDate: string
  ranking: string
  bio: string
  stats: {
    totalVideos: number
    totalViews: number
    averageRating: number
    competitionsEntered: number
    wins: number
    losses: number
    winRate: number
    recentForm: string
  }
  evaluations: {
    posture: number
    speed: number
    positioning: number
    technique: number
    tactics: number
    overall: number
    lastEvaluated: string
    evaluatedBy: string
  }
  performanceHistory: {
    date: string
    competition: string
    result: string
    score: string
    rating: number
  }[]
  progressionData: {
    month: string
    technique: number
    physical: number
    tactical: number
    overall: number
  }[]
  videos: any[]
}

interface ComprehensiveAthleteProfileProps {
  athleteId: string
}

export function ComprehensiveAthleteProfile({ athleteId }: ComprehensiveAthleteProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [athlete, setAthlete] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    // Mode démo : utiliser les données de démo au lieu de l'API
    const loadAthlete = async () => {
      try {
        setLoading(true);
        setError(null);
        // Import dynamique pour éviter les erreurs de build
        const { DEMO_ATHLETES } = await import("@/lib/demo-athletes");
        const demoAthlete = DEMO_ATHLETES.find(a => a.id === athleteId);
        
        if (!demoAthlete) {
          setError("Athlète non trouvé");
          setLoading(false);
          return;
        }

        // Charger les vidéos de démo pour cet athlète
        const { DEMO_VIDEOS } = await import("@/lib/demo-videos");
        const athleteFullName = `${demoAthlete.first_name} ${demoAthlete.last_name}`;
        const athleteVideos = DEMO_VIDEOS.filter(v => 
          v.athlete === athleteFullName || v.athlete.includes(athleteFullName)
        );

        // Transformer les données de démo en format attendu
        const transformedAthlete = {
          id: demoAthlete.id,
          first_name: demoAthlete.first_name,
          last_name: demoAthlete.last_name,
          date_of_birth: demoAthlete.date_of_birth,
          gender: demoAthlete.gender,
          weapon: demoAthlete.weapon,
          skill_level: demoAthlete.skill_level,
          avatar_url: demoAthlete.avatar_url,
          videos_count: demoAthlete.videos_count,
          region: demoAthlete.region,
          club: demoAthlete.club,
          coach: demoAthlete.coach || "",
          ranking: demoAthlete.ranking || "-",
          email: `${demoAthlete.first_name.toLowerCase()}.${demoAthlete.last_name.toLowerCase()}@example.com`,
          phone: "01 23 45 67 89",
          created_at: new Date().toISOString(),
          bio: `Athlète prometteur en ${demoAthlete.weapon === "epee" ? "épée" : demoAthlete.weapon === "foil" ? "fleuret" : "sabre"} au club ${demoAthlete.club}.`,
          videos: athleteVideos.map(v => ({
            id: v.id,
            title: v.title,
            thumbnail: v.thumbnail,
            duration: v.duration,
            views: v.views,
            comments: v.comments,
            athlete: v.athlete,
            uploader: v.uploader,
            uploadedAt: v.uploadedAt,
          })),
        };
        
        setAthlete(transformedAthlete);
        
        // Charger les évaluations de démo pour cet athlète
        const { getEvaluationsByAthleteId } = await import("@/lib/demo-evaluations");
        const athleteEvaluations = getEvaluationsByAthleteId(athleteId);
        setEvaluations(athleteEvaluations);
      } catch (err) {
        console.error('Error loading athlete:', err);
        setError("Échec du chargement du profil de l'athlète");
        setAthlete(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadAthlete();
  }, [athleteId]);

  // Helper to map API athlete to UI structure
  const mapAthlete = (apiAthlete: any): AthleteProfile => {
    // Calculate age from date_of_birth
    let age = 0;
    if (apiAthlete.date_of_birth) {
      const today = new Date();
      const birthDate = new Date(apiAthlete.date_of_birth);
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    return {
      id: String(apiAthlete.id),
      firstName: apiAthlete.first_name,
      lastName: apiAthlete.last_name,
      age,
      gender: apiAthlete.gender,
      weapon: apiAthlete.weapon,
      skillLevel: apiAthlete.skill_level,
      avatar: apiAthlete.avatar_url || "https://placehold.co/200x200?text=Athlete",
      region: apiAthlete.region || "",
      club: apiAthlete.club || "",
      coach: apiAthlete.coach || "",
      email: apiAthlete.email || "",
      phone: apiAthlete.phone || "",
      joinDate: apiAthlete.created_at ? new Date(apiAthlete.created_at).toLocaleDateString() : "",
      ranking: apiAthlete.ranking || "-",
      bio: apiAthlete.bio || "",
      stats: {
        totalVideos: apiAthlete.videos_count || 0,
        totalViews: apiAthlete.total_views || 0,
        averageRating: apiAthlete.average_rating || 0,
        competitionsEntered: apiAthlete.competitions_entered || 0,
        wins: apiAthlete.wins || 0,
        losses: apiAthlete.losses || 0,
        winRate: apiAthlete.win_rate || 0,
        recentForm: apiAthlete.recent_form || "",
      },
      evaluations: {
        posture: apiAthlete.evaluations?.posture || 0,
        speed: apiAthlete.evaluations?.speed || 0,
        positioning: apiAthlete.evaluations?.positioning || 0,
        technique: apiAthlete.evaluations?.technique || 0,
        tactics: apiAthlete.evaluations?.tactics || 0,
        overall: apiAthlete.evaluations?.overall || 0,
        lastEvaluated: apiAthlete.evaluations?.lastEvaluated || "",
        evaluatedBy: apiAthlete.evaluations?.evaluatedBy || "",
      },
      performanceHistory: apiAthlete.performance_history || [],
      progressionData: apiAthlete.progression_data || [],
      videos: apiAthlete.videos || [],
    };
  };

  // After fetching athlete data and mapping it, ensure fallback to fake data for stats and history
  const fakeStats = {
    totalVideos: 24,
    totalViews: 3250,
    averageRating: 4.8,
    competitionsEntered: 18,
    wins: 67,
    losses: 31,
    winRate: 68.4,
    recentForm: "8W-2L",
  };

  const fakePerformanceHistory = [
    {
      date: "2024-01-10",
      competition: "Championnat Régional Final",
      result: "1st Place",
      score: "15-12",
      rating: 95,
    },
    {
      date: "2023-12-15",
      competition: "Tournoi National Jeunes",
      result: "3rd Place",
      score: "15-13",
      rating: 88,
    },
    {
      date: "2023-11-20",
      competition: "Coupe de Paris",
      result: "2nd Place",
      score: "13-15",
      rating: 82,
    },
    {
      date: "2023-10-05",
      competition: "Open de Lyon",
      result: "Quarter Finals",
      score: "12-15",
      rating: 77,
    },
    {
      date: "2023-09-18",
      competition: "Tournoi d'Automne",
      result: "1st Place",
      score: "15-10",
      rating: 93,
    },
  ];

  const fakeProgressionData = [
    { month: "Sep", technique: 75, physical: 70, tactical: 80, overall: 75 },
    { month: "Oct", technique: 78, physical: 72, tactical: 82, overall: 77 },
    { month: "Nov", technique: 80, physical: 75, tactical: 85, overall: 80 },
    { month: "Dec", technique: 85, physical: 78, tactical: 88, overall: 84 },
    { month: "Jan", technique: 88, physical: 80, tactical: 90, overall: 86 },
  ];

  const fakeEvaluations = {
    posture: 85,
    speed: 78,
    positioning: 92,
    technique: 88,
    tactics: 90,
    overall: 86,
    lastEvaluated: "2024-01-15",
    evaluatedBy: "Master Laurent",
  };

  const fakeVideos = [
    {
      id: "1",
      title: "Championnat Régional Final - Épée",
      thumbnail: "https://placehold.co/400x225?text=Video+1",
      duration: "12:34",
      views: 156,
      comments: 8,
      athlete: "Marie Dubois (16, Féminin)",
      tags: ["final", "championnat"],
      uploadedAt: "il y a 2 jours",
      evaluation: { technique: 92, tactics: 88, overall: 90 },
    },
    {
      id: "2",
      title: "Entraînement Technique - Jeu de Jambes",
      thumbnail: "https://placehold.co/400x225?text=Video+2",
      duration: "8:45",
      views: 89,
      comments: 5,
      athlete: "Marie Dubois (16, Féminin)",
      tags: ["entraînement", "technique"],
      uploadedAt: "il y a 1 semaine",
      evaluation: { technique: 85, tactics: 80, overall: 82 },
    },
  ];

  // When mapping athlete data, use fakeStats and fakePerformanceHistory as fallback
  // Calculate age from date_of_birth
  let age = 0;
  if (athlete?.date_of_birth) {
    const today = new Date();
    const birthDate = new Date(athlete.date_of_birth);
    age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }
  const mappedAthlete = {
    id: athlete?.id || "N/A",
    firstName: athlete?.first_name || "John",
    lastName: athlete?.last_name || "Doe",
    age: age || 25, // Use calculated age or fallback
    gender: athlete?.gender || "Homme",
    weapon: athlete?.weapon || "Sabre",
    skillLevel: athlete?.skill_level || "Intermédiaire",
    avatar: athlete?.avatar_url || "https://placehold.co/200x200?text=Athlete",
    region: athlete?.region || "Paris",
    club: athlete?.club || "Club Olympique",
    coach: athlete?.coach || "Coach Pierre",
    email: athlete?.email || "john.doe@example.com",
    phone: athlete?.phone || "01 23 45 67 89",
    joinDate: athlete?.created_at ? new Date(athlete.created_at).toLocaleDateString() : "N/A",
    ranking: athlete?.ranking || "N/A",
    bio: athlete?.bio || "Aucune biographie disponible.",
    stats: {
      totalVideos: athlete?.videos_count || fakeStats.totalVideos,
      totalViews: athlete?.total_views || fakeStats.totalViews,
      averageRating: athlete?.average_rating || fakeStats.averageRating,
      competitionsEntered: athlete?.competitions_entered || fakeStats.competitionsEntered,
      wins: athlete?.wins || fakeStats.wins,
      losses: athlete?.losses || fakeStats.losses,
      winRate: athlete?.win_rate || fakeStats.winRate,
      recentForm: athlete?.recent_form || fakeStats.recentForm,
    },
    evaluations: athlete?.evaluations || fakeEvaluations,
    performanceHistory: Array.isArray(athlete?.performance_history) && athlete.performance_history.length > 0
      ? athlete.performance_history
      : fakePerformanceHistory,
    progressionData: Array.isArray(athlete?.progression_data) && athlete.progression_data.length > 0
      ? athlete.progression_data
      : fakeProgressionData,
    videos: Array.isArray(athlete?.videos) && athlete.videos.length > 0
      ? athlete.videos
      : fakeVideos,
  };

  if (loading) {
    return <div className="text-center py-10">Chargement du profil de l'athlète...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }
  if (!athlete) {
    return null;
  }

  const radarData = [
    { subject: "Posture", A: mappedAthlete.evaluations.posture, fullMark: 10 },
    { subject: "Vitesse", A: mappedAthlete.evaluations.speed, fullMark: 10 },
    { subject: "Positionnement", A: mappedAthlete.evaluations.positioning, fullMark: 10 },
    { subject: "Technique", A: mappedAthlete.evaluations.technique, fullMark: 10 },
    { subject: "Tactique", A: mappedAthlete.evaluations.tactics, fullMark: 10 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Profil Athlète</h1>
          <p className="text-muted-foreground">Suivi complet et analyse de performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/athletes/${mappedAthlete.id}/evaluate`}>
              <Star className="h-4 w-4 mr-2" />
              Évaluer
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/athletes/${mappedAthlete.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <img
                  src={mappedAthlete.avatar || "/placeholder.svg"}
                  alt={`${mappedAthlete.firstName} ${mappedAthlete.lastName}`}
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary/10"
                />
                <div>
                  <h2 className="text-2xl font-bold">
                    {mappedAthlete.firstName} {mappedAthlete.lastName}
                  </h2>
                  <p className="text-muted-foreground">{mappedAthlete.club}</p>
                  <Badge variant="outline" className="mt-2">
                    {mappedAthlete.ranking}
                  </Badge>
                </div>

                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {mappedAthlete.weapon}
                  </Badge>
                  <Badge variant="secondary">{mappedAthlete.skillLevel}</Badge>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {mappedAthlete.age} ans • {mappedAthlete.gender}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{mappedAthlete.region}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Coach: {mappedAthlete.coach}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{mappedAthlete.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mappedAthlete.stats.totalVideos}</div>
                  <div className="text-xs text-muted-foreground">Vidéos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mappedAthlete.stats.wins}</div>
                  <div className="text-xs text-muted-foreground">Victoires</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mappedAthlete.stats.winRate}%</div>
                  <div className="text-xs text-muted-foreground">Taux Victoire</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mappedAthlete.stats.competitionsEntered}</div>
                  <div className="text-xs text-muted-foreground">Compétitions</div>
                </div>
              </div>
              <div className="text-center pt-2 border-t">
                <div className="text-lg font-semibold">{mappedAthlete.stats.recentForm}</div>
                <div className="text-xs text-muted-foreground">Forme Récente (10 derniers)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="videos">Vidéos ({mappedAthlete.videos.length})</TabsTrigger>
              <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
              <TabsTrigger value="progression">Progression</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Current Evaluation Overview */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Évaluation Actuelle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Note Globale</span>
                        <span className="font-bold text-lg">{mappedAthlete.evaluations.overall / 10}/10</span>
                      </div>
                      <Progress value={mappedAthlete.evaluations.overall * 10} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span>Technique</span>
                        <span className="font-medium">{mappedAthlete.evaluations.technique / 10}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tactique</span>
                        <span className="font-medium">{mappedAthlete.evaluations.tactics / 10}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Posture</span>
                        <span className="font-medium">{mappedAthlete.evaluations.posture / 10}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vitesse</span>
                        <span className="font-medium">{mappedAthlete.evaluations.speed / 10}/10</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Dernière évaluation: {mappedAthlete.evaluations.lastEvaluated} par {mappedAthlete.evaluations.evaluatedBy}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Radar des Compétences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} />
                        <Radar name="Compétences" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performances Récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(mappedAthlete.performanceHistory ?? []).slice(0, 3).map((performance: any, index: any) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors">
                        <div className="flex-1">
                          <div className="font-semibold text-base">{performance.competition}</div>
                          <div className="text-sm text-muted-foreground mt-1">{performance.date}</div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="font-bold text-lg">{performance.result}</div>
                            <div className="text-sm text-muted-foreground">{performance.score}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-primary text-xl">{performance.rating / 10}/10</div>
                            <div className="text-xs text-muted-foreground">Note</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Toutes les Vidéos ({mappedAthlete.videos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(mappedAthlete.videos ?? []).map((video: any) => (
                      <div key={video.id} className="space-y-2">
                        <VideoCard video={video} />
                        {video.evaluation && (
                          <div className="text-xs text-muted-foreground px-2">
                            <strong>Évaluation:</strong> Technique {video.evaluation.technique} • Tactique{" "}
                            {video.evaluation.tactics} • Global {video.evaluation.overall}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluations" className="space-y-6">
              {evaluations.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Aucune évaluation disponible pour cet athlète.</p>
                    <Button asChild className="mt-4">
                      <Link href={`/athletes/${athleteId}/evaluate`}>
                        <Star className="h-4 w-4 mr-2" />
                        Créer une évaluation
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Dernière évaluation - Détails */}
                  {evaluations[0] && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Dernière Évaluation</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(evaluations[0].createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Score global */}
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="text-4xl font-bold text-primary mb-2">
                            {evaluations[0].globalScore.toFixed(1)}%
                          </div>
                          <div className="text-lg font-semibold mb-1">{evaluations[0].scoreLabel}</div>
                          <div className="text-sm text-muted-foreground">
                            Potentiel: {evaluations[0].potential}
                          </div>
                        </div>

                        {/* Domaines d'évaluation */}
                        <div className="space-y-4">
                          <h3 className="font-semibold">Domaines évalués</h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            {[
                              { key: "physique", label: "Qualités physiques spécifiques" },
                              { key: "technique", label: "Qualités techniques spécifiques" },
                              { key: "garde", label: "Posture et position de garde" },
                              { key: "motivation", label: "Aspect motivationnel (détermination)" },
                              { key: "main", label: "Qualités techniques de main" },
                              { key: "mobilite", label: "Mobilité spécifique" },
                              { key: "cognitif", label: "Capacités cognitives en escrime" },
                            ].map(({ key, label }) => {
                              const value = evaluations[0][key as keyof typeof evaluations[0]] as number;
                              const scaleLabels = [
                                "À développer",
                                "En cours de développement",
                                "En voie de maîtrise",
                                "Maîtrise (point fort)",
                              ];
                              return (
                                <div key={key} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{label}</span>
                                    <Badge variant="outline">{value}/4</Badge>
                                  </div>
                                  <Progress value={(value / 4) * 100} className="h-2" />
                                  <p className="text-xs text-muted-foreground">
                                    {scaleLabels[value - 1]}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bilan */}
                        {evaluations[0].bilan && (
                          <div className="space-y-2">
                            <h3 className="font-semibold">Bilan individuel général</h3>
                            <div className="p-4 bg-muted/20 rounded-lg text-sm whitespace-pre-wrap">
                              {evaluations[0].bilan}
                            </div>
                          </div>
                        )}

                        {/* Métadonnées */}
                        <div className="pt-4 border-t space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Évalué par:</span>
                            <span className="font-medium">{evaluations[0].evaluatorName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rôle:</span>
                            <span className="font-medium capitalize">{evaluations[0].evaluatorRole}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Historique des évaluations */}
                  {evaluations.length > 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Historique des Évaluations</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {evaluations.length} évaluation{evaluations.length > 1 ? "s" : ""} au total
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {evaluations.map((evalItem) => (
                            <div
                              key={evalItem.id}
                              className="p-4 bg-muted/20 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium mb-1">
                                    Évaluation du{" "}
                                    {new Date(evalItem.createdAt).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-2">
                                    Potentiel: {evalItem.potential}
                                  </div>
                                  {evalItem.bilan && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                      {evalItem.bilan}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <div className="font-bold text-primary text-xl mb-1">
                                    {evalItem.globalScore.toFixed(1)}%
                                  </div>
                                  <Badge variant="secondary" className="mb-2">
                                    {evalItem.scoreLabel}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground">
                                    {evalItem.evaluatorName}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="progression" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Évolution des Performances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mappedAthlete.progressionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="technique" stroke="#8884d8" name="Technique" />
                      <Line type="monotone" dataKey="physical" stroke="#82ca9d" name="Physique" />
                      <Line type="monotone" dataKey="tactical" stroke="#ffc658" name="Tactique" />
                      <Line type="monotone" dataKey="overall" stroke="#ff7300" name="Global" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Historique Complet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(mappedAthlete.performanceHistory ?? []).map((performance: any, index: any) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
                        <div className="flex-shrink-0">
                          <Trophy
                            className={`h-8 w-8 ${
                              performance.result.includes("1st")
                                ? "text-yellow-600"
                                : performance.result.includes("2nd")
                                  ? "text-gray-600"
                                  : performance.result.includes("3rd")
                                    ? "text-orange-600"
                                    : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{performance.competition}</h4>
                          <p className="text-sm text-muted-foreground">{performance.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{performance.result}</div>
                          <div className="text-sm text-muted-foreground">{performance.score}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary text-lg">{performance.rating}</div>
                          <div className="text-xs text-muted-foreground">Note</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
