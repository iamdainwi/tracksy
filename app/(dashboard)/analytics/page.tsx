import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAnalytics } from '@/lib/db/queries/analytics'
import { StatsRow } from '@/components/analytics/stats-row'
import { ResponseChart } from '@/components/analytics/response-chart'
import { Funnel } from '@/components/analytics/funnel'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics' }

export default async function AnalyticsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const data = await getAnalytics(userId)

  const stats = [
    { label: 'Applications', value: data.total },
    { label: 'Response rate', value: `${data.responseRate}%` },
    { label: 'Interviews', value: data.byStatus.interview ?? 0 },
    { label: 'Offers', value: data.byStatus.offer ?? 0 },
  ]

  return (
    <div className="px-4 md:px-6 py-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Analytics</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Your search at a glance
        </p>
      </div>

      <StatsRow stats={stats} />

      <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-5">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
          Weekly activity
        </p>
        <ResponseChart data={data.weeks} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-5">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            Conversion funnel
          </p>
          <Funnel stages={data.funnel} />
        </div>

        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-5">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            By source
          </p>
          {data.bySource.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.bySource.map((s) => (
                <div key={s.source} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">{s.source}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                      {s.applied} applied
                    </span>
                    <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 tabular-nums w-8 text-right">
                      {s.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
