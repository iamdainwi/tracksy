import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { format } from 'date-fns'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit01Icon, Link01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { getApplicationById } from '@/lib/db/queries/applications'
import { getChecklistItems } from '@/lib/db/queries/checklist'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteApplicationButton } from './delete-button'
import { PrepChecklist } from './checklist'
import { STATUS_CONFIG } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { userId } = await auth()
  if (!userId) return {}
  const { id } = await params
  const app = await getApplicationById(id, userId)
  if (!app) return { title: 'Not found' }
  return { title: `${app.company} — ${app.role}` }
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const [app, checklistItems] = await Promise.all([
    getApplicationById(id, userId),
    getChecklistItems(id, userId),
  ])
  if (!app) notFound()

  const config = STATUS_CONFIG[app.status]

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <Link
          href="/dashboard/applications"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={2} />
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-muted-foreground">{app.company}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0 select-none">
            <span className="text-sm font-semibold text-accent-foreground">
              {app.company.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-semibold">{app.company}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{app.role}</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 shrink-0">
          <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
          {config.label}
        </Badge>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5 mb-8 p-4 rounded-xl border bg-muted/20">
        {[
          { label: 'Applied',   value: format(new Date(app.appliedAt), 'MMM d, yyyy') },
          { label: 'Source',    value: app.source?.replace('_', ' ') ?? '—' },
          { label: 'Location',  value: app.location ?? '—' },
          { label: 'Salary',    value: app.salary ?? '—' },
          {
            label: 'Next step',
            value: app.nextStepAt
              ? `${app.nextStepLabel ?? 'Deadline'} · ${format(new Date(app.nextStepAt), 'MMM d')}`
              : '—',
          },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-sm capitalize">{value}</p>
          </div>
        ))}
      </div>

      {app.jobUrl && (
        <a
          href={app.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-500 hover:underline underline-offset-2 mb-8"
        >
          <HugeiconsIcon icon={Link01Icon} size={13} strokeWidth={2} />
          View job posting
        </a>
      )}

      {/* Prep checklist */}
      <div className="mb-8 p-4 rounded-xl border">
        <PrepChecklist
          applicationId={app.id}
          initialItems={checklistItems ?? []}
        />
      </div>

      {/* Notes */}
      {app.notes && (
        <div className="mb-8">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Notes
          </p>
          <div className="bg-muted/20 rounded-xl border p-4">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {app.notes}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button asChild size="sm">
          <Link href={`/dashboard/applications/${app.id}/edit`}>
            <HugeiconsIcon icon={Edit01Icon} size={13} strokeWidth={2} />
            Edit
          </Link>
        </Button>
        <DeleteApplicationButton id={app.id} />
      </div>
    </div>
  )
}
