import { useApi } from "./use-api"

// Types based on OpenAPI schema
export interface Comment {
  id: number
  content: string
  parent_id?: number
  author_id: number
  video_id: number
  status: "pending" | "approved" | "flagged" | "removed"
  created_at: string
  updated_at?: string
  author_name?: string
  author_email?: string
  reply_count: number
  is_author: boolean
}

export interface CommentList {
  comments: Comment[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface CommentCreate {
  content: string
  parent_id?: number
}

export interface CommentUpdate {
  content: string
}

export interface CommentFilters {
  skip?: number
  limit?: number
  parent_id?: number
}

export interface AdminCommentFilters {
  skip?: number
  limit?: number
  status?: "pending" | "approved" | "flagged" | "removed"
  author_id?: number
  video_id?: number
}

export function useCommentApi() {
  const { get, put, del, post } = useApi()

  // Create a new comment on a video
  const createComment = async (videoId: number, data: CommentCreate): Promise<Comment> => {
    const response = await post(`http://localhost:8000/api/v1/videos/${videoId}/comments`, data)
    return response.json()
  }

  // Get comments for a video
  const getVideoComments = async (videoId: number, filters?: CommentFilters): Promise<CommentList> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())
    if (filters?.parent_id !== undefined) params.append("parent_id", filters.parent_id.toString())

    const url = `http://localhost:8000/api/v1/videos/${videoId}/comments?${params.toString()}`
    const response = await get(url)
    return response.json()
  }

  // Get a specific comment by ID
  const getComment = async (commentId: number): Promise<Comment> => {
    const response = await get(`http://localhost:8000/api/v1/comments/${commentId}`)
    return response.json()
  }

  // Update a comment
  const updateComment = async (commentId: number, data: CommentUpdate): Promise<Comment> => {
    const response = await put(`http://localhost:8000/api/v1/comments/${commentId}`, data)
    return response.json()
  }

  // Delete a comment
  const deleteComment = async (commentId: number): Promise<void> => {
    await del(`http://localhost:8000/api/v1/comments/${commentId}`)
  }

  // Update comment status (admin only)
  const updateCommentStatus = async (commentId: number, newStatus: "pending" | "approved" | "flagged" | "removed"): Promise<void> => {
    await put(`http://localhost:8000/api/v1/comments/${commentId}/status?new_status=${encodeURIComponent(newStatus)}`, {})
  }

  // Get all comments (admin only)
  const getAllComments = async (filters?: AdminCommentFilters): Promise<CommentList> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())
    if (filters?.status) params.append("status", filters.status)
    if (filters?.author_id !== undefined) params.append("author_id", filters.author_id.toString())
    if (filters?.video_id !== undefined) params.append("video_id", filters.video_id.toString())

    const url = `http://localhost:8000/api/v1/comments?${params.toString()}`
    const response = await get(url)
    return response.json()
  }

  // Get pending comments for moderation (admin only)
  const getPendingComments = async (filters?: { skip?: number; limit?: number }): Promise<CommentList> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())

    const url = `http://localhost:8000/api/v1/comments/pending?${params.toString()}`
    const response = await get(url)
    return response.json()
  }

  return {
    createComment,
    getVideoComments,
    getComment,
    updateComment,
    deleteComment,
    updateCommentStatus,
    getAllComments,
    getPendingComments,
  }
} 