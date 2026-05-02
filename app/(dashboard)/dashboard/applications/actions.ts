'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  createApplication,
  updateApplication,
  deleteApplication,
} from '@/lib/db/queries/applications'
import type { ApplicationStatus, ApplicationSource } from '@/lib/db/schema'

export async function createApplicationAction(formData: FormData) {
  const userId = await requireAuth()

  const nextStepAtRaw = formData.get('nextStepAt') as string | null
  const appliedAtRaw = formData.get('appliedAt') as string | null

  await createApplication(userId, {
    company: formData.get('company') as string,
    role: formData.get('role') as string,
    status: (formData.get('status') as ApplicationStatus) ?? 'applied',
    source: (formData.get('source') as ApplicationSource) ?? null,
    jobUrl: (formData.get('jobUrl') as string) || null,
    salary: (formData.get('salary') as string) || null,
    location: (formData.get('location') as string) || null,
    notes: (formData.get('notes') as string) || null,
    nextStepAt: nextStepAtRaw ? new Date(nextStepAtRaw) : null,
    nextStepLabel: (formData.get('nextStepLabel') as string) || null,
    appliedAt: appliedAtRaw ? new Date(appliedAtRaw) : new Date(),
  })

  revalidatePath('/dashboard/applications')
  revalidateTag(`analytics:${userId}`, 'max')
}

export async function updateApplicationStatusAction(id: string, status: ApplicationStatus) {
  const userId = await requireAuth()
  await updateApplication(id, userId, { status })
  revalidatePath('/dashboard/applications')
  revalidateTag(`analytics:${userId}`, 'max')
}

export async function updateApplicationAction(id: string, formData: FormData) {
  const userId = await requireAuth()

  const nextStepAtRaw = formData.get('nextStepAt') as string | null
  const appliedAtRaw = formData.get('appliedAt') as string | null

  await updateApplication(id, userId, {
    company: formData.get('company') as string,
    role: formData.get('role') as string,
    status: formData.get('status') as ApplicationStatus,
    source: (formData.get('source') as ApplicationSource) || null,
    jobUrl: (formData.get('jobUrl') as string) || null,
    salary: (formData.get('salary') as string) || null,
    location: (formData.get('location') as string) || null,
    notes: (formData.get('notes') as string) || null,
    nextStepAt: nextStepAtRaw ? new Date(nextStepAtRaw) : null,
    nextStepLabel: (formData.get('nextStepLabel') as string) || null,
    appliedAt: appliedAtRaw ? new Date(appliedAtRaw) : undefined,
  })

  revalidatePath('/dashboard/applications')
  revalidatePath(`/dashboard/applications/${id}`)
  revalidateTag(`analytics:${userId}`, 'max')
}

export async function deleteApplicationAction(id: string) {
  const userId = await requireAuth()
  await deleteApplication(id, userId)
  revalidatePath('/dashboard/applications')
  revalidateTag(`analytics:${userId}`, 'max')
}
