"use client"

import * as React from "react"
import { Sidebar } from "@/components/nav/sidebar"
import { Header } from "@/components/nav/header"
import { cn } from "@/lib/utils"

export interface ShellLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ShellLayout({ children, className }: ShellLayoutProps) {
  return (
    <div className={cn("flex h-screen bg-background", className)}>
      <Sidebar collapsed={false} />
      <Header />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pl-16 lg:pl-64">
        {children}
      </main>
    </div>
  )
}
