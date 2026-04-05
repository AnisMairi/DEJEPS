import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { StreamlinedVideoUpload } from "@/components/video/streamlined-video-upload"

export default function VideoUploadPage() {
  return (
    <ProtectedRoute allowedRoles={["local_contact","coach", "administrator"]}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Télécharger une Vidéo</h1>
            <p className="text-muted-foreground">
              Téléchargez une vidéo d'escrime avec les informations complètes de l'athlète
            </p>
          </div>

          <StreamlinedVideoUpload />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
