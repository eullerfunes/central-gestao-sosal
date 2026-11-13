"use client"

import * as React from "react"
import { Sidebar, MobileBackdrop } from "@/components/nav/sidebar"
import { Header } from "@/components/nav/header"
import { cn } from "@/lib/utils"
import { Suspense } from "react"

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
      <Suspense fallback={<div className="h-full lg:h-full" />}>
        <Sidebar open={mobileOpen} onToggle={onToggleMobile} />
      </Suspense>

      <main
        className={cn(
          "flex flex-col h-full min-w-0 overflow-hidden lg:ml-64",
          className,
        )}
      >
        <Suspense fallback={<div className="h-14" />}>
          <Header mobileOpen={mobileOpen} onToggleMobile={onToggleMobile} />
        </Suspense>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Suspense fallback={<div className="h-full" />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  )
}
