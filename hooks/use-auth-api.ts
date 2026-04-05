import { useApi } from "./use-api"

// Types based on OpenAPI schema
export interface UserCreate {
  email: string
  name: string
  password: string
  role?: "local_contact" | "coach" | "administrator"
  phone?: string
  club_name?: string
  bio?: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
}

export function useAuthApi() {
  const { post } = useApi()

  // Register a new user
  const register = async (data: UserCreate): Promise<any> => {
    const response = await post("http://localhost:8000/api/v1/auth/register", data)
    return response.json()
  }

  // Login user
  const login = async (data: UserLogin): Promise<Token> => {
    const response = await post("http://localhost:8000/api/v1/auth/login", data)
    return response.json()
  }

  // Refresh access token
  const refreshToken = async (refresh_token: string): Promise<Token> => {
    const response = await post(`http://localhost:8000/api/v1/auth/refresh?refresh_token=${encodeURIComponent(refresh_token)}`, {})
    return response.json()
  }

  // Logout user
  const logout = async (): Promise<void> => {
    await post("http://localhost:8000/api/v1/auth/logout", {})
  }

  return {
    register,
    login,
    refreshToken,
    logout,
  }
} 