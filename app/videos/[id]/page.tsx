"use client"
import { useState, use, useEffect, useCallback } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { VideoAnalysisGrid } from "@/components/video/video-analysis-grid"
import { Loading } from "@/components/common/loading"

export default function VideoViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [videoData, setVideoData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to format relative time
  const formatRelativeTime = useCallback((dateString: string): string => {
    if (!dateString) return 'Date inconnue'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'il y a moins d\'une heure'
    if (diffInHours < 24) return `il y a ${diffInHours}h`
    if (diffInHours < 48) return 'il y a 1 jour'
    if (diffInHours < 168) return `il y a ${Math.floor(diffInHours / 24)} jours`
    if (diffInHours < 336) return 'il y a 1 semaine'
    return `il y a ${Math.floor(diffInHours / 168)} semaines`
  }, [])

  // Helper function to format duration from seconds to MM:SS
  const formatDuration = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  // Load video data and comments - Mode démo
  useEffect(() => {
    const loadVideoData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mode démo : utiliser les données de démo
        const { DEMO_VIDEOS } = await import("@/lib/demo-videos")
        const demoVideo = DEMO_VIDEOS.find(v => v.id === id)
        
        if (!demoVideo) {
          setError("Vidéo non trouvée")
          setLoading(false)
          return
        }

        // Transformer les données de démo en format attendu
        const transformedVideo = {
          id: demoVideo.id,
          title: demoVideo.title,
          file_path: "", // Pas de fichier en démo
          thumbnail_path: demoVideo.thumbnail,
          duration: parseDuration(demoVideo.duration),
          view_count: demoVideo.views,
          comment_count: demoVideo.comments,
          athleteRight_name: demoVideo.athlete.includes(" vs ") 
            ? demoVideo.athlete.split(" vs ")[0]
            : demoVideo.athlete,
          athleteLeft_name: demoVideo.athlete.includes(" vs ")
            ? demoVideo.athlete.split(" vs ")[1]
            : null,
          athleteRight_id: null,
          athleteLeft_id: null,
          weapon_type: demoVideo.weapon_type,
          competition_name: demoVideo.competition_name,
          competition_date: demoVideo.competition_date,
          uploader_name: demoVideo.uploader,
          uploader_id: 1,
          created_at: new Date().toISOString(),
        }
        
        setVideoData(transformedVideo)

      } catch (err) {
        console.error('Error loading video data:', err)
        setError("Erreur lors du chargement de la vidéo")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadVideoData()
    }
  }, [id])

  // Helper to parse duration string "MM:SS" to seconds
  const parseDuration = (duration: string): number => {
    const [minutes, seconds] = duration.split(':').map(Number)
    return minutes * 60 + seconds
  }

  // Transform video data for the player
  const getVideoMetadata = useCallback(() => {
    if (!videoData) return null

    return {
      id: videoData.id.toString(),
      title: videoData.title || "Sans titre",
      athleteRight: {
        id: videoData.athleteRight_id?.toString() || null,
        firstName: videoData.athleteRight_name?.split(' ')[0] || "Athlète",
        lastName: videoData.athleteRight_name?.split(' ').slice(1).join(' ') || "Droit",
        age: 16,
        gender: "masculin",
        weapon: videoData.weapon_type || "épée",
        club: "Club d'escrime",
        coach: "Coach",
        ranking: "#1",
      },
      athleteLeft: {
        id: videoData.athleteLeft_id?.toString() || null,
        firstName: videoData.athleteLeft_name?.split(' ')[0] || "Athlète",
        lastName: videoData.athleteLeft_name?.split(' ').slice(1).join(' ') || "Gauche",
        age: 17,
        gender: "masculin",
        weapon: videoData.weapon_type || "épée",
        club: "Club d'escrime",
        coach: "Coach",
        ranking: "#2",
      },
      competitionType: videoData.competition_name || "Compétition",
      uploadedAt: formatRelativeTime(videoData.created_at),
      duration: videoData.duration ? formatDuration(videoData.duration) : "00:00",
      views: videoData.view_count || 0,
      uploader: {
        name: videoData.uploader_name || `Utilisateur #${videoData.uploader_id}` || "Utilisateur inconnu",
        role: "Contact Local",
      },
    }
  }, [videoData, formatRelativeTime, formatDuration])

  const handleSaveAnalysis = useCallback((data: any) => {
    // En mode démo, sauvegarder dans localStorage
    const storageKey = `video_analysis_${id}`
    localStorage.setItem(storageKey, JSON.stringify(data))
    console.log("Analysis saved:", data)
  }, [id])

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

  if (error || !videoData) {
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

  const videoMetadata = getVideoMetadata()
  if (!videoMetadata) return null

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="transition-all duration-500 ease-out">
            {/* Message de démo à la place de la vidéo */}
            <div className="bg-muted/50 border border-border rounded-lg p-8 text-center space-y-4">
              <div className="text-4xl mb-4">🎬</div>
              <h2 className="text-2xl font-bold">Fonctionnalité désactivée pour cette démo</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cette fonctionnalité a été désactivée pour cette démo. En production, vous pourriez visionner la vidéo complète de <strong>{videoMetadata?.title || "cette vidéo"}</strong> ici.
              </p>
              {videoMetadata && (
                <div className="pt-4">
                  <div className="inline-block bg-card border border-border rounded-lg p-4 text-left">
                    <p className="text-sm font-medium mb-2">Informations de la vidéo :</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Titre : {videoMetadata.title}</li>
                      <li>• Athlète : {videoMetadata.athleteRight.firstName} {videoMetadata.athleteRight.lastName}</li>
                      <li>• Compétition : {videoMetadata.competitionType}</li>
                      <li>• Durée : {videoMetadata.duration}</li>
                      <li>• Vues : {videoMetadata.views.toLocaleString()}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <VideoAnalysisGrid videoId={id} onSave={handleSaveAnalysis} />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
