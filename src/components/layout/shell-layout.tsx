"use client"

import * as React from "react"
import { Sidebar, MobileBackdrop } from "@/components/nav/sidebar"
import { Header } from "@/components/nav/header"
import { cn } from "@/lib/utils"

export interface ShellLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ShellLayout({ children, className }: ShellLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const onToggleMobile = React.useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  return (
    <div className={cn("relative h-screen bg-background", className)}>
      <MobileBackdrop open={mobileOpen} onToggle={onToggleMobile} />
      <Sidebar open={mobileOpen} onToggle={onToggleMobile} />

      <main
        className={cn(
          "flex flex-col min-w-0 overflow-hidden lg:ml-64",
          className,
        )}
      >
        <Header mobileOpen={mobileOpen} onToggleMobile={onToggleMobile} />
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
