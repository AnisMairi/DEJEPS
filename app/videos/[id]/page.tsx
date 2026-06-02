"use client"

import { use } from "react"
import { VideoViewPageContent } from "@/components/video/video-view-page"

export default function VideoViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <VideoViewPageContent id={id} />
}
