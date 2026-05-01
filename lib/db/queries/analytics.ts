import { db } from '@/lib/db'
import { applications } from '@/lib/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'
import { subWeeks, startOfWeek, endOfWeek, format } from 'date-fns'

export async function getAnalytics(userId: string) {
  const all = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))

  const total = all.length
  const byStatus = Object.fromEntries(
    ['applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted'].map((s) => [
      s,
      all.filter((a) => a.status === s).length,
    ])
  ) as Record<string, number>

  // Response rate = anything that moved past 'applied'
  const responded = all.filter((a) => a.status !== 'applied' && a.status !== 'ghosted').length
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

  // Conversion funnel
  const funnel = [
    { stage: 'Applied', count: total },
    { stage: 'Screening', count: byStatus.screening + byStatus.interview + byStatus.offer },
    { stage: 'Interview', count: byStatus.interview + byStatus.offer },
    { stage: 'Offer', count: byStatus.offer },
  ]

  // Weekly breakdown — last 8 weeks
  const weeks: { label: string; applied: number; responses: number }[] = []
  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i))
    const weekEnd = endOfWeek(weekStart)
    const weekApps = all.filter((a) => {
      const d = new Date(a.appliedAt)
      return d >= weekStart && d <= weekEnd
    })
    const weekResponses = weekApps.filter(
      (a) => a.status !== 'applied' && a.status !== 'ghosted'
    )
    weeks.push({
      label: format(weekStart, 'MMM d'),
      applied: weekApps.length,
      responses: weekResponses.length,
    })
  }

  // Source breakdown
  const sourceMap: Record<string, { applied: number; responses: number }> = {}
  for (const app of all) {
    const src = app.source ?? 'unknown'
    if (!sourceMap[src]) sourceMap[src] = { applied: 0, responses: 0 }
    sourceMap[src].applied++
    if (app.status !== 'applied' && app.status !== 'ghosted') {
      sourceMap[src].responses++
    }
  }
  const bySource = Object.entries(sourceMap)
    .map(([source, data]) => ({
      source: source.replace('_', ' '),
      ...data,
      rate: data.applied > 0 ? Math.round((data.responses / data.applied) * 100) : 0,
    }))
    .sort((a, b) => b.applied - a.applied)

  return { total, byStatus, responseRate, funnel, weeks, bySource }
}
