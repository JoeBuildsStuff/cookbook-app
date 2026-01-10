"use client";

import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatActions } from "./chat-actions";
import { Ghost, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function Chat() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-between mt-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-muted-foreground"
        >
          <PanelLeft className={cn("size-4", !open && "rotate-180")} />
        </Button>
        <Button variant="ghost" className="text-muted-foreground">
          <Ghost className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 w-full py-28 items-center max-w-2xl mx-auto relative p-4">
        <ChatHeader />

        <ChatInput />

        <ChatActions />
      </div>
    </div>
  );
}
