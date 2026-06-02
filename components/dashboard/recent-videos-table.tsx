"use client"

import { useEffect, useState } from "react"
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
import { getDemoVideos } from "@/lib/demo-local-store"

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
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([])

  useEffect(() => {
    setRecentVideos(
      getDemoVideos().slice(0, 6).map((video) => ({
        id: video.id,
        competition: video.competition_name || video.title,
        athleteName: video.athlete,
        category: video.category || video.ageCategory || "M13",
        weapon: video.weapon_type === "sabre" ? "Sabre" : video.weapon_type || "Sabre",
        age: video.age || 13,
        club: video.club || "-",
        department: video.department || "-",
        uploadedAt: video.competition_date || new Date().toISOString(),
      })),
    )
  }, [])

  const handleRowClick = (video: RecentVideo) => {
    router.push(video.id.startsWith("local_video_") ? `/videos/watch?id=${encodeURIComponent(video.id)}` : `/videos/${video.id}`)
  }

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
