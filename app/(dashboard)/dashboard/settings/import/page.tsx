import type { Metadata } from 'next'
import { ImportForm } from './import-form'

export const metadata: Metadata = { title: 'Import' }

export default function ImportPage() {
  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Import from CSV</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Drop in a CSV from Google Sheets or any other tracker. Columns are matched case-insensitively.
        </p>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-4 mb-6">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Expected columns</p>
        <code className="text-xs text-zinc-600 dark:text-zinc-300 font-mono block leading-relaxed">
          company, role, status, applied_at, source,<br />
          job_url, salary, location, notes,<br />
          next_step_at, next_step_label
        </code>
      </div>

      <ImportForm />
    </div>
  )
}
