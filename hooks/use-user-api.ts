import { useApi } from "./use-api"

// Types based on OpenAPI schema
export interface User {
  id: number
  email: string
  name: string
  role: "local_contact" | "coach" | "administrator"
  phone?: string
  club_name?: string
  bio?: string
  status: "active" | "suspended" | "pending"
  avatar_url?: string
  created_at: string
  updated_at?: string
  last_login?: string
  is_email_verified: boolean
  gdpr_consent: boolean
  gdpr_consent_date?: string
}

export interface UserUpdate {
  name?: string
  phone?: string
  club_name?: string
  bio?: string
  avatar_url?: string
}

export interface PasswordUpdate {
  current_password: string
  new_password: string
}

export interface EmailUpdate {
  new_email: string
  password: string
}

export interface AdminPasswordUpdate {
  new_password: string
}

export interface AdminEmailUpdate {
  new_email: string
}

export interface AdminUserUpdate {
  name?: string
  role?: "local_contact" | "coach" | "administrator"
  status?: "active" | "suspended" | "pending"
  phone?: string
  club_name?: string
  bio?: string
  avatar_url?: string
  is_email_verified?: boolean
  gdpr_consent?: boolean
}

export interface UserFilters {
  skip?: number
  limit?: number
  search?: string
  role?: "local_contact" | "coach" | "administrator"
  status?: "active" | "suspended" | "pending"
}

export function useUserApi() {
  const { get, put, del, patch } = useApi()

  // Get current user profile
  const getMe = async (): Promise<User> => {
    const response = await get("http://localhost:8000/api/v1/users/me")
    return response.json()
  }

  // Update current user profile
  const updateMe = async (data: UserUpdate): Promise<User> => {
    const response = await put("http://localhost:8000/api/v1/users/me", data)
    return response.json()
  }

  // Update current user password
  const updatePassword = async (data: PasswordUpdate): Promise<User> => {
    const response = await patch("http://localhost:8000/api/v1/users/me/password", data)
    return response.json()
  }

  // Update current user email
  const updateEmail = async (data: EmailUpdate): Promise<User> => {
    const response = await patch("http://localhost:8000/api/v1/users/me/email", data)
    return response.json()
  }

  // Get all users (admin only) - filters out other admins if current user is admin
  const getUsers = async (filters?: UserFilters, currentUser?: User): Promise<User[]> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.role) params.append("role", filters.role)
    if (filters?.status) params.append("status", filters.status)

    const url = `http://localhost:8000/api/v1/users/?${params.toString()}`
    const response = await get(url)
    const users = await response.json()
    
    // If current user is admin, filter out other administrators
    if (currentUser?.role === "administrator") {
      return users.filter((user: User) => user.role !== "administrator" || user.id === currentUser.id)
    }
    
    return users
  }

  // Get all users excluding administrators
  const getUsersExcludingAdmins = async (filters?: UserFilters): Promise<User[]> => {
    const params = new URLSearchParams()
    if (filters?.skip !== undefined) params.append("skip", filters.skip.toString())
    if (filters?.limit !== undefined) params.append("limit", filters.limit.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.role) params.append("role", filters.role)
    if (filters?.status) params.append("status", filters.status)

    const url = `http://localhost:8000/api/v1/users/?${params.toString()}`
    const response = await get(url)
    const users = await response.json()
    
    // Filter out users with administrator role
    return users.filter((user: User) => user.role !== "administrator")
  }

  // Get user by ID
  const getUser = async (userId: number): Promise<User> => {
    const response = await get(`http://localhost:8000/api/v1/users/${userId}`)
    return response.json()
  }

  // Delete user (admin only)
  const deleteUser = async (userId: number): Promise<void> => {
    await del(`http://localhost:8000/api/v1/users/${userId}`)
  }

  // Update user status (admin only)
  const updateUserStatus = async (userId: number, newStatus: "active" | "suspended" | "pending"): Promise<User> => {
    const response = await put(`http://localhost:8000/api/v1/users/${userId}/status?new_status=${encodeURIComponent(newStatus)}`, {})
    return response.json()
  }

  // Update user password (admin only)
  const updateUserPasswordAdmin = async (userId: number, data: AdminPasswordUpdate): Promise<User> => {
    const response = await patch(`http://localhost:8000/api/v1/users/${userId}/password`, data)
    return response.json()
  }

  // Update user email (admin only)
  const updateUserEmailAdmin = async (userId: number, data: AdminEmailUpdate): Promise<User> => {
    const response = await patch(`http://localhost:8000/api/v1/users/${userId}/email`, data)
    return response.json()
  }

  // Update user profile (admin only) - Now using the new PATCH endpoint
  const updateUserProfileAdmin = async (userId: number, data: AdminUserUpdate): Promise<User> => {
    const response = await patch(`http://localhost:8000/api/v1/users/${userId}`, data)
    return response.json()
  }

  return {
    getMe,
    updateMe,
    updatePassword,
    updateEmail,
    getUsers,
    getUsersExcludingAdmins,
    getUser,
    deleteUser,
    updateUserStatus,
    updateUserPasswordAdmin,
    updateUserEmailAdmin,
    updateUserProfileAdmin,
  }
} 