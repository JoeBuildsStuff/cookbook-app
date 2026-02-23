"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownZA, ArrowUpAZ, CheckIcon, ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NotesSortKey = "modified" | "created" | "viewed";

type NotesSortDropdownProps = {
  value: NotesSortKey;
  order: "asc" | "desc";
};

export function NotesSortDropdown({ value, order }: NotesSortDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onValueChange(nextValue: string) {
    if (
      nextValue !== "modified" &&
      nextValue !== "created" &&
      nextValue !== "viewed"
    ) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (nextValue === "modified") {
      params.delete("sort");
    } else {
      params.set("sort", nextValue);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  function onOrderToggle() {
    const params = new URLSearchParams(searchParams.toString());
    const nextOrder = order === "desc" ? "asc" : "desc";

    if (nextOrder === "desc") {
      params.delete("order");
    } else {
      params.set("order", nextOrder);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  function isSelected(key: NotesSortKey) {
    return value === key;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label="Sort notes"
          size="sm"
        >
          <ListFilter className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <div className="flex items-center justify-between">
            <DropdownMenuLabel className=" text-xs text-muted-foreground flex-1">
              Sort by
            </DropdownMenuLabel>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="p-0 m-0 size-6"
              onClick={onOrderToggle}
              aria-label={
                order === "desc"
                  ? "Switch to ascending order"
                  : "Switch to descending order"
              }
            >
              {order === "desc" ? (
                <ArrowDownZA className="size-4 text-muted-foreground" />
              ) : (
                <ArrowUpAZ className="size-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onValueChange("modified")}>
            <span className="mr-auto">Modified</span>
            {isSelected("modified") ? <CheckIcon /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onValueChange("created")}>
            <span className="mr-auto">Created</span>
            {isSelected("created") ? <CheckIcon /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onValueChange("viewed")}>
            <span className="mr-auto">Viewed</span>
            {isSelected("viewed") ? <CheckIcon /> : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
