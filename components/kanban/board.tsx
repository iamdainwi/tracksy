'use client'

import { useState, useCallback } from 'react'
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
import type { Application, ApplicationStatus } from '@/lib/db/schema'
import { updateApplicationStatusAction } from '@/app/(dashboard)/applications/actions'

const STATUSES: ApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'ghosted',
]

function groupByStatus(apps: Application[]) {
  const map = Object.fromEntries(
    STATUSES.map((s) => [s, [] as Application[]])
  ) as Record<ApplicationStatus, Application[]>
  for (const app of apps) {
    map[app.status].push(app)
  }
  return map
}

export function KanbanBoard({ initialApps }: { initialApps: Application[] }) {
  const [apps, setApps] = useState(initialApps)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const columns = groupByStatus(apps)
  const activeApp = activeId ? apps.find((a) => a.id === activeId) ?? null : null

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

      // over.id is either a status string (column) or another card's id
      const overStatus = STATUSES.includes(over.id as ApplicationStatus)
        ? (over.id as ApplicationStatus)
        : apps.find((a) => a.id === over.id)?.status

      if (!overStatus) return

      if (activeApp.status !== overStatus) {
        // Optimistic update
        setApps((prev) =>
          prev.map((a) => (a.id === activeApp.id ? { ...a, status: overStatus } : a))
        )
        updateApplicationStatusAction(activeApp.id, overStatus)
      } else {
        // Reorder within same column
        const col = columns[overStatus]
        const oldIdx = col.findIndex((a) => a.id === active.id)
        const newIdx = col.findIndex((a) => a.id === over.id)
        if (oldIdx !== newIdx) {
          const reordered = arrayMove(col, oldIdx, newIdx)
          setApps((prev) => {
            const rest = prev.filter((a) => a.status !== overStatus)
            return [...rest, ...reordered]
          })
        }
      }
    },
    [apps, columns]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-8rem)]">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            apps={columns[status]}
            isOver={overId === status || apps.find((a) => a.id === overId)?.status === status}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp && <KanbanCardOverlay app={activeApp} />}
      </DragOverlay>
    </DndContext>
  )
}
