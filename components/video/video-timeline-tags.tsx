"use client"

import { useEffect, useMemo, useState, type RefObject } from "react"
import { Clock, Plus, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  FENCING_ACTION_TAGS,
  addVideoTimelineTag,
  getVideoTimelineTags,
  type DemoVideoTimelineTag,
  type FencingActionTag,
} from "@/lib/demo-local-store"

export interface VideoTagAthleteOption {
  id: string
  name: string
}

interface VideoTimelineTagsProps {
  videoId: string
  videoRef: RefObject<HTMLVideoElement | null>
  athletes: VideoTagAthleteOption[]
}

const athleteStyles = [
  "border-l-blue-500 bg-blue-50/70 text-blue-900",
  "border-l-emerald-500 bg-emerald-50/70 text-emerald-900",
  "border-l-amber-500 bg-amber-50/70 text-amber-900",
  "border-l-rose-500 bg-rose-50/70 text-rose-900",
  "border-l-violet-500 bg-violet-50/70 text-violet-900",
  "border-l-cyan-500 bg-cyan-50/70 text-cyan-900",
]

const badgeStyles = [
  "bg-blue-100 text-blue-900 border-blue-200",
  "bg-emerald-100 text-emerald-900 border-emerald-200",
  "bg-amber-100 text-amber-900 border-amber-200",
  "bg-rose-100 text-rose-900 border-rose-200",
  "bg-violet-100 text-violet-900 border-violet-200",
  "bg-cyan-100 text-cyan-900 border-cyan-200",
]

function formatTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function getAthleteIndex(athletes: VideoTagAthleteOption[], athleteId: string): number {
  const index = athletes.findIndex((athlete) => athlete.id === athleteId)
  return index >= 0 ? index % athleteStyles.length : 0
}

export function VideoTimelineTags({ videoId, videoRef, athletes }: VideoTimelineTagsProps) {
  const { toast } = useToast()
  const [tags, setTags] = useState<DemoVideoTimelineTag[]>([])
  const [selectedAction, setSelectedAction] = useState<FencingActionTag>(FENCING_ACTION_TAGS[0])
  const [selectedAthleteId, setSelectedAthleteId] = useState("")

  useEffect(() => {
    setTags(getVideoTimelineTags(videoId))
  }, [videoId])

  useEffect(() => {
    if (!selectedAthleteId && athletes.length > 0) {
      setSelectedAthleteId(athletes[0].id)
    }
  }, [athletes, selectedAthleteId])

  const selectedAthlete = useMemo(
    () => athletes.find((athlete) => athlete.id === selectedAthleteId) || null,
    [athletes, selectedAthleteId],
  )

  const handleAddTag = () => {
    if (!selectedAthlete) {
      toast({
        title: "Athlète requis",
        description: "Choisis un athlète avant d'ajouter un tag.",
        variant: "destructive",
      })
      return
    }

    const timestamp = videoRef.current?.currentTime || 0
    const nextTags = addVideoTimelineTag(videoId, {
      timestamp,
      action: selectedAction,
      athleteId: selectedAthlete.id,
      athleteName: selectedAthlete.name,
    })
    setTags(nextTags)
    toast({
      title: "Tag ajouté",
      description: `${selectedAction} à ${formatTimestamp(timestamp)} pour ${selectedAthlete.name}.`,
    })
  }

  const handleSeekToTag = (tag: DemoVideoTimelineTag) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = tag.timestamp
    videoRef.current.play().catch(() => undefined)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags temporels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="timeline-action">Action</Label>
            <Select value={selectedAction} onValueChange={(value) => setSelectedAction(value as FencingActionTag)}>
              <SelectTrigger id="timeline-action">
                <SelectValue placeholder="Choisir une action" />
              </SelectTrigger>
              <SelectContent>
                {FENCING_ACTION_TAGS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="timeline-athlete">Athlète</Label>
            <Select value={selectedAthleteId} onValueChange={setSelectedAthleteId}>
              <SelectTrigger id="timeline-athlete">
                <SelectValue placeholder="Choisir un athlète" />
              </SelectTrigger>
              <SelectContent>
                {athletes.map((athlete) => (
                  <SelectItem key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAddTag} disabled={athletes.length === 0} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Ajouter au temps courant
          </Button>
        </div>

        <div className="space-y-2">
          {athletes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun athlète disponible pour cette vidéo.</p>
          ) : tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun tag posé sur cette vidéo.</p>
          ) : (
            tags.map((tag) => {
              const styleIndex = getAthleteIndex(athletes, tag.athleteId)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleSeekToTag(tag)}
                  className={`w-full rounded-lg border border-l-4 p-3 text-left transition hover:border-primary hover:bg-muted/70 ${athleteStyles[styleIndex]}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`gap-1 ${badgeStyles[styleIndex]}`}>
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(tag.timestamp)}
                    </Badge>
                    <Badge variant="secondary">{tag.action}</Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{tag.athleteName}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <RotateCcw className="h-3 w-3" />
                      Revoir
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
