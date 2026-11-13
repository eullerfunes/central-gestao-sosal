"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { MODULES, isModuleAvailable } from "@/domains/shared/modules"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export interface HeaderProps {
  mobileOpen: boolean
  onToggleMobile: () => void
}

export function Header({ mobileOpen, onToggleMobile }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-background bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMobile}
          className="-ml-1 flex h-8 items-center rounded-md text-muted-foreground lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu de navegação"}
        >
          <span className="sr-only">
            {mobileOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
          </span>
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {MODULES.filter((m) => ["compras", "estoque", "financeiro", "comercial"].includes(m.id)).map((m) => {
            const available = isModuleAvailable(m)
            const isActive = pathname === m.path
            if (!available) {
              return (
                <span
                  key={m.id}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium opacity-50 pointer-events-none cursor-not-allowed"
                >
                  {m.label}
                </span>
              )
            }
            return (
              <Link
                key={m.id}
                href={m.path}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {m.label}
              </Link>
            )
          })}
        </nav>
      </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <span className="sr-only">Notificações</span>
                <Bell className="h-5 w-5" aria-label="Notificações" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-64" side="right">
              <SheetHeader>
                <SheetTitle>Notificações</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Hoje
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full">...</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Sem notificações novas</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium">Usuário</span>
          </div>
        </div>
    </header>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
