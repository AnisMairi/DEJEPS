"use client"

import { DEMO_ATHLETES, type DemoAthlete } from "@/lib/demo-athletes"
import { DEMO_VIDEOS, type DemoVideo } from "@/lib/demo-videos"
import { fencingCategoryFromDob } from "@/lib/fencing-age-category"

const ATHLETES_KEY = "sabre_demo_local_athletes_v1"
const VIDEOS_KEY = "sabre_demo_local_videos_v1"
const COMMENTS_KEY = "sabre_demo_video_comments_v1"
const ANALYSES_KEY = "sabre_demo_video_analyses_v1"
const VIDEO_TAGS_KEY = "sabre_demo_video_timeline_tags_v1"

export type ArmedHand = "Droitier" | "Gaucher"

export interface LocalDemoAthlete extends DemoAthlete {
  committee?: string
  armed_hand?: ArmedHand
}

export interface LocalDemoVideo extends DemoVideo {
  sourceUrl?: string
  description?: string
  athleteRight_id?: string | null
  athleteLeft_id?: string | null
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeList<T>(key: string, list: T[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(list))
}

export function getDemoAthletes(): LocalDemoAthlete[] {
  return [...DEMO_ATHLETES, ...readList<LocalDemoAthlete>(ATHLETES_KEY)]
}

export function getDemoAthleteById(id: string): LocalDemoAthlete | undefined {
  return getDemoAthletes().find((athlete) => athlete.id === id)
}

export function saveLocalDemoAthlete(input: {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: "male" | "female"
  weapon?: "foil" | "sabre" | "epee" | "épée"
  skill_level?: "beginner" | "intermediate" | "advanced" | "elite"
  club?: string
  coach?: string
  region?: string
  committee?: string
  armed_hand?: ArmedHand
  avatar_url?: string
}): LocalDemoAthlete {
  const localAthletes = readList<LocalDemoAthlete>(ATHLETES_KEY)
  const athlete: LocalDemoAthlete = {
    id: `local_${Date.now()}`,
    first_name: input.first_name,
    last_name: input.last_name,
    date_of_birth: input.date_of_birth,
    gender: input.gender,
    weapon: input.weapon || "sabre",
    age_category: fencingCategoryFromDob(input.date_of_birth) || "M13",
    skill_level: input.skill_level || "intermediate",
    avatar_url:
      input.avatar_url ||
      `https://placehold.co/200x200?text=${encodeURIComponent(
        `${input.first_name[0] || ""}${input.last_name[0] || ""}`.toUpperCase() || "ST",
      )}`,
    videos_count: 0,
    region: input.region || input.committee || "",
    club: input.club || "",
    coach: input.coach || "",
    ranking: "-",
    recent_activity: "Ajout manuel demo",
    committee: input.committee,
    armed_hand: input.armed_hand,
  }
  writeList(ATHLETES_KEY, [...localAthletes, athlete])
  return athlete
}

export function getDemoVideos(): LocalDemoVideo[] {
  return [...readList<LocalDemoVideo>(VIDEOS_KEY), ...DEMO_VIDEOS]
}

export function getDemoVideoById(id: string): LocalDemoVideo | undefined {
  return getDemoVideos().find((video) => video.id === id)
}

export function saveLocalDemoVideo(video: LocalDemoVideo): LocalDemoVideo {
  const localVideos = readList<LocalDemoVideo>(VIDEOS_KEY)
  writeList(VIDEOS_KEY, [video, ...localVideos])
  return video
}

export interface DemoVideoComment {
  id: string
  text: string
  createdAt: string
}

function readCommentsMap(): Record<string, DemoVideoComment[]> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(COMMENTS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function getVideoComments(videoId: string): DemoVideoComment[] {
  return readCommentsMap()[videoId] || []
}

export function addVideoComment(videoId: string, text: string): DemoVideoComment[] {
  const trimmed = text.trim()
  if (!trimmed) return getVideoComments(videoId)
  const comments = readCommentsMap()
  const next = [
    {
      id: `comment_${Date.now()}`,
      text: trimmed,
      createdAt: new Date().toISOString(),
    },
    ...(comments[videoId] || []),
  ]
  comments[videoId] = next
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
  return next
}

export interface DemoVideoAnalysisRecord<T = any> {
  data: T
  savedAt: string
}

function readAnalysisMap(): Record<string, DemoVideoAnalysisRecord> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(ANALYSES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function getVideoAnalysis<T = any>(videoId: string): DemoVideoAnalysisRecord<T> | null {
  const fromMap = readAnalysisMap()[videoId] as DemoVideoAnalysisRecord<T> | undefined
  if (fromMap) return fromMap

  try {
    const legacy = localStorage.getItem(`video_analysis_${videoId}`)
    if (!legacy) return null
    return {
      data: JSON.parse(legacy) as T,
      savedAt: new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function saveVideoAnalysis<T = any>(videoId: string, data: T): DemoVideoAnalysisRecord<T> {
  const analyses = readAnalysisMap()
  const record = {
    data,
    savedAt: new Date().toISOString(),
  }
  analyses[videoId] = record
  localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses))
  localStorage.setItem(`video_analysis_${videoId}`, JSON.stringify(data))
  return record
}

export const FENCING_ACTION_TAGS = [
  "Parade-riposte",
  "Attaque courte",
  "Attaque longue",
  "Attaque sur la préparation",
  "Esquive",
  "Contre-attaque",
] as const

export type FencingActionTag = (typeof FENCING_ACTION_TAGS)[number]

export interface DemoVideoTimelineTag {
  id: string
  videoId: string
  timestamp: number
  action: FencingActionTag
  athleteId: string
  athleteName: string
  createdAt: string
}

function readVideoTagsMap(): Record<string, DemoVideoTimelineTag[]> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(VIDEO_TAGS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function sortVideoTags(tags: DemoVideoTimelineTag[]): DemoVideoTimelineTag[] {
  return [...tags].sort((a, b) => a.timestamp - b.timestamp || a.createdAt.localeCompare(b.createdAt))
}

export function getVideoTimelineTags(videoId: string): DemoVideoTimelineTag[] {
  return sortVideoTags(readVideoTagsMap()[videoId] || [])
}

export function addVideoTimelineTag(
  videoId: string,
  input: {
    timestamp: number
    action: FencingActionTag
    athleteId: string
    athleteName: string
  },
): DemoVideoTimelineTag[] {
  const tagsMap = readVideoTagsMap()
  const tag: DemoVideoTimelineTag = {
    id: `tag_${Date.now()}`,
    videoId,
    timestamp: Math.max(0, Number.isFinite(input.timestamp) ? input.timestamp : 0),
    action: input.action,
    athleteId: input.athleteId,
    athleteName: input.athleteName,
    createdAt: new Date().toISOString(),
  }
  tagsMap[videoId] = sortVideoTags([...(tagsMap[videoId] || []), tag])
  localStorage.setItem(VIDEO_TAGS_KEY, JSON.stringify(tagsMap))
  return tagsMap[videoId]
}
