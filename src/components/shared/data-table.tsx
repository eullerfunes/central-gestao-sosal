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
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export type SortDirection = "asc" | "desc" | null

export interface SortState {
  key: string
  direction: SortDirection
}

export interface PaginationState {
  pageIndex: number
  pageSize: number
  total: number
}

export interface DataTableProps<T extends object> {
  columns: {
    key: keyof T & string
    label: string
    sortable?: boolean
    format?: (value: unknown) => React.ReactNode
  }[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  rowKey?: keyof T & string
  sort?: SortState
  onSortChange?: (sort: SortState) => void
  filter?: string
  onFilterChange?: (value: string) => void
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  "aria-label"?: string
}

export function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",
  rowKey = "id" as keyof T & string,
  sort,
  onSortChange,
  filter,
  onFilterChange,
  pagination,
  onPaginationChange,
  "aria-label": ariaLabel = "Tabela de dados",
}: DataTableProps<T>) {
  const [localFilter, setLocalFilter] = React.useState(filter ?? "")

  const handleFilterChange = React.useCallback(
    (value: string) => {
      setLocalFilter(value)
      onFilterChange?.(value)
    },
    [onFilterChange],
  )

  const handleSort = React.useCallback(
    (key: string) => {
      if (!onSortChange) return
      const nextDirection =
        sort?.key === key && sort?.direction === "asc" ? "desc" : "asc"
      onSortChange({ key, direction: nextDirection })
    },
    [onSortChange, sort],
  )

  const handlePageChange = React.useCallback(
    (pageIndex: number) => {
      if (!onPaginationChange || !pagination) return
      onPaginationChange({ ...pagination, pageIndex })
    },
    [onPaginationChange, pagination],
  )

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4" aria-label={ariaLabel}>
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
      <div className="rounded-lg border border-border bg-card p-8 text-center" aria-label={ariaLabel}>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  const formatValue = (value: unknown, format?: (value: unknown) => React.ReactNode) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>
    }
    if (format) return format(value)
    return String(value)
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden" aria-label={ariaLabel}>
      {onFilterChange && (
        <div className="p-4 border-b border-background">
          <div className="relative">
            <input
              type="search"
              placeholder="Filtrar registros…"
              value={localFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Filtrar tabela"
            />
          </div>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  "text-left text-sm font-medium text-muted-foreground",
                  column.sortable ? "cursor-pointer select-none hover:bg-accent" : "",
                )}
                onClick={() => column.sortable && handleSort(String(column.key))}
                role={column.sortable ? "button" : undefined}
                tabIndex={column.sortable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (column.sortable && e.key === "Enter") {
                    handleSort(String(column.key))
                  }
                }}
                scope="col"
                aria-sort={
                  sort?.key === String(column.key)
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {String(column.label)}
                {column.sortable && sort?.key === String(column.key) && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    {sort.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={String(row[rowKey])}>
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {formatValue(row[column.key], column.format)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && (
        <div className="p-4 border-t border-background flex items-center justify-between gap-2 text-sm">
          <div className="text-muted-foreground">
            Exibindo{" "}
            <span className="font-medium text-foreground">
              {Math.min(pagination.pageIndex * pagination.pageSize + 1, pagination.total)}
            </span>{" "}
            –{" "}
            <span className="font-medium text-foreground">
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, pagination.total)}
            </span>{" "}
            de <span className="font-medium">{pagination.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2 py-1">
              Página {pagination.pageIndex + 1}
            </Badge>
            <button
              onClick={() => handlePageChange(Math.max(0, pagination.pageIndex - 1))}
              disabled={pagination.pageIndex === 0}
              className="rounded-md border border-input px-3 py-1 text-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              Anterior
            </button>
            <button
              onClick={() =>
                handlePageChange(
                  Math.min(
                    Math.ceil(pagination.total / pagination.pageSize) - 1,
                    pagination.pageIndex + 1,
                  ),
                )
              }
              disabled={
                (pagination.pageIndex + 1) * pagination.pageSize >=
                pagination.total
              }
              className="rounded-md border border-input px-3 py-1 text-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
