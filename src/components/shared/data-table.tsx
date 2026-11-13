"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export interface DataTableProps<T extends object> {
  columns: { key: keyof T & string; label: string }[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  rowKey?: keyof T & string
}

export function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",
  rowKey = "id" as keyof T & string,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-2">
          <div className="grid grid-cols-12 gap-4">
            {columns.map((_, i) => (
              <Skeleton key={i} className={`col-span-${Math.min(4, 12)}`} />
            ))}
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4">
              {columns.map((_, j) => (
                <Skeleton key={j} className={`col-span-${Math.min(4, 12)}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)} className="text-left">
                {String(column.label)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={String(row[rowKey])}>
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {String(row[column.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
