import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export default function AnthropicPage() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="text-destructive hover:text-destructive/90 hover:cursor-pointer hover:bg-destructive/30"
        >
          <Trash2 className="size-4 shrink-0 mr-1" />
          Delete
        </Button>
      </AlertDialogTrigger>
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
