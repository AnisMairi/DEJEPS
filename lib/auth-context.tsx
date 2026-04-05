"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { validateDemoCredentials, generateMockToken, decodeMockToken } from "./demo-users"

export type UserRole = "local_contact" | "coach" | "administrator"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  refreshAccessToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = () => {
    // Mode démo : logout local simple
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
  }

  useEffect(() => {
    // Check for existing session (mode démo)
    const savedUser = localStorage.getItem("user")
    const accessToken = localStorage.getItem("access_token")

    if (savedUser && accessToken) {
      try {
        const decoded = decodeMockToken(accessToken)
        // Check if token is expired
        const now = Date.now() / 1000
        if (decoded && decoded.exp && decoded.exp < now) {
          // Token expired, clear session
          logout()
        } else if (decoded) {
          // Valid token, restore user
          setUser(JSON.parse(savedUser))
        } else {
          logout()
        }
      } catch (e) {
        logout()
      }
    }
    setIsLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refresh token logic - mode démo (simule le refresh)
  const refreshAccessToken = async () => {
    try {
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        const userInfo: User = JSON.parse(savedUser)
        // Génère un nouveau token mock
        const newToken = generateMockToken(userInfo)
        localStorage.setItem("access_token", newToken)
      return true
      }
      return false
    } catch (e) {
      logout()
      return false
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mode démo : validation locale sans backend
      const userInfo = validateDemoCredentials(email, password)

      if (!userInfo) {
        throw new Error("wrong_credentials")
      }

      // Génère un token mock
      const mockToken = generateMockToken(userInfo)
      localStorage.setItem("access_token", mockToken)
      localStorage.setItem("user", JSON.stringify(userInfo))
      setUser(userInfo)
    } catch (err: any) {
      // Re-throw errors
      throw err
    } finally {
      setIsLoading(false)
    }
  }


  return <AuthContext.Provider value={{ user, login, logout, isLoading, refreshAccessToken }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
