"use client"

import Link from "next/link"
import { Play, MessageSquare, Eye, Clock, User, Users, Sword } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { ReactNode } from "react"

interface VideoCardProps {
  video: {
    id: string
    title: string
    thumbnail: string
    duration: string
    views: number
    comments: number
    athlete: string
    uploader: string
    uploadedAt: string
    uploaderAvatarUrl?: string // optional, fallback to placeholder
    weapon_type?: string // Added weapon_type
  }
}

function isDuel(athlete: string) {
  // If the athlete string contains 'vs', we assume it's a duel
  return /\s+vs\s+/i.test(athlete)
}

// Add a helper to get weapon icon and label
const weaponIcons: Record<string, ReactNode> = {
  foil: <Sword className="h-4 w-4 text-blue-500" />,
  sabre: <Sword className="h-4 w-4 text-yellow-500" />,
  epee: <Sword className="h-4 w-4 text-gray-500" />,
}
const weaponLabels: Record<string, string> = {
  foil: "Fleuret",
  sabre: "Sabre",
  epee: "Épée",
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border shadow-lg bg-card text-card-foreground">
        {/* Thumbnail Container */}
        <div className="relative aspect-video bg-card overflow-hidden">
          <img
            src={video.thumbnail || "https://placehold.co/400x225?text=Video"}
            alt={video.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Duration badge */}
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium backdrop-blur-sm">
            <Clock className="h-3 w-3 inline mr-1" />
            {video.duration}
          </div>
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
        </div>

        {/* Card content */}
        <CardContent className="p-5 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-foreground transition-colors duration-200">
              {video.title}
            </h3>
            
            {/* Athlete and uploader info */}
            <div className="space-y-1 pl-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={video.uploaderAvatarUrl || undefined} alt={video.uploader} />
                  <AvatarFallback>{video.uploader?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{video.uploader}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isDuel(video.athlete) ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="font-medium">{video.athlete}</span>
              </div>
              
              {video.weapon_type && weaponLabels[video.weapon_type] && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {weaponIcons[video.weapon_type]}
                  <span>{weaponLabels[video.weapon_type]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats and metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{video.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">{video.comments}</span>
              </div>
            </div>
            {/* Upload time */}
            <span className={`text-xs bg-secondary px-2 py-1 rounded-full ${video.uploadedAt === "il y a moins d'une heure" ? 'text-white' : 'text-muted-foreground'}`}>
              {video.uploadedAt}
            </span>
          </div>

          {/* Watch button */}
          <Button 
            asChild
            className="w-full"
            variant="default"
          >
            <Link href={`/videos/${video.id}`}>
              <Play className="h-4 w-4 mr-2" />
              Watch Video
            </Link>
          </Button>
        </CardContent>
    </Card>
  )
}
