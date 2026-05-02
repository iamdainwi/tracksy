import { auth } from '@clerk/nextjs/server'
import { getUserApplications } from '@/lib/db/queries/applications'
import { serializeCSV } from '@/lib/csv'
import { rateLimit } from '@/lib/rate-limit'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = rateLimit(`GET:export:${userId}`, { max: 5, windowMs: 60_000 })
  if (!rl.ok) {
    return Response.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(rl.retryAfter) }
    })
  }

  const apps = await getUserApplications(userId)
  const csv = serializeCSV(apps)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="tracksy-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
