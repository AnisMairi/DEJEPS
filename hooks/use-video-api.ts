import { useApi } from "./use-api"

// Types based on OpenAPI schema
export interface Video {
  id: number
  title: string
  description?: string
  weapon_type?: "epee" | "foil" | "sabre"
  competition_name?: string
  competition_date?: string
  score?: string
  is_public: boolean
  file_path: string
  thumbnail_path?: string
  duration?: number
  file_size?: number
  status: "pending" | "published" | "flagged" | "removed"
  view_count: number
  like_count: number
  created_at: string
  updated_at?: string
  uploader_id: number
  athleteRight_id?: number
  athleteLeft_id?: number
  uploader_name?: string
  athleteRight_name?: string
  athleteLeft_name?: string
  comment_count?: number
}

export interface VideoList {
  videos: Video[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface VideoUploadResponse {
  video_id: number
  message: string
  upload_url?: string
}

export interface VideoUpdate {
  title?: string
  description?: string
  weapon_type?: "epee" | "foil" | "sabre"
  competition_name?: string
  competition_date?: string
  score?: string
  is_public?: boolean
}

export interface VideoFilters {
  skip?: number
  limit?: number
  search?: string
  weapon_type?: "epee" | "foil" | "sabre"
  athleteRight_id?: number
  athleteLeft_id?: number
  status?: "pending" | "published" | "flagged" | "removed"
}

export interface VideoUploadData {
  file: File
  title: string
  description?: string
  athleteRight_id?: number
  athleteLeft_id?: number
  weapon_type?: "epee" | "foil" | "sabre"
  competition_name?: string
  competition_date?: string
  score?: string
  is_public?: boolean
}

export function useVideoApi() {
  const { get, put, del, post, apiFetch } = useApi()

  // Upload video
  const uploadVideo = async (data: VideoUploadData): Promise<VideoUploadResponse> => {
    const formData = new FormData()
    formData.append("file", data.file)
    formData.append("title", data.title)
    if (data.description) formData.append("description", data.description)
    if (data.athleteRight_id) formData.append("athleteRight_id", data.athleteRight_id.toString())
    if (data.athleteLeft_id) formData.append("athleteLeft_id", data.athleteLeft_id.toString())
    if (data.weapon_type) formData.append("weapon_type", data.weapon_type)
    if (data.competition_name) formData.append("competition_name", data.competition_name)
    if (data.competition_date) formData.append("competition_date", data.competition_date)
    if (data.score) formData.append("score", data.score)
    formData.append("is_public", (data.is_public ?? true).toString())

    const response = await apiFetch("http://localhost:8000/api/v1/videos/upload", {
      method: "POST",
      body: formData,
      // Don't set Content-Type, browser will set it for FormData
    })
    return response.json()
  }

  // Get videos with filtering
  const getVideos = async (filters?: VideoFilters): Promise<VideoList> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.weapon_type) params.append("weapon_type", filters.weapon_type)
    if (filters?.athleteRight_id !== undefined) params.append("athleteRight_id", filters.athleteRight_id.toString())
    if (filters?.athleteLeft_id !== undefined) params.append("athleteLeft_id", filters.athleteLeft_id.toString())
    if (filters?.status) params.append("status", filters.status)

    const url = `http://localhost:8000/api/v1/videos/?${params.toString()}`
    const response = await get(url)
    return response.json()
  }

  // Get video by ID
  const getVideo = async (videoId: number): Promise<Video> => {
    const response = await get(`http://localhost:8000/api/v1/videos/${videoId}`)
    return response.json()
  }

  // Update video
  const updateVideo = async (videoId: number, data: VideoUpdate): Promise<Video> => {
    const response = await put(`http://localhost:8000/api/v1/videos/${videoId}`, data)
    return response.json()
  }

  // Delete video
  const deleteVideo = async (videoId: number): Promise<void> => {
    await del(`http://localhost:8000/api/v1/videos/${videoId}`)
  }

  // Update video status (admin only)
  const updateVideoStatus = async (videoId: number, newStatus: "pending" | "published" | "flagged" | "removed"): Promise<void> => {
    await put(`http://localhost:8000/api/v1/videos/${videoId}/status?new_status=${encodeURIComponent(newStatus)}`, {})
  }

  return {
    uploadVideo,
    getVideos,
    getVideo,
    updateVideo,
    deleteVideo,
    updateVideoStatus,
  }
} 