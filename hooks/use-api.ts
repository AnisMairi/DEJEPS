import { useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { jwtDecode } from "jwt-decode"

export function useApi() {
  const { user, logout, refreshAccessToken } = useAuth()

  // Helper to check if token is expired
  const isTokenExpired = (token: string) => {
    try {
      const decoded: any = jwtDecode(token)
      const now = Date.now() / 1000
      return decoded.exp && decoded.exp < now
    } catch {
      return true
    }
  }

  // Main API call function
  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      let accessToken = localStorage.getItem("access_token")
      if (!accessToken || isTokenExpired(accessToken)) {
        const refreshed = await refreshAccessToken()
        if (!refreshed) {
          logout()
          throw new Error("Session expired. Please log in again.")
        }
        accessToken = localStorage.getItem("access_token")
      }
      
      const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      } as Record<string, string>
      
      // Only set Content-Type for JSON requests, not for FormData
      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json"
      }
      
      const response = await fetch(url, { 
        ...options, 
        headers,
        // Include credentials to send cookies with all requests
        credentials: "include",
      })
      
      if (response.status === 401) {
        logout()
        throw new Error("Unauthorized. Please log in again.")
      }
      
      // Handle other HTTP errors
      if (!response.ok) {
        const errorMessage = `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }
      
      return response
    },
    [logout, refreshAccessToken]
  )

  // HTTP helpers
  const post = useCallback(
    (url: string, body: any) =>
      apiFetch(url, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    [apiFetch]
  )

  const get = useCallback(
    (url: string) => apiFetch(url, { method: "GET" }),
    [apiFetch]
  )

  const put = useCallback(
    (url: string, body: any) =>
      apiFetch(url, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    [apiFetch]
  )

  const patch = useCallback(
    (url: string, body: any) =>
      apiFetch(url, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    [apiFetch]
  )

  const del = useCallback(
    (url: string) => apiFetch(url, { method: "DELETE" }),
    [apiFetch]
  )

  // Authentication helpers
  const register = useCallback(
    (data: { email: string; password: string; [key: string]: any }) =>
      post("http://localhost:8000/api/v1/auth/register", data),
    [post]
  )

  const loginApi = useCallback(
    (email: string, password: string) =>
      post("http://localhost:8000/api/v1/auth/login", { email, password }),
    [post]
  )

  const logoutApi = useCallback(
    () => post("http://localhost:8000/api/v1/auth/logout", {}),
    [post]
  )

  return { apiFetch, get, post, put, patch, del, register, loginApi, logoutApi }
} 