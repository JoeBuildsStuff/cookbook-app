"use client";

import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatActions } from "./chat-actions";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Chat() {
  const [hoveredPromptText, setHoveredPromptText] = useState<string | null>(
    null
  );
  const [selectedPromptText, setSelectedPromptText] = useState<string | null>(
    null
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-end mt-2 px-4">
        <Button variant="ghost" className="text-muted-foreground">
          <Ghost className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 w-full py-28 items-center max-w-2xl mx-auto relative p-4">
        <ChatHeader />

        <ChatInput
          hoveredPromptText={hoveredPromptText}
          selectedPromptText={selectedPromptText}
        />

        <ChatActions
          onPromptHover={setHoveredPromptText}
          onPromptSelect={setSelectedPromptText}
        />
      </div>
    </div>
  );
}
