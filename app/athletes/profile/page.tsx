import { Suspense } from "react"
import { Loading } from "@/components/common/loading"
import { AthleteProfileContent } from "./profile-content"

export default function AthleteProfileStaticPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AthleteProfileContent />
    </Suspense>
  )
}
