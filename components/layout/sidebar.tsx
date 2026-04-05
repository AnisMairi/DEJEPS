"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Video, Users, MessageSquare, Shield, BarChart3, Upload, Bell, Star, FileText, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["local_contact", "coach", "administrator"],
    },
    {
      name: "Videos",
      href: "/videos",
      icon: Video,
      roles: ["local_contact", "coach", "administrator"],
    },
    {
      name: "Athletes",
      href: "/athletes",
      icon: Users,
      roles: ["local_contact", "coach", "administrator"],
    },
    /*
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      roles: ["local_contact", "coach", "administrator"],
    },
    */
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      roles: ["local_contact", "coach", "administrator"],
      badge: "3", // Mock unread count
    },
    {
      name: "Évaluations",
      href: "/evaluations",
      icon: Star,
      roles: ["coach", "administrator"],
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      roles: ["coach", "administrator"],
    },
    {
      name: "Admin",
      href: "/admin",
      icon: Shield,
      roles: ["administrator"],
    },
  ]

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user?.role || "local_contact"))

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {/* Main Action Button for Upload Video */}
          {user && (user.role === "local_contact" || user.role === "coach") ? (
            <Link href="/videos/upload" onClick={handleLinkClick}>
              <Button
                className="w-full mt-4 mb-4 bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 flex items-center gap-2 text-sm sm:text-base py-2 sm:py-3"
                size="lg"
              >
                <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-base">Upload Video</span>
              </Button>
            </Link>
          ) : (
            <h2 className="mb-2 px-4 text-base sm:text-lg font-semibold tracking-tight">Navigation</h2>
          )}
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <Button
                key={item.name}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start text-sm sm:text-base"
                asChild
              >
                <Link href={item.href} onClick={handleLinkClick}>
                  <item.icon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-auto text-xs flex-shrink-0">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
