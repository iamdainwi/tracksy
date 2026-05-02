import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { applications } from '@/lib/db/schema'
import { parseCSV } from '@/lib/csv'
import { rateLimit } from '@/lib/rate-limit'

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = rateLimit(`POST:import:${userId}`, { max: 3, windowMs: 60_000 })
  if (!rl.ok) {
    return Response.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(rl.retryAfter) }
    })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const uploadedFile = file as File
  if (uploadedFile.size > MAX_FILE_SIZE) {
    return Response.json({ error: 'File too large. Maximum size is 1MB.' }, { status: 413 })
  }

  const text = await uploadedFile.text()

  let rows: ReturnType<typeof parseCSV>
  try {
    rows = parseCSV(text, userId)
  } catch {
    return Response.json({ error: 'Failed to parse CSV' }, { status: 422 })
  }

  if (rows.length === 0) {
    return Response.json({ error: 'No valid rows found in CSV' }, { status: 422 })
  }

  // Insert in chunks inside a transaction to ensure atomicity
  const CHUNK = 100
  let inserted = 0

  await db.transaction(async (tx) => {
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK)
      await tx.insert(applications).values(chunk)
      inserted += chunk.length
    }
  })

  return Response.json({ inserted })
}
