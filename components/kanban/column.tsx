'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './card'
import type { Application, ApplicationStatus } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; dot: string; accent: string }
> = {
  applied:   { label: 'Applied',   dot: 'bg-blue-500',    accent: 'border-blue-200/60 dark:border-blue-800/40' },
  screening: { label: 'Screening', dot: 'bg-violet-500',  accent: 'border-violet-200/60 dark:border-violet-800/40' },
  interview: { label: 'Interview', dot: 'bg-amber-500',   accent: 'border-amber-200/60 dark:border-amber-800/40' },
  offer:     { label: 'Offer',     dot: 'bg-emerald-500', accent: 'border-emerald-200/60 dark:border-emerald-800/40' },
  rejected:  { label: 'Rejected',  dot: 'bg-zinc-400',    accent: 'border-zinc-200/60 dark:border-zinc-700/40' },
  ghosted:   { label: 'Ghosted',   dot: 'bg-zinc-300',    accent: 'border-zinc-200/60 dark:border-zinc-700/40' },
}

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
        'flex flex-col min-w-52 w-52 shrink-0 rounded-xl border bg-zinc-50 dark:bg-zinc-900/40 transition-colors',
        isOver ? config.accent : 'border-zinc-200/60 dark:border-zinc-800/60'
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <span className={cn('w-2 h-2 rounded-full shrink-0', config.dot)} aria-hidden />
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{config.label}</span>
        <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-600 tabular-nums">{apps.length}</span>
      </div>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 flex-1 min-h-24">
          {apps.map((app) => (
            <div key={app.id} className="relative">
              <KanbanCard app={app} />
            </div>
          ))}
          {apps.length === 0 && (
            <div className="flex items-center justify-center flex-1 text-xs text-zinc-300 dark:text-zinc-700 py-4">
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
