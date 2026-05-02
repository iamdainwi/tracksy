import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b">
        <Skeleton className="h-4 w-16 hidden md:block shrink-0" />
        <Skeleton className="h-8 w-64 max-w-72" />
        <div className="flex items-center gap-2 ml-auto">
          <Skeleton className="h-4 w-10 hidden sm:block" />
          <Skeleton className="h-8 w-16 hidden md:block" />
        </div>
      </div>

      {/* Desktop: table skeleton */}
      <div className="hidden md:flex flex-col gap-3 px-6 pt-4 pb-8">
        {/* Filter pills */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-muted/30 border-b">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-14 ml-12" />
            <Skeleton className="h-3 w-14 ml-8" />
            <Skeleton className="h-3 w-16 ml-8" />
            <Skeleton className="h-3 w-12 ml-8" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
            >
              <div className="flex items-center gap-3 w-52 shrink-0">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full ml-12" />
              <Skeleton className="h-3 w-20 ml-8 font-mono" />
              <Skeleton className="h-3 w-28 ml-8" />
              <Skeleton className="h-3 w-12 ml-8" />
            </div>
          ))}
        </div>

        <Skeleton className="h-3 w-32" />
      </div>

      {/* Mobile: tab strip + cards skeleton */}
      <div className="md:hidden flex flex-col">
        <div className="flex border-b px-4 gap-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-3 shrink-0">
              <Skeleton className="h-3.5 w-14" />
            </div>
          ))}
        </div>
        <div className="p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border p-3"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-44" />
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-20 ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
