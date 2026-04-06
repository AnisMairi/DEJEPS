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
      competition: "Open Nouvelle-Aquitaine M13 sabre",
      athleteName: "Théo Renaud",
      category: "M13",
      weapon: "Sabre",
      age: 13,
      club: "Cercle d'Escrime de Bordeaux",
      department: "33",
      uploadedAt: "2026-01-13",
    },
    {
      id: "2",
      competition: "SCUF Paris — demi-finale M13",
      athleteName: "Inès Benali",
      category: "M13",
      weapon: "Sabre",
      age: 14,
      club: "SCUF Paris",
      department: "75",
      uploadedAt: "2026-01-12",
    },
    {
      id: "3",
      competition: "Coupe cadets sabre",
      athleteName: "Nathan Lefèvre",
      category: "M15",
      weapon: "Sabre",
      age: 15,
      club: "AS Escrime Toulouse",
      department: "31",
      uploadedAt: "2026-01-11",
    },
    {
      id: "4",
      competition: "Championnat PACA M15",
      athleteName: "Chloé Marchand",
      category: "M15",
      weapon: "Sabre",
      age: 15,
      club: "Cercle d'Escrime Aix-en-Provence",
      department: "13",
      uploadedAt: "2026-01-10",
    },
    {
      id: "5",
      competition: "Tournoi Grand Est M13",
      athleteName: "Louis Giraud",
      category: "M13",
      weapon: "Sabre",
      age: 13,
      club: "Cercle d'Escrime Strasbourg",
      department: "67",
      uploadedAt: "2026-01-09",
    },
    {
      id: "6",
      competition: "Finale M15 sabre Lyon",
      athleteName: "Sarah Okonkwo",
      category: "M15",
      weapon: "Sabre",
      age: 16,
      club: "AS Escrime Lyon",
      department: "69",
      uploadedAt: "2026-01-08",
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
      "67": "Bas-Rhin",
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

