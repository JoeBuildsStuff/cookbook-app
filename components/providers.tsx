"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ChatProvider } from "@/components/chat/chat-provider";
import { useChatStore } from "@/lib/chat/chat-store";
import { cn } from "@/lib/utils";

export function Providers({ children }: { children: ReactNode }) {
  const isMaximized = useChatStore((s) => s.isMaximized);

  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider>
          <ChatProvider>
            <div
              className={cn(
                "min-h-screen w-full min-w-0 flex-1 transition-all duration-300 ease-in-out",
                isMaximized && "md:mr-96"
              )}
            >
              {children}
            </div>
            <Toaster />
          </ChatProvider>
        </SidebarProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
