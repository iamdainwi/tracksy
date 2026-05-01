import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserApplications } from '@/lib/db/queries/applications'
import { ApplicationsView } from '@/components/applications/applications-view'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pipeline' }

export default async function ApplicationsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const apps = await getUserApplications(userId)

  return <ApplicationsView initialApps={apps} />
}
