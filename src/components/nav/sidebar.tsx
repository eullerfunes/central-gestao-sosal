"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LogOut,
  ShoppingCart,
  Package,
  CreditCard,
  Store,
  BarChart,
  Building,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MODULES } from "@/domains/shared/modules"

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
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 h-screen border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-16 lg:w-64",
      )}
    >
      <div className="flex h-full flex-col">
        <div className={cn("flex items-center gap-2 h-12 px-4 border-b border-border", collapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">S</span>
          </div>
          {!collapsed && (
            <span className="font-semibold tracking-tight text-foreground">Só Sal</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="flex flex-col gap-1">
            {MODULES.map((module) => {
              const Icon = Icons[module.icon] || LogOut
              const isActive = pathname === module.path || pathname.startsWith(`${module.path}/`)
              return (
                <Link
                  key={module.id}
                  href={module.path}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    module.disabled ? "opacity-50 pointer-events-none" : "",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-accent",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                  {!collapsed && <span>{module.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-border p-4">
          <Link
            href="/sair"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className={cn("hidden", collapsed && "block")}>Sair</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
