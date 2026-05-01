interface FunnelStage {
  stage: string
  count: number
}

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0]?.count ?? 1

  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pct = max > 0 ? (s.count / max) * 100 : 0
        const rate =
          i > 0 && stages[i - 1].count > 0
            ? Math.round((s.count / stages[i - 1].count) * 100)
            : null

        return (
          <div key={s.stage}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{s.stage}</span>
              <div className="flex items-center gap-2">
                {rate !== null && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{rate}%</span>
                )}
                <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 tabular-nums w-6 text-right">
                  {s.count}
                </span>
              </div>
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 dark:bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
