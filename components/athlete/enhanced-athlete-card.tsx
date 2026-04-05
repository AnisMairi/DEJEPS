import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Sword, MapPin, Video, Clock } from "lucide-react"
import Link from "next/link"

interface EnhancedAthleteCardProps {
  athlete: {
    id: string
    firstName: string
    lastName: string
    age: number
    gender: string
    weapon: string
    skillLevel: string
    avatar: string
    videosCount: number
    region: string
    club: string
    coach: string
    ranking: string
    recentActivity: string
  }
}

export function EnhancedAthleteCard({ athlete }: EnhancedAthleteCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:shadow-xl bg-card text-card-foreground">
      {/* Avatar Container */}
      <div className="relative p-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={athlete.avatar || "https://placehold.co/80x80?text=Athlete"}
              alt={`${athlete.firstName} ${athlete.lastName}`}
              className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate group-hover:text-blue-600 transition-colors duration-200">
              {athlete.firstName} {athlete.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{athlete.club}</p>

          </div>
        </div>
      </div>

      {/* Card content */}
      <CardContent className="p-5 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{athlete.age} years</span>
          </div>
          <div className="flex items-center gap-2">
            <Sword className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize font-medium">{athlete.weapon}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate font-medium">{athlete.region}</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{athlete.videosCount} videos</span>
          </div>
        </div>


        {/* View Profile button */}
        <Button 
          asChild 
          className="w-full"
          variant="default"
        >
          <Link href={`/athletes/${athlete.id}`}>
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
