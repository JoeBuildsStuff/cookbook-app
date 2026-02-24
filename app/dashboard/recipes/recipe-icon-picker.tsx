"use client";

import {
  RECIPE_ICON_OPTIONS,
  type RecipeIconName,
  getRecipeIconOption,
} from "@/lib/recipe-icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type RecipeIconPickerProps = {
  iconName: RecipeIconName;
  isUpdating?: boolean;
  onSelect: (iconName: RecipeIconName) => void | Promise<void>;
};

export function RecipeIconPicker({
  iconName,
  isUpdating = false,
  onSelect,
}: RecipeIconPickerProps) {
  const activeIconOption = getRecipeIconOption(iconName);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          type="button"
          disabled={isUpdating}
          aria-label="Select recipe icon"
        >
          <activeIconOption.Icon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit rounded-xl p-2" align="start">
        <div className="grid grid-cols-5 gap-1">
          {RECIPE_ICON_OPTIONS.map((option) => (
            <Button
              key={option.name}
              type="button"
              size="icon"
              variant="ghost"
              className={cn(
                "relative h-9 w-9",
                iconName === option.name ? "bg-accent" : ""
              )}
              aria-label={`Use ${option.label} icon`}
              disabled={isUpdating}
              onClick={() => {
                void onSelect(option.name);
              }}
            >
              <option.Icon className="size-4" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
