"use client"

import type React from "react"
import { useState } from "react"

import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { Footer } from "./footer"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="w-full min-h-screen bg-background flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 min-h-0 w-full">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden lg:block relative w-64 border-r bg-background overflow-y-auto h-[calc(100vh-3.5rem)]">
          <Sidebar />
        </aside>
        
        {/* Mobile Sidebar - Sheet/Drawer */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="h-full overflow-y-auto">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0 min-w-0 flex flex-col">
          <div className="flex-1 max-w-full">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
