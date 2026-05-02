// For production at scale, replace with Upstash Redis: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview

const store = new Map<string, { count: number; resetAt: number }>()

// Purge expired entries periodically to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key)
  }
}, 60_000)

export function rateLimit(
  key: string,
  opts: { max: number; windowMs: number } = { max: 60, windowMs: 60_000 }
): { ok: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs })
    return { ok: true, remaining: opts.max - 1 }
  }

  if (entry.count >= opts.max) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { ok: true, remaining: opts.max - entry.count }
}
