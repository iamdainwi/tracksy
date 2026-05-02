'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from '@/lib/db/queries/checklist'

export async function addChecklistItemAction(applicationId: string, text: string) {
  const userId = await requireAuth()
  await addChecklistItem(applicationId, userId, text.trim())
  revalidatePath(`/dashboard/applications/${applicationId}`)
}

export async function toggleChecklistItemAction(id: string, applicationId: string, done: boolean) {
  const userId = await requireAuth()
  await toggleChecklistItem(id, userId, done)
  revalidatePath(`/dashboard/applications/${applicationId}`)
}

export async function deleteChecklistItemAction(id: string, applicationId: string) {
  const userId = await requireAuth()
  await deleteChecklistItem(id, userId)
  revalidatePath(`/dashboard/applications/${applicationId}`)
}
