'use client'

import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ApplicationCard } from './application-card'
import { STATUS_CONFIG, STATUSES } from '@/lib/status'
import type { Application, ApplicationStatus } from '@/lib/db/schema'

interface MobileListViewProps {
  apps: Application[]
  onStatusChange: (id: string, status: ApplicationStatus) => void
}

export function MobileListView({ apps, onStatusChange }: MobileListViewProps) {
  const grouped = Object.fromEntries(
    STATUSES.map((s) => [s, apps.filter((a) => a.status === s)])
  ) as Record<ApplicationStatus, Application[]>

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="applied" className="flex flex-col flex-1 min-h-0">
        {/* Scrollable tab strip */}
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="inline-flex h-auto w-max rounded-none bg-transparent p-0 gap-0">
              {STATUSES.map((status) => {
                const count = grouped[status].length
                return (
                  <TabsTrigger
                    key={status}
                    value={status}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 gap-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground shrink-0"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_CONFIG[status].dot}`} />
                      {STATUS_CONFIG[status].label}
                    </span>
                    {count > 0 && (
                      <span className="text-xs tabular-nums bg-muted text-muted-foreground rounded-full px-1.5 py-px leading-none">
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
        </div>

        {/* Tab content */}
        {STATUSES.map((status) => (
          <TabsContent
            key={status}
            value={status}
            className="flex-1 mt-0 outline-none"
          >
            <div className="overflow-y-auto h-[calc(100svh-11rem)]">
              <div className="p-4 space-y-2">
                {grouped[status].length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className={`w-10 h-10 rounded-full mb-3 opacity-20 ${STATUS_CONFIG[status].dot}`} />
                    <p className="text-sm font-medium text-foreground">
                      No {STATUS_CONFIG[status].label.toLowerCase()} applications
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Drag a card here or add a new one
                    </p>
                  </div>
                ) : (
                  grouped[status].map((app) => (
                    <ApplicationCard
                      key={app.id}
                      app={app}
                      onStatusChange={onStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Floating action button */}
      <Link
        href="/dashboard/applications/new"
        aria-label="Add application"
        className="fixed bottom-6 right-4 z-50 flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
      >
        <HugeiconsIcon icon={Add01Icon} size={22} strokeWidth={2} />
      </Link>
    </div>
  )
}
