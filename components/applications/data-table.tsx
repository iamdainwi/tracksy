'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type FilterFn,
} from '@tanstack/react-table'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { HugeiconsIcon } from '@hugeicons/react'
import { MoreVerticalIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG, STATUSES } from '@/lib/status'
import { updateApplicationStatusAction } from '@/app/(dashboard)/dashboard/applications/actions'
import type { Application, ApplicationStatus } from '@/lib/db/schema'

// ── Helpers ────────────────────────────────────────────────────────────────

function CompanyAvatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 select-none">
      <span className="text-xs font-semibold text-accent-foreground leading-none">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

function NextStepCell({ date, label }: { date: Date; label: string | null }) {
  const overdue = isPast(date) && !isToday(date)
  const today = isToday(date)
  const tomorrow = isTomorrow(date)
  const urgent = overdue || today || tomorrow

  const dateLabel = today
    ? 'Today'
    : tomorrow
    ? 'Tomorrow'
    : overdue
    ? `${format(date, 'MMM d')} · overdue`
    : format(date, 'MMM d')

  return (
    <span
      className={cn(
        'text-xs font-mono tabular-nums',
        urgent
          ? 'text-amber-600 dark:text-amber-400 font-medium'
          : 'text-muted-foreground'
      )}
    >
      {label ? `${label} · ` : ''}{dateLabel}
    </span>
  )
}

function SortHeader({
  label,
  sorted,
  onSort,
}: {
  label: string
  sorted: false | 'asc' | 'desc'
  onSort: () => void
}) {
  return (
    <button
      onClick={onSort}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
    >
      {label}
      <span className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
        {sorted === 'asc' ? ' ↑' : sorted === 'desc' ? ' ↓' : ' ↕'}
      </span>
    </button>
  )
}

// ── Actions cell ──────────────────────────────────────────────────────────

function ActionsCell({
  app,
  onStatusChange,
}: {
  app: Application
  onStatusChange: (id: string, status: ApplicationStatus) => void
}) {
  const [, startTransition] = useTransition()

  function handleStatusChange(newStatus: ApplicationStatus) {
    onStatusChange(app.id, newStatus)
    startTransition(() => updateApplicationStatusAction(app.id, newStatus))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <HugeiconsIcon icon={MoreVerticalIcon} size={14} strokeWidth={2} />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs">Move to</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUSES.filter((s) => s !== app.status).map((s) => (
          <DropdownMenuItem
            key={s}
            className="text-sm gap-2"
            onSelect={() => handleStatusChange(s)}
          >
            <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_CONFIG[s].dot)} />
            {STATUS_CONFIG[s].label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="text-sm gap-2">
          <Link href={`/dashboard/applications/${app.id}`}>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
            Open detail
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Column definitions ─────────────────────────────────────────────────────

function buildColumns(
  onStatusChange: (id: string, status: ApplicationStatus) => void
): ColumnDef<Application>[] {
  return [
    {
      id: 'company',
      accessorKey: 'company',
      header: ({ column }) => (
        <SortHeader
          label="Company"
          sorted={column.getIsSorted()}
          onSort={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/applications/${row.original.id}`}
          className="flex items-center gap-3 min-w-0 group/link"
        >
          <CompanyAvatar name={row.original.company} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground group-hover/link:underline underline-offset-2 line-clamp-1">
              {row.original.company}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {row.original.role}
            </p>
          </div>
        </Link>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      filterFn: 'arrIncludes' as unknown as FilterFn<Application>,
      header: () => (
        <span className="text-xs font-medium text-muted-foreground">Status</span>
      ),
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status]
        return (
          <Badge variant="outline" className="text-xs gap-1.5 py-0 h-5 font-normal">
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
            {cfg.label}
          </Badge>
        )
      },
    },
    {
      id: 'appliedAt',
      accessorKey: 'appliedAt',
      sortingFn: 'datetime',
      header: ({ column }) => (
        <SortHeader
          label="Applied"
          sorted={column.getIsSorted()}
          onSort={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          {format(new Date(row.original.appliedAt), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      id: 'nextStep',
      accessorFn: (row) => row.nextStepAt ?? null,
      sortingFn: (a, b) => {
        const aVal = a.original.nextStepAt ? new Date(a.original.nextStepAt).getTime() : Infinity
        const bVal = b.original.nextStepAt ? new Date(b.original.nextStepAt).getTime() : Infinity
        return aVal - bVal
      },
      header: ({ column }) => (
        <SortHeader
          label="Next step"
          sorted={column.getIsSorted()}
          onSort={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        />
      ),
      cell: ({ row }) =>
        row.original.nextStepAt ? (
          <NextStepCell
            date={new Date(row.original.nextStepAt)}
            label={row.original.nextStepLabel}
          />
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        ),
    },
    {
      id: 'source',
      accessorKey: 'source',
      header: () => (
        <span className="text-xs font-medium text-muted-foreground">Source</span>
      ),
      cell: ({ row }) =>
        row.original.source ? (
          <span className="text-xs text-muted-foreground capitalize">
            {row.original.source.replace('_', ' ')}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        ),
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <ActionsCell app={row.original} onStatusChange={onStatusChange} />
      ),
    },
  ]
}

// ── Main component ─────────────────────────────────────────────────────────

interface ApplicationsTableProps {
  apps: Application[]
  onStatusChange: (id: string, status: ApplicationStatus) => void
}

export function ApplicationsTable({ apps, onStatusChange }: ApplicationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'appliedAt', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [activeStatuses, setActiveStatuses] = useState<ApplicationStatus[]>([])

  const columns = buildColumns(onStatusChange)

  const tableData = apps

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  function toggleStatus(status: ApplicationStatus) {
    const next = activeStatuses.includes(status)
      ? activeStatuses.filter((s) => s !== status)
      : [...activeStatuses, status]
    setActiveStatuses(next)
    if (next.length === 0) {
      table.getColumn('status')?.setFilterValue(undefined)
    } else {
      table.getColumn('status')?.setFilterValue(next)
    }
  }

  const rows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-3">
      {/* Status filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {STATUSES.map((status) => {
          const cfg = STATUS_CONFIG[status]
          const active = activeStatuses.includes(status)
          const count = apps.filter((a) => a.status === status).length
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                active
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
              {cfg.label}
              {count > 0 && (
                <span className={cn('tabular-nums', active ? 'opacity-70' : 'opacity-50')}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
        {activeStatuses.length > 0 && (
          <button
            onClick={() => {
              setActiveStatuses([])
              table.getColumn('status')?.setFilterValue(undefined)
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors ml-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="h-9 bg-muted/30">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group/row cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <p className="text-sm text-muted-foreground">No applications found</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {activeStatuses.length > 0
                      ? 'Try clearing the status filter'
                      : 'Add your first application to get started'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {rows.length > 0 && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {rows.length} of {apps.length} applications
        </p>
      )}
    </div>
  )
}
