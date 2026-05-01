import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { format } from 'date-fns'
import { getApplicationById } from '@/lib/db/queries/applications'
import { Button } from '@/components/ui/button'
import { DeleteApplicationButton } from './delete-button'
import { Edit01Icon, Link01Icon, ArrowLeft01Icon } from 'hugeicons-react'
import type { Metadata } from 'next'
import type { ApplicationStatus } from '@/lib/db/schema'

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied:   'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50',
  screening: 'bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/50',
  interview: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50',
  offer:     'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50',
  rejected:  'bg-zinc-100 text-zinc-500 border-zinc-200/80 dark:bg-zinc-800/40 dark:text-zinc-500 dark:border-zinc-700/50',
  ghosted:   'bg-zinc-100 text-zinc-400 border-zinc-200/80 dark:bg-zinc-800/40 dark:text-zinc-500 dark:border-zinc-700/50',
}

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
  const app = await getApplicationById(id, userId)
  if (!app) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard/applications"
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft01Icon className="w-4 h-4" aria-hidden />
        </Link>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">/</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{app.company}</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{app.company}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{app.role}</p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded border text-xs font-mono font-medium shrink-0 ${STATUS_STYLES[app.status]}`}
        >
          {app.status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Applied', value: format(new Date(app.appliedAt), 'MMM d, yyyy') },
          { label: 'Source', value: app.source?.replace('_', ' ') ?? '—' },
          { label: 'Location', value: app.location ?? '—' },
          { label: 'Salary', value: app.salary ?? '—' },
          {
            label: 'Next step',
            value: app.nextStepAt
              ? `${app.nextStepLabel ?? 'Deadline'} · ${format(new Date(app.nextStepAt), 'MMM d')}`
              : '—',
          },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">{value}</p>
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
          <Link01Icon className="w-3.5 h-3.5" aria-hidden />
          View job posting
        </a>
      )}

      {app.notes && (
        <div className="mb-8">
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Notes
          </p>
          <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 p-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {app.notes}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <Button asChild size="sm">
          <Link href={`/dashboard/applications/${app.id}/edit`}>
            <Edit01Icon className="w-3.5 h-3.5" aria-hidden />
            Edit
          </Link>
        </Button>
        <DeleteApplicationButton id={app.id} />
      </div>
    </div>
  )
}
