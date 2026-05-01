export default function Loading() {
  return (
    <div className="px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <div className="h-5 w-20 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </div>

      <div className="flex gap-3 overflow-x-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="min-w-52 w-52 shrink-0 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/40"
          >
            <div className="flex items-center gap-2 px-3 py-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
            <div className="p-2 space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-3 space-y-2">
                  <div className="h-3.5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-2.5 w-10 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
