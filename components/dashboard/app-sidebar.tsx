"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { File, Plus, Table2 } from "lucide-react"
import { SidebarLogo } from "@/components/dashboard/app-sidebar-logo"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AuthButton } from "@/components/auth-button"

export function AppSidebar() {
  const pathname = usePathname()

  const handleCreateNote = () => {
    console.log("Create note clicked")
  }

  const handleCreateTable = () => {
    console.log("Create table clicked")
  }

  const navigationItems = [
    {
      label: "Notes",
      href: "/dashboard/notes",
      icon: File,
      action: handleCreateNote,
      actionAriaLabel: "Create new note",
    },
    { 
      label: "Table",
      href: "/dashboard/table",
      icon: Table2,
      action: handleCreateTable,
      actionAriaLabel: "Create new table",
    },
  ]


  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarLogo />
        </SidebarHeader>
        <SidebarContent className="flex flex-col">

          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.href} >
                    <SidebarMenuButton 
                      asChild
                      className={cn(
                        "w-full justify-start",
                        pathname.startsWith(item.href)
                          ? "bg-muted/50 hover:bg-muted font-semibold"
                          : "hover:bg-muted"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-3.5 mr-2 flex-none text-muted-foreground" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.action && (
                      <SidebarMenuAction asChild showOnHover={true}>
                        <button
                          onClick={item.action}
                          className="disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
                          aria-label={item.actionAriaLabel}
                        >
                            <Plus className="size-4 text-muted-foreground" />
                        </button>
                      </SidebarMenuAction>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
        <SidebarFooter>
          <AuthButton />
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
