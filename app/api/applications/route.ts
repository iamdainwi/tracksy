import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import {
  getUserApplications,
  createApplication,
} from '@/lib/db/queries/applications'

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  status: z.enum(['applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted']).optional(),
  appliedAt: z.string().datetime().optional(),
  source: z.enum(['linkedin', 'referral', 'direct', 'job_board', 'recruiter', 'other']).nullable().optional(),
  jobUrl: z.string().url().nullable().optional(),
  salary: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  nextStepAt: z.string().datetime().nullable().optional(),
  nextStepLabel: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const statusParam = searchParams.get('status')
  const validStatuses = ['applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted'] as const
  type ValidStatus = typeof validStatuses[number]
  const status: ValidStatus | undefined =
    statusParam && (validStatuses as readonly string[]).includes(statusParam)
      ? (statusParam as ValidStatus)
      : undefined
  const search = searchParams.get('search') ?? undefined

  const rows = await getUserApplications(userId, { status, search })

  return Response.json(rows)
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { appliedAt, nextStepAt, ...rest } = parsed.data
  const app = await createApplication(userId, {
    ...rest,
    appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
    nextStepAt: nextStepAt ? new Date(nextStepAt) : null,
  })

  return Response.json(app, { status: 201 })
}
