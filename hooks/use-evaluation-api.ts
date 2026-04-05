import { useApi } from "./use-api"

// Types based on OpenAPI schema
export interface Evaluation {
  id: number
  video_id: number
  athlete_id: number
  evaluator_id: number
  technique_score: number
  tactics_score: number
  speed_score?: number
  physical_score?: number
  mental_strength_score?: number
  mental_score?: number
  overall_score: number
  comments: string
  strengths?: string
  areas_for_improvement?: string
  specific_feedback?: string
  recommendations?: string
  created_at: string
  updated_at?: string
  evaluator_name?: string
  athlete_name?: string
}

export interface EvaluationList {
  evaluations: Evaluation[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface EvaluationCreate {
  athlete_id: number
  technique_score: number
  tactics_score: number
  speed_score?: number
  physical_score?: number
  mental_strength_score?: number
  mental_score?: number
  overall_score: number
  comments: string
  strengths?: string
  areas_for_improvement?: string
  specific_feedback?: string
  recommendations?: string
}

export interface EvaluationUpdate {
  technique_score?: number
  tactics_score?: number
  speed_score?: number
  physical_score?: number
  mental_strength_score?: number
  mental_score?: number
  overall_score?: number
  comments?: string
  strengths?: string
  areas_for_improvement?: string
  specific_feedback?: string
  recommendations?: string
}

export interface EvaluationFilters {
  skip?: number
  limit?: number
  athlete_id?: number
  evaluator_id?: number
  min_score?: number
  max_score?: number
}

export interface AdminEvaluationFilters extends EvaluationFilters {
  video_id?: number
  status?: "pending" | "approved" | "flagged"
}

export function useEvaluationApi() {
  const { get, post, put, del } = useApi()

  const createEvaluation = async (videoId: number, evaluationData: EvaluationCreate): Promise<Evaluation> => {
    const response = await post(`http://localhost:8000/api/v1/videos/${videoId}/evaluations`, evaluationData)
    return response.json()
  }

  const getVideoEvaluations = async (videoId: number, params?: EvaluationFilters): Promise<EvaluationList> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const url = `http://localhost:8000/api/v1/videos/${videoId}/evaluations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await get(url)
    return response.json()
  }

  const getAthleteEvaluations = async (athleteId: number, params?: EvaluationFilters): Promise<EvaluationList> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const url = `http://localhost:8000/api/v1/athletes/${athleteId}/evaluations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await get(url)
    return response.json()
  }

  const getEvaluation = async (evaluationId: number): Promise<Evaluation> => {
    const response = await get(`http://localhost:8000/api/v1/evaluations/${evaluationId}`)
    return response.json()
  }

  const updateEvaluation = async (evaluationId: number, evaluationData: EvaluationUpdate): Promise<Evaluation> => {
    const response = await put(`http://localhost:8000/api/v1/evaluations/${evaluationId}`, evaluationData)
    return response.json()
  }

  const deleteEvaluation = async (evaluationId: number): Promise<void> => {
    const response = await del(`http://localhost:8000/api/v1/evaluations/${evaluationId}`)
    return response.json()
  }

  const getAllEvaluations = async (params?: AdminEvaluationFilters): Promise<EvaluationList> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const url = `http://localhost:8000/api/v1/evaluations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await get(url)
    return response.json()
  }

  return {
    createEvaluation,
    getVideoEvaluations,
    getAthleteEvaluations,
    getEvaluation,
    updateEvaluation,
    deleteEvaluation,
    getAllEvaluations,
  }
} 