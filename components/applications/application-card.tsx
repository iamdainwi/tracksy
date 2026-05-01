'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { HugeiconsIcon } from '@hugeicons/react'
import { MoreVerticalIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG, STATUSES } from '@/lib/status'
import { updateApplicationStatusAction } from '@/app/(dashboard)/dashboard/applications/actions'
import type { Application, ApplicationStatus } from '@/lib/db/schema'

function CompanyAvatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0 select-none">
      <span className="text-sm font-semibold text-accent-foreground leading-none">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

function NextStep({ date, label }: { date: Date; label: string | null }) {
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
        urgent ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'
      )}
    >
      {label ? `${label} · ` : ''}{dateLabel}
    </span>
  )
}

interface ApplicationCardProps {
  app: Application
  onStatusChange: (id: string, status: ApplicationStatus) => void
}

export function ApplicationCard({ app, onStatusChange }: ApplicationCardProps) {
  const [isPending, startTransition] = useTransition()
  const config = STATUS_CONFIG[app.status]

  function handleStatusChange(newStatus: ApplicationStatus) {
    onStatusChange(app.id, newStatus)
    startTransition(() => updateApplicationStatusAction(app.id, newStatus))
  }

  return (
    <Card className={cn('transition-opacity', isPending && 'opacity-60')}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <CompanyAvatar name={app.company} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/dashboard/applications/${app.id}`}
                className="flex-1 min-w-0"
              >
                <p className="font-medium text-sm leading-tight text-foreground line-clamp-1">
                  {app.company}
                </p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                  {app.role}
                </p>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-xs" className="shrink-0 -mr-1 -mt-0.5">
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
            </div>

            <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs gap-1.5 py-0 h-5">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
                  {config.label}
                </Badge>
                {app.source && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {app.source.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {app.nextStepAt ? (
                  <NextStep date={new Date(app.nextStepAt)} label={app.nextStepLabel} />
                ) : (
                  <span className="text-xs text-muted-foreground font-mono tabular-nums">
                    {format(new Date(app.appliedAt), 'MMM d')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
