import { ApplicationForm } from '@/components/application-form'
import { createApplicationAction } from '../actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New application' }

export default function NewApplicationPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">New application</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Log a job you've applied for or plan to apply to.
        </p>
      </div>
      <ApplicationForm action={createApplicationAction} submitLabel="Add application" />
    </div>
  )
}
