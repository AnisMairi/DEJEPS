import { Suspense } from "react"
import { Loading } from "@/components/common/loading"
import { WatchContent } from "./watch-content"

export default function VideoWatchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <WatchContent />
    </Suspense>
  )
}
