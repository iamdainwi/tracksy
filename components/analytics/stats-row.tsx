interface Stat {
  label: string
  value: string | number
  sub?: string
}

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-4"
        >
          <p className="text-2xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 leading-none">
            {s.value}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">{s.label}</p>
          {s.sub && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{s.sub}</p>
          )}
        </div>
      ))}
    </div>
  )
}
