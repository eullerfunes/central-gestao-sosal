"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShoppingCart,
  Package,
  CreditCard,
  Store,
  BarChart,
  Building,
  Settings,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MODULES, isModuleAvailable } from "@/domains/shared/modules"

const Icons: Record<string, React.ElementType> = {
  ShoppingCart,
  Package,
  CreditCard,
  Store,
  BarChart,
  Building,
  Settings,
}

export interface SidebarProps {
  open?: boolean
  onToggle?: () => void
}

export function Sidebar({ open = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const isMobileOpen = open

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 h-screen border-r border-border bg-card transition-all duration-300",
        isMobileOpen ? "translate-x-0 lg:translate-x-0" : "-translate-x-full lg:translate-x-0",
        "w-64 lg:w-64",
      )}
      aria-label="Menu principal de navegação"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 h-12 px-4 border-b border-border">
          <button
            onClick={onToggle}
            className="-mr-2 lg:hidden p-1 rounded-md text-muted-foreground hover:bg-accent"
            aria-label="Fechar menu"
            aria-expanded={isMobileOpen}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">S</span>
            </div>
            <span className="font-semibold tracking-tight text-foreground">Só Sal</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="flex flex-col gap-1">
            {MODULES.map((module) => {
              const Icon = Icons[module.icon] || Settings
              const available = isModuleAvailable(module)
              const isActive = pathname === module.path || pathname.startsWith(`${module.path}/`)
              if (!available) {
                return (
                  <div
                    key={module.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium opacity-50 pointer-events-none cursor-not-allowed"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <span>{module.label}</span>
                  </div>
                )
              }
              return (
                <Link
                  key={module.id}
                  href={module.path}
                  onClick={onToggle}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-accent",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cn("h-5 w-5", isActive && "text-primary-foreground")}
                    aria-hidden="true"
                  />
                  <span>{module.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-border p-4">
          <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground">
            <span className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <span>Sair (em breve)</span>
          </span>
        </div>
      </div>
    </aside>
  )
}

export function MobileBackdrop({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-10 bg-black/40 lg:hidden backdrop-blur-sm"
      onClick={onToggle}
      aria-hidden="true"
    />
  )
}
