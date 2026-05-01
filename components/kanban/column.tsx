'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG } from '@/lib/status'
import type { Application, ApplicationStatus } from '@/lib/db/schema'

interface KanbanColumnProps {
  status: ApplicationStatus
  apps: Application[]
  isOver: boolean
}

export function KanbanColumn({ status, apps, isOver }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status })
  const config = STATUS_CONFIG[status]
  const ids = apps.map((a) => a.id)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-52 w-52 shrink-0 rounded-xl border bg-muted/30 transition-colors',
        isOver && 'ring-2 ' + config.ring
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b">
        <span className={cn('w-2 h-2 rounded-full shrink-0', config.dot)} aria-hidden />
        <span className="text-xs font-medium text-foreground">{config.label}</span>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{apps.length}</span>
      </div>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-2 min-h-24">
            {apps.map((app) => (
              <div key={app.id} className="relative">
                <KanbanCard app={app} />
              </div>
            ))}
            {apps.length === 0 && (
              <div className="flex items-center justify-center py-6 text-xs text-muted-foreground/50 border-2 border-dashed rounded-lg m-1">
                Drop here
              </div>
            )}
          </div>
        </ScrollArea>
      </SortableContext>
    </div>
  )
}
