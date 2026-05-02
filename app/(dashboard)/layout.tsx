import { auth, currentUser } from '@clerk/nextjs/server'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { syncUser } from '@/lib/db/queries/users'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // currentUser() is only called here; unstable_cache in syncUser
  // ensures the DB insert runs at most once per 24h per userId
  const user = await currentUser()
  if (user) {
    const email = user.emailAddresses[0]?.emailAddress ?? ''
    await syncUser(user.id, email)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="font-medium text-sm">Tracksy</span>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
