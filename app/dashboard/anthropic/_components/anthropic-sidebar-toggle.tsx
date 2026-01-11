"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AnthropicSidebarToggleProps {
  className?: string;
}

export function AnthropicSidebarToggle({
  className,
}: AnthropicSidebarToggleProps) {
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar();
  // On mobile, check openMobile; on desktop, check open
  const isOpen = isMobile ? openMobile : open;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={cn("text-muted-foreground", className)}
    >
      <PanelLeft className={cn("size-4", !isOpen && "rotate-180")} />
    </Button>
  );
}
