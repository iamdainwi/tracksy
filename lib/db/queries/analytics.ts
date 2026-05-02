import { db } from '@/lib/db'
import { applications } from '@/lib/db/schema'
import { eq, sql, and, gte } from 'drizzle-orm'
import { subWeeks, format } from 'date-fns'
import { unstable_cache } from 'next/cache'

async function _getAnalytics(userId: string) {
  const eightWeeksAgo = subWeeks(new Date(), 8)

  const [statusRows, weeklyRows, sourceRows] = await Promise.all([
    // Single GROUP BY for all status counts + total
    db
      .select({
        status: applications.status,
        count: sql<number>`count(*)::int`,
      })
      .from(applications)
      .where(eq(applications.userId, userId))
      .groupBy(applications.status),

    // Weekly applied + responses via SQL filter aggregate
    db
      .select({
        weekStart: sql<string>`date_trunc('week', ${applications.appliedAt})::text`,
        applied: sql<number>`count(*)::int`,
        responses: sql<number>`count(*) filter (where ${applications.status} not in ('applied', 'ghosted'))::int`,
      })
      .from(applications)
      .where(and(eq(applications.userId, userId), gte(applications.appliedAt, eightWeeksAgo)))
      .groupBy(sql`date_trunc('week', ${applications.appliedAt})`)
      .orderBy(sql`date_trunc('week', ${applications.appliedAt})`),

    // Source breakdown via SQL GROUP BY
    db
      .select({
        source: sql<string>`coalesce(${applications.source}::text, 'unknown')`,
        applied: sql<number>`count(*)::int`,
        responses: sql<number>`count(*) filter (where ${applications.status} not in ('applied', 'ghosted'))::int`,
      })
      .from(applications)
      .where(eq(applications.userId, userId))
      .groupBy(sql`coalesce(${applications.source}::text, 'unknown')`)
      .orderBy(sql`count(*) desc`),
  ])

  const byStatus = Object.fromEntries(statusRows.map((r) => [r.status, r.count])) as Record<string, number>
  const total = statusRows.reduce((sum, r) => sum + r.count, 0)
  const responded = (byStatus.screening ?? 0) + (byStatus.interview ?? 0) + (byStatus.offer ?? 0)
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

  const funnel = [
    { stage: 'Applied',   count: total },
    { stage: 'Screening', count: (byStatus.screening ?? 0) + (byStatus.interview ?? 0) + (byStatus.offer ?? 0) },
    { stage: 'Interview', count: (byStatus.interview ?? 0) + (byStatus.offer ?? 0) },
    { stage: 'Offer',     count: byStatus.offer ?? 0 },
  ]

  const weeks = weeklyRows.map((r) => ({
    label: format(new Date(r.weekStart), 'MMM d'),
    applied: r.applied,
    responses: r.responses,
  }))

  const bySource = sourceRows.map((r) => ({
    source: r.source.replace('_', ' '),
    applied: r.applied,
    responses: r.responses,
    rate: r.applied > 0 ? Math.round((r.responses / r.applied) * 100) : 0,
  }))

  return { total, byStatus, responseRate, funnel, weeks, bySource }
}

export const getAnalytics = (userId: string) =>
  unstable_cache(_getAnalytics, ['analytics', userId], {
    revalidate: 300,
    tags: [`analytics:${userId}`],
  })(userId)
