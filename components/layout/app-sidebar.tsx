'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  LayoutGridIcon,
  BarChartIcon,
  Settings01Icon,
  FileImportIcon,
} from '@hugeicons/core-free-icons'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const NAV = [
  { href: '/dashboard/applications', label: 'Pipeline',  icon: LayoutGridIcon },
  { href: '/dashboard/analytics',    label: 'Analytics', icon: BarChartIcon },
  { href: '/dashboard/settings',     label: 'Settings',  icon: Settings01Icon },
  { href: '/dashboard/settings/import', label: 'Import', icon: FileImportIcon },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard/applications">
                <span className="font-semibold tracking-tight text-sm">Tracksy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ href, label, icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(href)}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <HugeiconsIcon icon={icon} size={16} strokeWidth={2} />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-1">
              <UserButton />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
