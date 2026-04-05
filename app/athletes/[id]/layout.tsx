import type { ReactNode } from "react"
import { DEMO_ATHLETES } from "@/lib/demo-athletes"

export function generateStaticParams() {
  return DEMO_ATHLETES.map((a) => ({ id: a.id }))
}

export default function AthleteIdLayout({ children }: { children: ReactNode }) {
  return children
}
