"use client"

import { useSearchParams } from "next/navigation"
import { VideoViewPageContent } from "@/components/video/video-view-page"

export function WatchContent() {
  const id = useSearchParams().get("id") || ""
  return <VideoViewPageContent id={id} />
}
