"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Users, Shield } from "lucide-react"
import Link from "next/link"

export function RoleBasedContent() {
  const { user } = useAuth()

  const getContentByRole = () => {
    switch (user?.role) {
      case "local_contact":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Envoyer des vidéos
                </CardTitle>
                <CardDescription>Partagez les performances de vos jeunes escrimeurs pour évaluation</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/videos/upload">Envoyer une vidéo</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vidéos récentes</CardTitle>
                <CardDescription>Vos dernières contributions à la détection de talents</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">8 vidéos envoyées cette semaine</p>
                <p className="text-xs text-muted-foreground mt-1">3 en attente d'évaluation</p>
              </CardContent>
            </Card>
          </div>
        )

      case "coach":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestion des talents
                </CardTitle>
                <CardDescription>Suivez et évaluez vos jeunes escrimeurs prometteurs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/athletes">Voir les talents</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évaluations en attente</CardTitle>
                <CardDescription>Vidéos nécessitant votre expertise technique</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">18 vidéos en attente d'évaluation</p>
                <p className="text-xs text-muted-foreground mt-1">Priorité haute : 5 talents prometteurs</p>
              </CardContent>
            </Card>
          </div>
        )

      case "administrator":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Administration
                </CardTitle>
                <CardDescription>Gérez les utilisateurs et les paramètres de la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin">Panneau d'administration</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analyses de la plateforme</CardTitle>
                <CardDescription>Consultez les statistiques détaillées</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/analytics">Voir les analyses</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Actions rapides</h2>
      {getContentByRole()}
    </div>
  )
}
