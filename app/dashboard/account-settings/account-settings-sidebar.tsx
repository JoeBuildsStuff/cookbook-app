"use client"

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Bell, CreditCard, Trash2, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const accountSettingsNavItems = [
  {
    title: "My Profile",
    url: "/dashboard/account-settings/profile",
    icon: User,
  },
  {
    title: "Notifications",
    url: "/dashboard/account-settings/notifications",
    icon: Bell,
  },
  {
    title: "Billing",
    url: "/dashboard/account-settings/billing",
    icon: CreditCard,
  },
  {
    title: "Delete Account",
    url: "/dashboard/account-settings/delete-account",
    icon: Trash2,
  },
]

export function AccountSettingsSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="floating" collapsible="none" className="hidden md:block w-56 bg-background border-r rounded-l-lg">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountSettingsNavItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/dashboard/account-settings" && pathname?.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

