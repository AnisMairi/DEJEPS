"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/common/loading"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  // Si l'utilisateur est déjà connecté, afficher un message avec option de déconnexion
  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/" className="relative w-32 h-32 md:w-40 md:h-40">
              <Image
                src="/logo_white.svg"
                alt="Fédération Française d'Escrime"
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>

          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl text-center">Déjà connecté</CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                Vous êtes déjà connecté en tant que {user.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => router.push("/dashboard")} 
                  className="w-full"
                >
                  Aller au tableau de bord
                </Button>
                <Button 
                  onClick={() => {
                    logout()
                    router.refresh()
                  }} 
                  variant="outline"
                  className="w-full"
                >
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <footer className="text-center text-sm text-muted-foreground pt-4 space-y-1">
            <p>© {new Date().getFullYear()} Fédération Française d'Escrime</p>
            <p>
              Développé par{" "}
              <Link
                href="https://vane-solutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline underline-offset-4"
              >
                Vane Solutions
              </Link>
            </p>
          </footer>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="relative w-32 h-32 md:w-40 md:h-40">
            <Image
              src="/logo_white.svg"
              alt="Fédération Française d'Escrime"
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <LoginForm />

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-4 space-y-1">
          <p>© {new Date().getFullYear()} Fédération Française d'Escrime</p>
          <p>
            Développé par{" "}
            <Link
              href="https://vane-solutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline underline-offset-4"
            >
              Vane Solutions
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
