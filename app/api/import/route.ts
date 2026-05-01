import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { applications } from '@/lib/db/schema'
import { parseCSV } from '@/lib/csv'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const text = await (file as File).text()

  let rows: ReturnType<typeof parseCSV>
  try {
    rows = parseCSV(text, userId)
  } catch {
    return Response.json({ error: 'Failed to parse CSV' }, { status: 422 })
  }

  if (rows.length === 0) {
    return Response.json({ error: 'No valid rows found in CSV' }, { status: 422 })
  }

  // Insert in chunks to avoid hitting query size limits
  const CHUNK = 100
  let inserted = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    await db.insert(applications).values(chunk)
    inserted += chunk.length
  }

  return Response.json({ inserted })
}
