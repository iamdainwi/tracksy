import { auth } from '@clerk/nextjs/server'
import { getUserApplications } from '@/lib/db/queries/applications'
import { serializeCSV } from '@/lib/csv'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const apps = await getUserApplications(userId)
  const csv = serializeCSV(apps)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="tracksy-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
