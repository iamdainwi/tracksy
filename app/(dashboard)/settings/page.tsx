import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileImportIcon, Download01Icon } from 'hugeicons-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Settings</h1>
      </div>

      {/* Account */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Account
        </h2>
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {user?.fullName ?? '—'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {user?.emailAddresses[0]?.emailAddress ?? '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Data
        </h2>
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Import from CSV</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Bulk-import applications from a Google Sheet or other tracker.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/settings/import">
                <FileImportIcon className="w-3.5 h-3.5" aria-hidden />
                Import
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Export to CSV</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Download all your applications as a CSV file.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/api/export" download>
                <Download01Icon className="w-3.5 h-3.5" aria-hidden />
                Export
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Danger zone
        </h2>
        <div className="bg-white dark:bg-zinc-900/40 border border-red-200/60 dark:border-red-900/40 rounded-xl p-4">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Delete account</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
            Export your data first.
          </p>
          <Button variant="destructive" size="sm" disabled>
            Delete account
          </Button>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
            Contact support to delete your account.
          </p>
        </div>
      </section>
    </div>
  )
}
