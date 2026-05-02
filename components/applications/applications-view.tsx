'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, Add01Icon } from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ApplicationsTable } from './data-table'
import { MobileListView } from './mobile-list-view'
import type { Application, ApplicationStatus } from '@/lib/db/schema'

export function ApplicationsView({ initialApps }: { initialApps: Application[] }) {
  const [apps, setApps] = useState(initialApps)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return apps
    const q = query.toLowerCase()
    return apps.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q)
    )
  }, [apps, query])

  const handleStatusChange = useCallback((id: string, status: ApplicationStatus) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }, [])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b">
        <h1 className="text-sm font-semibold hidden md:block shrink-0">Pipeline</h1>
        <div className="relative flex-1 max-w-72">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            strokeWidth={2}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or role…"
            className="pl-8 h-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground hidden sm:block tabular-nums">
            {filtered.length} / {apps.length}
          </span>
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/dashboard/applications/new">
              <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
              Add
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile: tabbed list */}
      <div className="md:hidden flex-1 min-h-0">
        <MobileListView apps={filtered} onStatusChange={handleStatusChange} />
      </div>

      {/* Desktop: data table */}
      <div className="hidden md:block px-6 pt-4 pb-8 flex-1 overflow-y-auto">
        <ApplicationsTable apps={filtered} onStatusChange={handleStatusChange} />
      </div>
    </div>
  )
}
