"use client";

import { AuthButton } from "@/components/auth-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Folders,
  MessagesSquare,
  PanelLeft,
  Plus,
  Code,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { AnthropicSidebarAction } from "./anthropic-sidebar-action";
import { usePathname } from "next/navigation";

const anthropicNavItems = [
  {
    title: "AI Design Sprint",
    url: "#",
  },
  {
    title: "Brainstorm with Claude",
    url: "#",
  },
  {
    title: "Marketing GPT",
    url: "#",
  },
  {
    title: "Startup Helper",
    url: "#",
  },
  {
    title: "Philosophy Debates",
    url: "#",
  },
  {
    title: "Travel Advisor",
    url: "#",
  },
  {
    title: "Code Reviewer",
    url: "#",
  },
  {
    title: "Book Summaries",
    url: "#",
  },
  // More made up chats can be added here!
];

export function AnthropicSidebar() {
  const pathname = usePathname();

  return (
    <>
      <Sidebar
        variant="floating"
        collapsible="none"
        className="hidden md:flex w-56 bg-background border-r rounded-l-lg flex-col h-full"
      >
        <SidebarHeader className="flex flex-row items-center justify-between">
          <span className="text-xl font-bold">Claude</span>
          <PanelLeft className="size-4 hover:cursor-pointer text-muted-foreground" />
        </SidebarHeader>
        <SidebarContent className="flex-1 overflow-auto">
          <SidebarGroup>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <div className="rounded-full bg-orange-400/60 p-1">
                  <Plus className="size-4" />
                </div>
                <span>New Chat</span>
              </SidebarMenuButton>
              <SidebarMenuButton>
                <div className="rounded-full p-1">
                  <MessagesSquare className="size-4" />
                </div>
                <span>Chats</span>
              </SidebarMenuButton>
              <SidebarMenuButton>
                <div className="rounded-full p-1">
                  <Folders className="size-4" />
                </div>
                <span>Projects</span>
              </SidebarMenuButton>
              <SidebarMenuButton>
                <div className="rounded-full p-1">
                  <LayoutDashboard className="size-4" />
                </div>
                <span>Artifacts</span>
              </SidebarMenuButton>
              <SidebarMenuButton>
                <div className="rounded-full p-1">
                  <Code className="size-4" />
                </div>
                <span>Code</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Starred</SidebarGroupLabel>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Recents</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {anthropicNavItems.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url !== "/dashboard/anthropic" &&
                      pathname?.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <AnthropicSidebarAction />
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t mt-auto">
          <AuthButton />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
