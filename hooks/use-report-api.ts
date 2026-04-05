import { useApi } from "./use-api"

// Types based on OpenAPI schema
export interface Report {
  id: number
  reporter_id: number
  reporter_name?: string
  reporter_email?: string
  reported_content_type: "video" | "comment"
  reported_content_id: number
  reported_content_title?: string
  reason: string
  description?: string
  status: "pending" | "resolved" | "dismissed"
  created_at: string
  updated_at?: string
}

export interface ReportList {
  reports: Report[]
  total: number
  skip: number
  limit: number
}

export interface ReportFilters {
  skip?: number
  limit?: number
  status?: "pending" | "resolved" | "dismissed"
  reported_content_type?: "video" | "comment"
  reporter_id?: number
  reported_content_id?: number
}

export interface ReportCreate {
  reported_content_type: "video" | "comment"
  reported_content_id: number
  reason: string
  description?: string
}

export interface ReportUpdate {
  status: "pending" | "resolved" | "dismissed"
  description?: string
}

export function useReportApi() {
  const { get, put, del, post } = useApi()

  // Create a new report
  const createReport = async (data: ReportCreate): Promise<Report> => {
    const response = await post("http://localhost:8000/api/v1/reports", data)
    return response.json()
  }

  // Get all reports (admin only)
  const getReports = async (filters?: ReportFilters): Promise<ReportList> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())
    if (filters?.status) params.append("status", filters.status)
    if (filters?.reported_content_type) params.append("reported_content_type", filters.reported_content_type)
    if (filters?.reporter_id !== undefined) params.append("reporter_id", filters.reporter_id.toString())
    if (filters?.reported_content_id !== undefined) params.append("reported_content_id", filters.reported_content_id.toString())

    const url = `http://localhost:8000/api/v1/reports?${params.toString()}`
    const response = await get(url)
    return response.json()
  }

  // Get a specific report by ID
  const getReport = async (reportId: number): Promise<Report> => {
    const response = await get(`http://localhost:8000/api/v1/reports/${reportId}`)
    return response.json()
  }

  // Update a report status (admin only)
  const updateReport = async (reportId: number, data: ReportUpdate): Promise<Report> => {
    const response = await put(`http://localhost:8000/api/v1/reports/${reportId}`, data)
    return response.json()
  }

  // Delete a report (admin only)
  const deleteReport = async (reportId: number): Promise<void> => {
    await del(`http://localhost:8000/api/v1/reports/${reportId}`)
  }

  // Get reports for a specific video
  const getVideoReports = async (videoId: number, filters?: { skip?: number; limit?: number }): Promise<ReportList> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())

    const url = `http://localhost:8000/api/v1/videos/${videoId}/reports?${params.toString()}`
    const response = await get(url)
    return response.json()
  }

  // Get reports for a specific comment
  const getCommentReports = async (commentId: number, filters?: { skip?: number; limit?: number }): Promise<ReportList> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())

    const url = `http://localhost:8000/api/v1/comments/${commentId}/reports?${params.toString()}`
    const response = await get(url)
    return response.json()
  }

  // Get pending reports for moderation (admin only)
  const getPendingReports = async (filters?: { skip?: number; limit?: number }): Promise<ReportList> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())

    const url = `http://localhost:8000/api/v1/reports/pending?${params.toString()}`
    const response = await get(url)
    return response.json()
  }

  return {
    createReport,
    getReports,
    getReport,
    updateReport,
    deleteReport,
    getVideoReports,
    getCommentReports,
    getPendingReports,
  }
} 