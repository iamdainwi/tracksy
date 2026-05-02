import { cache } from 'react'
import { db } from '@/lib/db'
import { checklistItems, applications } from '@/lib/db/schema'
import type { ChecklistItem } from '@/lib/db/schema'
import { eq, and, asc, sql, inArray } from 'drizzle-orm'

export const getChecklistItems = cache(async (
  applicationId: string,
  userId: string
): Promise<ChecklistItem[] | null> => {
  // Single JOIN: verifies ownership and fetches items in one round-trip
  const rows = await db
    .select({
      id: checklistItems.id,
      applicationId: checklistItems.applicationId,
      text: checklistItems.text,
      done: checklistItems.done,
      position: checklistItems.position,
      createdAt: checklistItems.createdAt,
    })
    .from(checklistItems)
    .innerJoin(
      applications,
      and(
        eq(checklistItems.applicationId, applications.id),
        eq(applications.userId, userId),
        eq(applications.id, applicationId)
      )
    )
    .orderBy(asc(checklistItems.position), asc(checklistItems.createdAt))

  // If app doesn't belong to user, inner join returns empty — distinguish from "zero items"
  // by checking application ownership separately only when rows is empty
  if (rows.length === 0) {
    const appExists = await db
      .select({ id: applications.id })
      .from(applications)
      .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
      .limit(1)
    return appExists[0] ? [] : null
  }

  return rows
})

export async function addChecklistItem(applicationId: string, userId: string, text: string) {
  // Verify ownership + get next position in two parallel queries
  const [appCheck, positionResult] = await Promise.all([
    db
      .select({ id: applications.id })
      .from(applications)
      .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
      .limit(1),
    db
      .select({ maxPos: sql<number>`coalesce(max(${checklistItems.position}), -1)::int` })
      .from(checklistItems)
      .where(eq(checklistItems.applicationId, applicationId)),
  ])

  if (!appCheck[0]) throw new Error('Not found')

  const position = (positionResult[0]?.maxPos ?? -1) + 1
  const rows = await db
    .insert(checklistItems)
    .values({ applicationId, text, position })
    .returning()
  return rows[0]
}

export async function toggleChecklistItem(id: string, userId: string, done: boolean) {
  // Single UPDATE with ownership-verifying subquery — 1 round-trip
  const rows = await db
    .update(checklistItems)
    .set({ done })
    .where(
      and(
        eq(checklistItems.id, id),
        inArray(
          checklistItems.applicationId,
          db.select({ id: applications.id }).from(applications).where(eq(applications.userId, userId))
        )
      )
    )
    .returning()
  return rows[0] ?? null
}

export async function deleteChecklistItem(id: string, userId: string) {
  // Single DELETE with ownership-verifying subquery — 1 round-trip
  await db
    .delete(checklistItems)
    .where(
      and(
        eq(checklistItems.id, id),
        inArray(
          checklistItems.applicationId,
          db.select({ id: applications.id }).from(applications).where(eq(applications.userId, userId))
        )
      )
    )
}
