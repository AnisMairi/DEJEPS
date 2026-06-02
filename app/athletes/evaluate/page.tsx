import { Suspense } from "react"
import { Loading } from "@/components/common/loading"
import { AthleteEvaluateContent } from "./evaluate-content"

export default function AthleteEvaluateStaticPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AthleteEvaluateContent />
    </Suspense>
  )
}
