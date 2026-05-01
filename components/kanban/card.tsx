'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import type { Application } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

function NextStepBadge({ date }: { date: Date }) {
  const urgent = isPast(date) || isToday(date) || isTomorrow(date)
  const label = isToday(date)
    ? 'Today'
    : isTomorrow(date)
    ? 'Tomorrow'
    : isPast(date)
    ? `${format(date, 'MMM d')} (overdue)`
    : format(date, 'MMM d')

  return (
    <span
      className={cn(
        'text-xs font-mono',
        urgent ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-500'
      )}
    >
      {label}
    </span>
  )
}

export function KanbanCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: app.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-3 cursor-grab active:cursor-grabbing select-none',
        'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all',
        isDragging && 'opacity-50 shadow-lg rotate-1'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-1">
          {app.company}
        </p>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight line-clamp-1 mb-2">
        {app.role}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-300 dark:text-zinc-600 font-mono">
          {format(new Date(app.appliedAt), 'MMM d')}
        </span>
        {app.nextStepAt && <NextStepBadge date={new Date(app.nextStepAt)} />}
      </div>

      {/* Invisible link overlay — doesn't interfere with drag */}
      <Link
        href={`/dashboard/applications/${app.id}`}
        className="absolute inset-0 rounded-lg"
        onClick={(e) => {
          // Prevent navigation when drag ends
          if (document.querySelector('[data-dnd-dragging]')) e.preventDefault()
        }}
        tabIndex={-1}
        aria-hidden
      />
    </div>
  )
}

export function KanbanCardOverlay({ app }: { app: Application }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-3 shadow-xl rotate-2 w-52">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-1">
        {app.company}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight line-clamp-1 mt-1">
        {app.role}
      </p>
    </div>
  )
}
