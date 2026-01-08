"use client";

import { useState } from "react";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import { Ellipsis, Folders, Star, Trash2 } from "lucide-react";
import { Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnthropicSidebarActionDelete } from "./anthropic-sidebar-action-delete";

export function AnthropicSidebarAction() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDeleteClick = (e: Event) => {
    e.preventDefault();
    setDropdownOpen(false);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction asChild showOnHover={true}>
            <button className="disabled:cursor-not-allowed text-muted-foreground hover:text-foreground">
              <Ellipsis className="size-4 text-muted-foreground" />
            </button>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuItem>
            <Star className="size-4 text-muted-foreground" />
            Star
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil className="size-4 text-muted-foreground" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Folders className="size-4 text-muted-foreground" />
            Add Project
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={handleDeleteClick}
            className="flex items-center gap-2 text-destructive"
          >
            <Trash2 className="size-4 shrink-0 text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AnthropicSidebarActionDelete
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
