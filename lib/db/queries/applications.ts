import { db } from '@/lib/db'
import { applications, reminders } from '@/lib/db/schema'
import type { NewApplication, ApplicationStatus } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { subHours } from 'date-fns'

export async function getUserApplications(
  userId: string,
  filters?: { status?: ApplicationStatus; search?: string }
) {
  const conditions = [eq(applications.userId, userId)]

  if (filters?.status) {
    conditions.push(eq(applications.status, filters.status))
  }

  const rows = await db
    .select()
    .from(applications)
    .where(and(...conditions))
    .orderBy(desc(applications.createdAt))

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    return rows.filter(
      (r) =>
        r.company.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
    )
  }

  return rows
}

export async function getApplicationById(id: string, userId: string) {
  const rows = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .limit(1)
  return rows[0] ?? null
}

export async function createApplication(
  userId: string,
  data: Omit<NewApplication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
) {
  const rows = await db
    .insert(applications)
    .values({ ...data, userId })
    .returning()
  const app = rows[0]

  if (app.nextStepAt) {
    await scheduleReminder(app.id, app.nextStepAt)
  }

  return app
}

export async function updateApplication(
  id: string,
  userId: string,
  data: Partial<Omit<NewApplication, 'id' | 'userId' | 'createdAt'>>
) {
  const rows = await db
    .update(applications)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .returning()
  const app = rows[0]
  if (!app) return null

  if ('nextStepAt' in data) {
    // Clear old unsent reminders and reschedule
    await db
      .delete(reminders)
      .where(
        and(eq(reminders.applicationId, id), sql`${reminders.sentAt} IS NULL`)
      )
    if (app.nextStepAt) {
      await scheduleReminder(app.id, app.nextStepAt)
    }
  }

  return app
}

export async function deleteApplication(id: string, userId: string) {
  const rows = await db
    .delete(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .returning()
  return rows[0] ?? null
}

async function scheduleReminder(applicationId: string, nextStepAt: Date) {
  const scheduledFor = subHours(nextStepAt, 48)
  if (scheduledFor <= new Date()) return
  await db.insert(reminders).values({ applicationId, scheduledFor })
}
