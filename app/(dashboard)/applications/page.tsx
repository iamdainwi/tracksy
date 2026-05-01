import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserApplications } from '@/lib/db/queries/applications'
import { KanbanBoard } from '@/components/kanban/board'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pipeline' }

export default async function ApplicationsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const apps = await getUserApplications(userId)

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Pipeline</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {apps.length} application{apps.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/applications/new">Add application</Link>
        </Button>
      </div>

      <KanbanBoard initialApps={apps} />
    </div>
  )
}
