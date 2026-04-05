"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RecentVideo {
  id: string
  competition: string
  athleteName: string
  category: string
  weapon: string
  age: number
  club: string
  department: string
  uploadedAt: string
}

export function RecentVideosTable() {
  const router = useRouter()

  const handleRowClick = (video: RecentVideo) => {
    router.push(`/videos/${video.id}`)
  }

  // Données de démo pour les vidéos récentes
  const recentVideos: RecentVideo[] = [
    {
      id: "1",
      competition: "Championnat de France U15",
      athleteName: "Lucas Martin",
      category: "U15",
      weapon: "Épée",
      age: 14,
      club: "Cercle d'Escrime de Paris",
      department: "75",
      uploadedAt: "2025-01-15",
    },
    {
      id: "2",
      competition: "Tournoi Régional Île-de-France",
      athleteName: "Emma Dubois",
      category: "U17",
      weapon: "Fleuret",
      age: 16,
      club: "AS Escrime Lyon",
      department: "69",
      uploadedAt: "2025-01-14",
    },
    {
      id: "3",
      competition: "Coupe de France Cadets",
      athleteName: "Thomas Bernard",
      category: "U20",
      weapon: "Sabre",
      age: 18,
      club: "Cercle d'Escrime Marseille",
      department: "13",
      uploadedAt: "2025-01-13",
    },
    {
      id: "4",
      competition: "Championnat Régional PACA",
      athleteName: "Sophie Laurent",
      category: "U15",
      weapon: "Épée",
      age: 14,
      club: "Club Escrime Nice",
      department: "06",
      uploadedAt: "2025-01-12",
    },
    {
      id: "5",
      competition: "Tournoi National U17",
      athleteName: "Hugo Moreau",
      category: "U17",
      weapon: "Fleuret",
      age: 16,
      club: "Cercle d'Escrime Bordeaux",
      department: "33",
      uploadedAt: "2025-01-11",
    },
    {
      id: "6",
      competition: "Championnat de France U20",
      athleteName: "Léa Petit",
      category: "U20",
      weapon: "Sabre",
      age: 19,
      club: "AS Escrime Toulouse",
      department: "31",
      uploadedAt: "2025-01-10",
    },
  ]

  const getDepartmentName = (code: string) => {
    const departments: Record<string, string> = {
      "75": "Paris",
      "69": "Rhône",
      "13": "Bouches-du-Rhône",
      "06": "Alpes-Maritimes",
      "33": "Gironde",
      "31": "Haute-Garonne",
    }
    return departments[code] || code
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vidéos les plus récentes</CardTitle>
        <CardDescription>Dernières vidéos uploadées sur la plateforme</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Compétition</TableHead>
              <TableHead>Athlète</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Arme</TableHead>
              <TableHead>Âge</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentVideos.map((video) => (
              <TableRow 
                key={video.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRowClick(video)}
              >
                <TableCell className="font-medium">{video.competition}</TableCell>
                <TableCell>{video.athleteName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{video.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{video.weapon}</Badge>
                </TableCell>
                <TableCell>{video.age} ans</TableCell>
                <TableCell className="max-w-[200px] truncate">{video.club}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getDepartmentName(video.department)} ({video.department})</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(video.uploadedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

