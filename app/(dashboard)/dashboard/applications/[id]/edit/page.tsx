import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getApplicationById } from '@/lib/db/queries/applications'
import { ApplicationForm } from '@/components/application-form'
import { updateApplicationAction } from '../../actions'
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
  return { title: `Edit · ${app.company}` }
}

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const app = await getApplicationById(id, userId)
  if (!app) notFound()

  const action = updateApplicationAction.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Edit application</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {app.company} — {app.role}
        </p>
      </div>
      <ApplicationForm action={action} defaultValues={app} submitLabel="Save changes" />
    </div>
  )
}
