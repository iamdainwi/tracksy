import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import {
  getApplicationById,
  updateApplication,
  deleteApplication,
} from '@/lib/db/queries/applications'

const patchSchema = z.object({
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  status: z.enum(['applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted']).optional(),
  source: z.enum(['linkedin', 'referral', 'direct', 'job_board', 'recruiter', 'other']).nullable().optional(),
  jobUrl: z.string().url().nullable().optional(),
  salary: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  nextStepAt: z.string().datetime().nullable().optional(),
  nextStepLabel: z.string().nullable().optional(),
  appliedAt: z.string().datetime().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const app = await getApplicationById(id, userId)
  if (!app) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json(app)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { nextStepAt, appliedAt, ...rest } = parsed.data
  const app = await updateApplication(id, userId, {
    ...rest,
    ...(appliedAt !== undefined && { appliedAt: new Date(appliedAt) }),
    ...(nextStepAt !== undefined && { nextStepAt: nextStepAt ? new Date(nextStepAt) : null }),
  })

  if (!app) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(app)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const app = await deleteApplication(id, userId)
  if (!app) return Response.json({ error: 'Not found' }, { status: 404 })

  return new Response(null, { status: 204 })
}
