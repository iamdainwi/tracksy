'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, Add01Icon } from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { KanbanBoard } from '@/components/kanban/board'
import { MobileListView } from './mobile-list-view'
import { STATUSES } from '@/lib/status'
import type { Application, ApplicationStatus } from '@/lib/db/schema'
import { updateApplicationStatusAction } from '@/app/(dashboard)/dashboard/applications/actions'

function groupByStatus(apps: Application[]) {
  const map = Object.fromEntries(
    STATUSES.map((s) => [s, [] as Application[]])
  ) as Record<ApplicationStatus, Application[]>
  for (const app of apps) map[app.status].push(app)
  return map
}

export function ApplicationsView({ initialApps }: { initialApps: Application[] }) {
  const [apps, setApps] = useState(initialApps)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return apps
    const q = query.toLowerCase()
    return apps.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q)
    )
  }, [apps, query])

  // Shared optimistic status change (used by both list and kanban)
  const handleStatusChange = useCallback((id: string, status: ApplicationStatus) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as string ?? null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setOverId(null)
      if (!over) return

      const activeApp = apps.find((a) => a.id === active.id)
      if (!activeApp) return

      const overStatus = STATUSES.includes(over.id as ApplicationStatus)
        ? (over.id as ApplicationStatus)
        : apps.find((a) => a.id === over.id)?.status

      if (!overStatus) return

      if (activeApp.status !== overStatus) {
        handleStatusChange(activeApp.id, overStatus)
        updateApplicationStatusAction(activeApp.id, overStatus)
      } else {
        const col = groupByStatus(apps)[overStatus]
        const oldIdx = col.findIndex((a) => a.id === active.id)
        const newIdx = col.findIndex((a) => a.id === over.id)
        if (oldIdx !== newIdx) {
          const reordered = arrayMove(col, oldIdx, newIdx)
          setApps((prev) => [
            ...prev.filter((a) => a.status !== overStatus),
            ...reordered,
          ])
        }
      }
    },
    [apps, handleStatusChange]
  )

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b">
        <h1 className="text-sm font-semibold hidden md:block shrink-0">Pipeline</h1>
        <div className="relative flex-1 max-w-72">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            strokeWidth={2}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or role…"
            className="pl-8 h-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground hidden sm:block tabular-nums">
            {filtered.length} / {apps.length}
          </span>
          {/* Desktop add button — FAB handles mobile */}
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/dashboard/applications/new">
              <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
              Add
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile: tabbed list */}
      <div className="md:hidden flex-1 min-h-0">
        <MobileListView apps={filtered} onStatusChange={handleStatusChange} />
      </div>

      {/* Desktop: kanban board */}
      <div className="hidden md:block px-6 pt-4 flex-1">
        <KanbanBoard
          apps={filtered}
          activeId={activeId}
          overId={overId}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  )
}
