"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Search,
  Ellipsis,
  Star,
  Pencil,
  Folders,
  Trash2,
  Check,
  Plus,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mockChats = [
  {
    id: "1",
    title: "Hover state management with text preservation",
    lastMessage: "4 hours ago",
  },
  {
    id: "2",
    title: "Text area input border styling",
    lastMessage: "8 hours ago",
  },
  {
    id: "3",
    title: "React component architecture patterns",
    lastMessage: "1 day ago",
  },
  {
    id: "4",
    title: "CSS grid layout optimization",
    lastMessage: "2 days ago",
  },
  {
    id: "5",
    title: "TypeScript utility types deep dive",
    lastMessage: "3 days ago",
  },
  {
    id: "6",
    title: "Database schema design principles",
    lastMessage: "1 week ago",
  },
  {
    id: "7",
    title: "API endpoint versioning strategies",
    lastMessage: "1 week ago",
  },
  {
    id: "8",
    title: "Authentication flow implementation",
    lastMessage: "2 weeks ago",
  },
];

export default function AnthropicRecentsPage() {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  return (
    <div className="mt-12 p-4 flex flex-col gap-4">
      <div className="text-2xl font-bold">Chats</div>
      <Button variant="default" className="w-fit absolute right-4 top-4">
        <Plus className="size-4" />
        New Chat
      </Button>
      <InputGroup className="h-11">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search your chats..." />
      </InputGroup>
      <div className="flex items-center gap-3 mx-4">
        <div className="text-sm text-muted-foreground">
          2,417 chats with Claude
        </div>
        <Link
          href="#"
          className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
        >
          Select
        </Link>
      </div>
      <div className="flex flex-col border-t border-border">
        {mockChats.map((chat) => (
          <div
            key={chat.id}
            className="group relative flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-accent/50 transition-colors"
            onMouseEnter={() => setHoveredChatId(chat.id)}
            onMouseLeave={() => setHoveredChatId(null)}
          >
            <Checkbox
              className={`shrink-0 transition-opacity ${
                hoveredChatId === chat.id ? "opacity-100" : "opacity-0"
              }`}
            />
            <Link
              href={`/dashboard/anthropic/${chat.id}`}
              className="flex-1 flex flex-col gap-1 min-w-0"
            >
              <div className="text-sm font-medium line-clamp-1">
                {chat.title}
              </div>
              <div className="text-xs text-muted-foreground">
                Last message {chat.lastMessage}
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`shrink-0 p-1 rounded hover:bg-accent transition-colors ${
                    hoveredChatId === chat.id
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Ellipsis className="size-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 rounded-xl p-2" align="end">
                <DropdownMenuItem>
                  <Check className="size-4 text-muted-foreground" />
                  <span>Select</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="mx-2" />
                <DropdownMenuItem>
                  <Star className="size-4 text-muted-foreground" />
                  <span>Star</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil className="size-4 text-muted-foreground" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Folders className="size-4 text-muted-foreground" />
                  <span>Add Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="mx-2" />
                <DropdownMenuItem
                  variant="destructive"
                  className="text-destructive"
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
