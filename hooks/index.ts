// Base API hook
export { useApi } from "./use-api"

// Authentication API
export { useAuthApi } from "./use-auth-api"
export type { UserCreate, UserLogin, Token } from "./use-auth-api"

// User management API
export { useUserApi } from "./use-user-api"
export type {
  User,
  UserUpdate,
  PasswordUpdate,
  EmailUpdate,
  AdminPasswordUpdate,
  AdminEmailUpdate,
  UserFilters,
} from "./use-user-api"

// Athlete management API
export { useAthleteApi } from "./use-athlete-api"
export type {
  Athlete,
  AthleteList,
  AthleteCreate,
  AthleteUpdate,
  Tutor,
  TutorCreate,
  TutorUpdate,
  AthleteFilters,
} from "./use-athlete-api"

// Video management API
export { useVideoApi } from "./use-video-api"
export type {
  Video,
  VideoList,
  VideoUploadResponse,
  VideoUpdate,
  VideoFilters,
  VideoUploadData,
} from "./use-video-api"

// Comment management API
export { useCommentApi } from "./use-comment-api"
export type {
  Comment,
  CommentList,
  CommentCreate,
  CommentUpdate,
  CommentFilters,
  AdminCommentFilters,
} from "./use-comment-api"

// Evaluation management API
export { useEvaluationApi } from "./use-evaluation-api"
export type {
  Evaluation,
  EvaluationList,
  EvaluationCreate,
  EvaluationUpdate,
  EvaluationFilters,
  AdminEvaluationFilters,
} from "./use-evaluation-api"

// Legacy exports for backward compatibility
export { useUserApi as useUserApiLegacy } from "./use-user-api"
export { useVideoApi as useVideoApiLegacy } from "./use-video-api" 