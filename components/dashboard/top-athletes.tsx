"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"
import { Trophy, MapPin } from "lucide-react"

interface TopAthlete {
  id: string
  firstName: string
  lastName: string
  gender: "male" | "female"
  age: number
  weapon: string
  club: string
  ranking: string
  avatar?: string
  skills: {
    posture: number
    speed: number
    positioning: number
    technique: number
    tactics: number
  }
}

const topAthletes: TopAthlete[] = [
  {
    id: "top-male",
    firstName: "Alexandre",
    lastName: "Dupont",
    gender: "male",
    age: 17,
    weapon: "Épée",
    club: "SCUF",
    ranking: "#3 U20",
    avatar: "https://placehold.co/200x200?text=AD",
    skills: {
      posture: 9,
      speed: 8,
      positioning: 9,
      technique: 9,
      tactics: 8,
    },
  },
  {
    id: "top-female",
    firstName: "Camille",
    lastName: "Martin",
    gender: "female",
    age: 16,
    weapon: "Fleuret",
    club: "SCUF",
    ranking: "#2 U17",
    avatar: "https://placehold.co/200x200?text=CM",
    skills: {
      posture: 8,
      speed: 9,
      positioning: 8,
      technique: 9,
      tactics: 9,
    },
  },
]

export function TopAthletes() {
  const maleAthlete = topAthletes.find(a => a.gender === "male")
  const femaleAthlete = topAthletes.find(a => a.gender === "female")

  const getRadarData = (athlete: TopAthlete) => [
    { subject: "Posture", A: athlete.skills.posture, fullMark: 10 },
    { subject: "Vitesse", A: athlete.skills.speed, fullMark: 10 },
    { subject: "Positionnement", A: athlete.skills.positioning, fullMark: 10 },
    { subject: "Technique", A: athlete.skills.technique, fullMark: 10 },
    { subject: "Tactique", A: athlete.skills.tactics, fullMark: 10 },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top Athlète Masculin */}
      {maleAthlete && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Athlète Masculin
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Homme
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={maleAthlete.avatar} />
                <AvatarFallback className="text-lg">
                  {maleAthlete.firstName[0]}{maleAthlete.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold">
                  {maleAthlete.firstName} {maleAthlete.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{maleAthlete.club}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{maleAthlete.weapon}</Badge>
                  <Badge variant="secondary">{maleAthlete.ranking}</Badge>
                  <span className="text-sm text-muted-foreground">{maleAthlete.age} ans</span>
                </div>
              </div>
            </div>

            {/* Radar de compétence */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-3">Radar de Compétences</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={getRadarData(maleAthlete)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} />
                  <Radar
                    name="Compétences"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Athlète Féminin */}
      {femaleAthlete && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Athlète Féminin
              </CardTitle>
              <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                Femme
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={femaleAthlete.avatar} />
                <AvatarFallback className="text-lg">
                  {femaleAthlete.firstName[0]}{femaleAthlete.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold">
                  {femaleAthlete.firstName} {femaleAthlete.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{femaleAthlete.club}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{femaleAthlete.weapon}</Badge>
                  <Badge variant="secondary">{femaleAthlete.ranking}</Badge>
                  <span className="text-sm text-muted-foreground">{femaleAthlete.age} ans</span>
                </div>
              </div>
            </div>

            {/* Radar de compétence */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-3">Radar de Compétences</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={getRadarData(femaleAthlete)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} />
                  <Radar
                    name="Compétences"
                    dataKey="A"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

