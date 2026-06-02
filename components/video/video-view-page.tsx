"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { VideoAnalysisGrid } from "@/components/video/video-analysis-grid"
import { VideoTimelineTags, type VideoTagAthleteOption } from "@/components/video/video-timeline-tags"
import { Loading } from "@/components/common/loading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  addVideoComment,
  getDemoAthletes,
  getDemoVideoById,
  getVideoAnalysis,
  getVideoComments,
  saveVideoAnalysis,
  type DemoVideoAnalysisRecord,
  type DemoVideoComment,
} from "@/lib/demo-local-store"

export function VideoViewPageContent({ id }: { id: string }) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoData, setVideoData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState<DemoVideoComment[]>([])
  const [commentText, setCommentText] = useState("")
  const [savedAnalysis, setSavedAnalysis] = useState<DemoVideoAnalysisRecord | null>(null)

  const formatRelativeTime = useCallback((dateString: string): string => {
    if (!dateString) return "Date inconnue"
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return "il y a moins d'une heure"
    if (diffInHours < 24) return `il y a ${diffInHours}h`
    if (diffInHours < 48) return "il y a 1 jour"
    if (diffInHours < 168) return `il y a ${Math.floor(diffInHours / 24)} jours`
    if (diffInHours < 336) return "il y a 1 semaine"
    return `il y a ${Math.floor(diffInHours / 168)} semaines`
  }, [])

  const formatDuration = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    const loadVideoData = async () => {
      try {
        setLoading(true)
        setError(null)

        const demoVideo = getDemoVideoById(id)
        if (!demoVideo) {
          setError("Vidéo non trouvée")
          setLoading(false)
          return
        }

        const [minutes = 0, seconds = 0] = demoVideo.duration.split(":").map(Number)
        setVideoData({
          id: demoVideo.id,
          title: demoVideo.title,
          file_path: demoVideo.sourceUrl || "",
          duration: minutes * 60 + seconds,
          view_count: demoVideo.views,
          comment_count: demoVideo.comments,
          athleteRight_name: demoVideo.athlete.includes(" vs ") ? demoVideo.athlete.split(" vs ")[0] : demoVideo.athlete,
          athleteLeft_name: demoVideo.athlete.includes(" vs ") ? demoVideo.athlete.split(" vs ")[1] : null,
          athleteRight_id: demoVideo.athleteRight_id || null,
          athleteLeft_id: demoVideo.athleteLeft_id || null,
          weapon_type: demoVideo.weapon_type,
          competition_name: demoVideo.competition_name,
          uploader_name: demoVideo.uploader,
          uploader_id: 1,
          created_at: new Date().toISOString(),
        })
        setComments(getVideoComments(id))
        setSavedAnalysis(getVideoAnalysis(id))
      } catch (err) {
        console.error("Error loading video data:", err)
        setError("Erreur lors du chargement de la vidéo")
      } finally {
        setLoading(false)
      }
    }

    if (id) loadVideoData()
  }, [id])

  const videoMetadata = videoData
    ? {
        title: videoData.title || "Sans titre",
        athleteRight: {
          firstName: videoData.athleteRight_name?.split(" ")[0] || "Athlète",
          lastName: videoData.athleteRight_name?.split(" ").slice(1).join(" ") || "",
        },
        competitionType: videoData.competition_name || "Compétition",
        uploadedAt: formatRelativeTime(videoData.created_at),
        duration: videoData.duration ? formatDuration(videoData.duration) : "00:00",
        views: videoData.view_count || 0,
      }
    : null

  const tagAthletes = useMemo<VideoTagAthleteOption[]>(() => {
    if (!videoData) return []

    const athletesById = new Map<string, VideoTagAthleteOption>()
    const addAthlete = (athleteId: string | null | undefined, athleteName: string | null | undefined) => {
      const cleanName = athleteName?.trim()
      if (!cleanName) return
      const cleanId = athleteId || cleanName
      if (!athletesById.has(cleanId)) {
        athletesById.set(cleanId, {
          id: cleanId,
          name: cleanName,
        })
      }
    }

    addAthlete(videoData.athleteRight_id, videoData.athleteRight_name)
    addAthlete(videoData.athleteLeft_id, videoData.athleteLeft_name)

    if (athletesById.size === 0) {
      getDemoAthletes().forEach((athlete) => {
        addAthlete(athlete.id, `${athlete.first_name} ${athlete.last_name}`)
      })
    }

    return Array.from(athletesById.values())
  }, [videoData])

  const handleSaveAnalysis = useCallback(
    (data: any) => {
      setSavedAnalysis(saveVideoAnalysis(id, data))
    },
    [id],
  )

  const handleAddComment = () => {
    const nextComments = addVideoComment(id, commentText)
    setComments(nextComments)
    setCommentText("")
    toast({
      title: "Commentaire ajouté",
      description: "Le commentaire a été ajouté à cette vidéo.",
    })
  }

  const analysisData = savedAnalysis?.data
  const ratedValues = analysisData
    ? [
        analysisData.attitude,
        analysisData.equilibre,
        analysisData.deplacement,
        analysisData.fente,
        analysisData.brasArme,
        analysisData.enchainements,
        analysisData.precision,
        analysisData.initiative,
        analysisData.variation,
        analysisData.distance,
        analysisData.adaptation,
      ].filter((value): value is number => typeof value === "number")
    : []
  const averageScore = ratedValues.length
    ? (ratedValues.reduce((sum, value) => sum + value, 0) / ratedValues.length).toFixed(1)
    : null

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center py-12">
            <Loading />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (error || !videoData || !videoMetadata) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error || "Vidéo non trouvée"}
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Card>
              <CardHeader>
                <CardTitle>{videoMetadata.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {videoData.file_path ? (
                  <video
                    ref={videoRef}
                    src={videoData.file_path}
                    controls
                    className="w-full max-h-[70vh] rounded-lg bg-black"
                  />
                ) : (
                  <div className="bg-muted/50 border border-border rounded-lg p-8 text-center space-y-4">
                    <h2 className="text-2xl font-bold">Vidéo mock</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Cette entrée conserve les mock data existantes. Les fichiers téléversés apparaissent ici dans un lecteur HTML5.
                    </p>
                  </div>
                )}
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>Athlète : {videoMetadata.athleteRight.firstName} {videoMetadata.athleteRight.lastName}</div>
                  <div>Compétition : {videoMetadata.competitionType}</div>
                  <div>Durée : {videoMetadata.duration}</div>
                  <div>Vues : {videoMetadata.views.toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <VideoTimelineTags videoId={id} videoRef={videoRef} athletes={tagAthletes} />

              <Card>
              <CardHeader>
                <CardTitle>Commentaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Ajouter un commentaire sur la vidéo..."
                  rows={4}
                />
                <Button onClick={handleAddComment} disabled={!commentText.trim()} className="w-full">
                  Ajouter le commentaire
                </Button>
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun commentaire pour cette vidéo.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="rounded-lg border p-3 text-sm">
                        <p className="whitespace-pre-wrap">{comment.text}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              </Card>
            </div>
          </div>

          {analysisData && (
            <Card>
              <CardHeader>
                <CardTitle>Analyse enregistrée</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm text-muted-foreground">Catégorie</div>
                  <div className="font-medium">{analysisData.category || "Non renseignée"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Contexte</div>
                  <div className="font-medium">{analysisData.context || "Non renseigné"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Moyenne grille</div>
                  <div className="font-medium">{averageScore ? `${averageScore} / 5` : "Non notée"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Enregistré</div>
                  <div className="font-medium">{new Date(savedAnalysis.savedAt).toLocaleString("fr-FR")}</div>
                </div>
                {(analysisData.profil?.length > 0 || analysisData.comportement?.length > 0 || analysisData.remarques) && (
                  <div className="md:col-span-4 grid gap-3 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Comportement observé</div>
                      <div className="font-medium">{analysisData.comportement?.join(", ") || "Non renseigné"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Profil</div>
                      <div className="font-medium">{analysisData.profil?.join(", ") || "Non renseigné"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Remarques</div>
                      <div className="font-medium whitespace-pre-wrap">{analysisData.remarques || "Non renseignées"}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <VideoAnalysisGrid videoId={id} onSave={handleSaveAnalysis} />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
