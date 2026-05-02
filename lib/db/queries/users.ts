import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

async function _syncUser(clerkId: string, email: string) {
  await db
    .insert(users)
    .values({ clerkId, email })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { email },
    })
}

export const syncUser = (clerkId: string, email: string) =>
  unstable_cache(_syncUser, ['sync-user', clerkId], { revalidate: 86400 })(clerkId, email)
