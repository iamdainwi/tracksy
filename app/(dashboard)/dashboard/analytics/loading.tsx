export default function Loading() {
  return (
    <div className="px-4 md:px-6 py-6 max-w-4xl space-y-8">
      <div className="space-y-1">
        <div className="h-5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-4 space-y-2"
          >
            <div className="h-7 w-12 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-5">
        <div className="h-4 w-28 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mb-4" />
        <div className="h-56 bg-zinc-50 dark:bg-zinc-800/30 rounded animate-pulse" />
      </div>
    </div>
  )
}
