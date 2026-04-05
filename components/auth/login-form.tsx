"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DEMO_USERS } from "@/lib/demo-users"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      if (err.message === "wrong_credentials") {
        setError("Email ou mot de passe incorrect.")
      } else if (err.message === "account_suspended") {
        setError("Votre compte a été suspendu. Veuillez contacter la fédération pour plus d’informations")
      } else {
        setError("Échec de la connexion. Veuillez réessayer.")
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl sm:text-2xl text-center">Connexion</CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">
          Mode démo — sélectionnez un compte ci-dessous
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.fr"
              autoComplete="email"
              aria-label="Adresse email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                aria-label="Mot de passe"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>

          <div className="border-t pt-4 space-y-3">
            <div className="text-xs font-medium text-muted-foreground text-center uppercase tracking-wider">
              Comptes de démo
            </div>
            <div className="space-y-2">
              {DEMO_USERS.map((demoUser) => (
                <button
                  key={demoUser.user.id}
                  type="button"
                  className="w-full p-3 bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => {
                    setEmail(demoUser.email)
                    setPassword(demoUser.password)
                  }}
                  aria-label={`Se connecter avec le compte ${demoUser.user.name}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">
                        {demoUser.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {demoUser.email}
                      </div>
                    </div>
                    <Badge
                      variant={
                        demoUser.user.role === "administrator"
                          ? "default"
                          : demoUser.user.role === "coach"
                          ? "secondary"
                          : "outline"
                      }
                      className="ml-2 shrink-0"
                    >
                      {demoUser.user.role === "administrator"
                        ? "Admin"
                        : demoUser.user.role === "coach"
                        ? "Coach"
                        : "Contact"}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground text-center pt-2">
              Cliquez sur un compte pour remplir automatiquement les champs
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
