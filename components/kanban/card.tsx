'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Application } from '@/lib/db/schema'

function NextStepChip({ date }: { date: Date }) {
  const overdue = isPast(date) && !isToday(date)
  const urgent = overdue || isToday(date) || isTomorrow(date)
  const label = isToday(date)
    ? 'Today'
    : isTomorrow(date)
    ? 'Tomorrow'
    : overdue
    ? `${format(date, 'MMM d')} ·  overdue`
    : format(date, 'MMM d')

  return (
    <span
      className={cn(
        'text-xs font-mono',
        urgent ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'
      )}
    >
      {label}
    </span>
  )
}

export function KanbanCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: app.id })

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'cursor-grab active:cursor-grabbing select-none transition-all',
        isDragging && 'opacity-50 shadow-xl rotate-1 scale-105'
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3 space-y-2">
        <div>
          <p className="text-sm font-medium leading-tight line-clamp-1 text-card-foreground">
            {app.company}
          </p>
          <p className="text-xs text-muted-foreground leading-tight line-clamp-2 mt-0.5">
            {app.role}
          </p>
        </div>

        <div className="flex items-center justify-between gap-1">
          <span className="text-xs text-muted-foreground/60 font-mono tabular-nums">
            {format(new Date(app.appliedAt), 'MMM d')}
          </span>
          {app.nextStepAt && <NextStepChip date={new Date(app.nextStepAt)} />}
        </div>
      </CardContent>

      {/* Non-interfering link — only navigates on click without drag */}
      <Link
        href={`/dashboard/applications/${app.id}`}
        className="absolute inset-0 rounded-[inherit]"
        tabIndex={-1}
        aria-hidden
      />
    </Card>
  )
}

export function KanbanCardOverlay({ app }: { app: Application }) {
  return (
    <Card className="w-52 shadow-2xl rotate-2 border-primary/20">
      <CardContent className="p-3 space-y-1">
        <p className="text-sm font-medium leading-tight line-clamp-1 text-card-foreground">
          {app.company}
        </p>
        <p className="text-xs text-muted-foreground leading-tight line-clamp-1">
          {app.role}
        </p>
        <Badge variant="outline" className="text-xs py-0 h-5">
          {app.status}
        </Badge>
      </CardContent>
    </Card>
  )
}
