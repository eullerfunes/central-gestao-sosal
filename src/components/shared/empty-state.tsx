"use client"

import Link from "next/link"
import * as React from "react"
import { FolderKanban } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; href: string }
  icon?: React.ElementType
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = FolderKanban,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed">
      <div className="flex flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <CardHeader className="mt-6 space-y-0 py-0">
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && (
            <CardDescription className="text-muted-foreground">{description}</CardDescription>
          )}
        </CardHeader>
      </div>
      {action && (
        <CardContent className="pt-0">
          <Button asChild variant="outline">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
