import { useApi } from "./use-api"
import { useCallback } from "react"

// Types based on OpenAPI schema
export interface Athlete {
  id: number
  first_name: string
  last_name: string
  date_of_birth: string
  gender: "male" | "female"
  email?: string
  phone?: string
  weapon: "foil" | "sabre" | "épée"
  skill_level: "beginner" | "intermediate" | "advanced" | "elite"
  club?: string
  coach?: string
  region?: "paris" | "lyon" | "marseille" | "toulouse" | "bordeaux" | "nice" | "other"
  emergency_contact?: string
  emergency_phone?: string
  medical_notes?: string
  notes?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
  tutor?: Tutor
}

export interface AthleteList {
  id: number
  first_name: string
  last_name: string
  date_of_birth: string
  gender: "male" | "female"
  weapon: "foil" | "sabre" | "épée"
  skill_level: "beginner" | "intermediate" | "advanced" | "elite"
  club?: string
  region?: "paris" | "lyon" | "marseille" | "toulouse" | "bordeaux" | "nice" | "other"
  avatar_url?: string
  created_at: string
}

export interface AthleteCreate {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: "male" | "female"
  email?: string
  phone?: string
  weapon: "foil" | "sabre" | "épée"
  skill_level: "beginner" | "intermediate" | "advanced" | "elite"
  club?: string
  coach?: string
  region?: "paris" | "lyon" | "marseille" | "toulouse" | "bordeaux" | "nice" | "other"
  emergency_contact?: string
  emergency_phone?: string
  medical_notes?: string
  notes?: string
  tutor?: TutorCreate
}

export interface AthleteUpdate {
  first_name?: string
  last_name?: string
  date_of_birth?: string
  gender?: "male" | "female"
  email?: string
  phone?: string
  avatar_url?: string
  weapon?: "foil" | "sabre" | "épée"
  skill_level?: "beginner" | "intermediate" | "advanced" | "elite"
  club?: string
  coach?: string
  region?: "paris" | "lyon" | "marseille" | "toulouse" | "bordeaux" | "nice" | "other"
  emergency_contact?: string
  emergency_phone?: string
  medical_notes?: string
  notes?: string
}

export interface Tutor {
  id: number
  athlete_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  tutor_relationship: "parent" | "legal-guardian" | "grandparent" | "uncle-aunt" | "sibling" | "other"
  address?: string
  occupation?: string
  created_at: string
  updated_at?: string
}

export interface TutorCreate {
  first_name: string
  last_name: string
  email: string
  phone: string
  tutor_relationship: "parent" | "legal-guardian" | "grandparent" | "uncle-aunt" | "sibling" | "other"
  address?: string
  occupation?: string
}

export interface TutorUpdate {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  tutor_relationship?: "parent" | "legal-guardian" | "grandparent" | "uncle-aunt" | "sibling" | "other"
  address?: string
  occupation?: string
}

export interface AthleteFilters {
  skip?: number
  limit?: number
  search?: string
  weapon?: "foil" | "sabre" | "épée"
  skill_level?: "beginner" | "intermediate" | "advanced" | "elite"
  region?: "paris" | "lyon" | "marseille" | "toulouse" | "bordeaux" | "nice" | "other"
  gender?: "male" | "female"
  min_age?: number
  max_age?: number
}

export function useAthleteApi() {
  const { get, put, del, post, apiFetch } = useApi()

  // Create a new athlete
  const createAthlete = useCallback(async (data: AthleteCreate): Promise<Athlete> => {
    const response = await post("http://localhost:8000/api/v1/athletes/", data)
    return response.json()
  }, [post])

  // Get all athletes with filtering
  const getAthletes = useCallback(async (filters?: AthleteFilters): Promise<AthleteList[]> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.weapon) params.append("weapon", filters.weapon)
    if (filters?.skill_level) params.append("skill_level", filters.skill_level)
    if (filters?.region) params.append("region", filters.region)
    if (filters?.gender) params.append("gender", filters.gender)
    if (filters?.min_age !== undefined) params.append("min_age", filters.min_age.toString())
    if (filters?.max_age !== undefined) params.append("max_age", filters.max_age.toString())

    const url = `http://localhost:8000/api/v1/athletes/?${params.toString()}`
    const response = await get(url)
    return response.json()
  }, [get])

  // Get athlete by ID
  const getAthlete = useCallback(async (athleteId: number): Promise<Athlete> => {
    const response = await get(`http://localhost:8000/api/v1/athletes/${athleteId}`)
    return response.json()
  }, [get])

  // Update athlete
  const updateAthlete = useCallback(async (athleteId: number, data: AthleteUpdate): Promise<Athlete> => {
    const response = await put(`http://localhost:8000/api/v1/athletes/${athleteId}`, data)
    return response.json()
  }, [put])

  // Delete athlete (admin only)
  const deleteAthlete = useCallback(async (athleteId: number): Promise<void> => {
    await del(`http://localhost:8000/api/v1/athletes/${athleteId}`)
  }, [del])

  // Update athlete tutor
  const updateAthleteTutor = useCallback(async (athleteId: number, data: TutorUpdate): Promise<Athlete> => {
    const response = await put(`http://localhost:8000/api/v1/athletes/${athleteId}/tutor`, data)
    return response.json()
  }, [put])

  // Delete athlete tutor
  const deleteAthleteTutor = useCallback(async (athleteId: number): Promise<void> => {
    await del(`http://localhost:8000/api/v1/athletes/${athleteId}/tutor`)
  }, [del])

  // Upload athlete avatar
  const uploadAthleteAvatar = useCallback(async (athleteId: number, file: File): Promise<void> => {
    const formData = new FormData()
    formData.append("file", file)
    
    await apiFetch(`http://localhost:8000/api/v1/athletes/${athleteId}/avatar`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type, browser will set it for FormData
    })
  }, [apiFetch])

  // Get athletes statistics summary
  const getAthletesSummary = useCallback(async (): Promise<any> => {
    const response = await get("http://localhost:8000/api/v1/athletes/stats/summary")
    return response.json()
  }, [get])

  return {
    createAthlete,
    getAthletes,
    getAthlete,
    updateAthlete,
    deleteAthlete,
    updateAthleteTutor,
    deleteAthleteTutor,
    uploadAthleteAvatar,
    getAthletesSummary,
  }
} 