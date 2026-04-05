import type { User } from "./auth-context"

export interface DemoUser {
  email: string
  password: string
  user: User
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: "admin@federation.fr",
    password: "admin123",
    user: {
      id: "1",
      email: "admin@federation.fr",
      name: "Administrateur",
      role: "administrator",
    },
  },
  {
    email: "coach@federation.fr",
    password: "coach123",
    user: {
      id: "2",
      email: "coach@federation.fr",
      name: "Coach Principal",
      role: "coach",
    },
  },
  {
    email: "contact@federation.fr",
    password: "contact123",
    user: {
      id: "3",
      email: "contact@federation.fr",
      name: "Contact Local",
      role: "local_contact",
    },
  },
]

export function validateDemoCredentials(email: string, password: string): User | null {
  const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password)
  return demoUser ? demoUser.user : null
}

export function generateMockToken(user: User): string {
  // Génère un token mock simple (pas un vrai JWT, juste pour la démo)
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Expire dans 24h
  }
  // Encode en base64 (juste pour simuler un token)
  return btoa(JSON.stringify(payload))
}

export function decodeMockToken(token: string): any {
  try {
    return JSON.parse(atob(token))
  } catch {
    return null
  }
}

