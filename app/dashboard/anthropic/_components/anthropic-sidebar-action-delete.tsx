"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface AnthropicSidebarActionDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnthropicSidebarActionDelete({
  open,
  onOpenChange,
}: AnthropicSidebarActionDeleteProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl bg-secondary w-sm gap-6 p-4">
        <AlertDialogHeader className="items-start justify-start gap-1">
          <AlertDialogTitle className="text-xl">Delete chat</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-base">
            Are you sure you want to delete this chat?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className=" bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:cursor-pointer text-base font-normal">
            Delete
          </AlertDialogAction>
          <AlertDialogCancel className="hover:cursor-pointer text-base font-normal">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
