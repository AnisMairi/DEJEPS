import type { ReactNode } from "react"
import { DEMO_VIDEOS } from "@/lib/demo-videos"

export function generateStaticParams() {
  return DEMO_VIDEOS.map((v) => ({ id: v.id }))
}

export default function VideoIdLayout({ children }: { children: ReactNode }) {
  return children
}
