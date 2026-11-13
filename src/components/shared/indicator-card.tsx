"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"

export interface IndicatorCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: string; direction: "up" | "down" | "neutral" }
}

export function IndicatorCard({
  title,
  value,
  subtitle,
  trend,
}: IndicatorCardProps) {
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : ArrowUpRight
  const trendColor = trend?.direction === "up" ? "text-green-600" : trend?.direction === "down" ? "text-destructive" : "text-muted-foreground"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge variant="outline" className="h-8 w-8 p-0">
          <TrendIcon className="h-4 w-4" aria-hidden="true" />
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {trend && (
          <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
