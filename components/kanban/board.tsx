'use client'

import { useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from './column'
import { KanbanCardOverlay } from './card'
import { STATUSES } from '@/lib/status'
import type { Application, ApplicationStatus } from '@/lib/db/schema'
import { updateApplicationStatusAction } from '@/app/(dashboard)/dashboard/applications/actions'

function groupByStatus(apps: Application[]) {
  const map = Object.fromEntries(
    STATUSES.map((s) => [s, [] as Application[]])
  ) as Record<ApplicationStatus, Application[]>
  for (const app of apps) {
    map[app.status].push(app)
  }
  return map
}

interface KanbanBoardProps {
  apps: Application[]
  activeId: string | null
  overId: string | null
  onDragStart: (event: DragStartEvent) => void
  onDragOver: (event: DragOverEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}

export function KanbanBoard({
  apps,
  activeId,
  overId,
  onDragStart,
  onDragOver,
  onDragEnd,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  )

  const columns = groupByStatus(apps)
  const activeApp = activeId ? apps.find((a) => a.id === activeId) ?? null : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-6" style={{ minHeight: 'calc(100vh - 12rem)' }}>
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            apps={columns[status]}
            isOver={
              overId === status ||
              apps.find((a) => a.id === overId)?.status === status
            }
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp && <KanbanCardOverlay app={activeApp} />}
      </DragOverlay>
    </DndContext>
  )
}
