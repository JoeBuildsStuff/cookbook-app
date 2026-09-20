"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Book, LayoutDashboard } from "lucide-react";
import CommandSearch, {
  type CommandGroupConfig,
  type CommandOption,
} from "@/components/dashboard/command-search";
import { createClient } from "@/lib/supabase/client";
import { getRecipeIconComponent } from "@/lib/recipe-icons";

const APP_SCHEMA = "cookbook";
const MAX_RECIPES = 100;

type RecipeRow = {
  id: string;
  title: string | null;
  icon_name: string | null;
  updated_at: string;
};

export default function RecipeCommandSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);

  const fetchRecipes = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setRecipes([]);
      return;
    }
    const { data, error } = await supabase
      .schema(APP_SCHEMA)
      .from("notes")
      .select("id, title, icon_name, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(MAX_RECIPES);
    if (!error) {
      setRecipes((data ?? []) as RecipeRow[]);
    }
  }, []);

  useEffect(() => {
    void fetchRecipes();
  }, [fetchRecipes, pathname]);

  // Refresh results if recipes change elsewhere in the app
  useEffect(() => {
    const handleNotesUpdated = () => {
      void fetchRecipes();
    };
    window.addEventListener("cookbook-notes-updated", handleNotesUpdated);
    return () => {
      window.removeEventListener("cookbook-notes-updated", handleNotesUpdated);
    };
  }, [fetchRecipes]);

  const groups = useMemo<CommandGroupConfig[]>(() => {
    const recipeOptions: CommandOption[] = recipes.map((recipe) => ({
      id: recipe.id,
      label: recipe.title?.trim() || "Untitled",
      keywords: [recipe.title ?? "Untitled", "recipe"],
      icon: getRecipeIconComponent(recipe.icon_name),
      metadata: { href: `/dashboard/recipes/${encodeURIComponent(recipe.id)}` },
    }));

    return [
      {
        id: "recipes",
        heading: recipes.length > 0 ? "Recipes" : "Recipes",
        options: recipeOptions,
        limit: 8,
      },
      {
        id: "navigation",
        heading: "Go to",
        options: [
          {
            id: "nav-dashboard",
            label: "Dashboard",
            keywords: ["home", "dashboard", "overview"],
            icon: LayoutDashboard,
            metadata: { href: "/dashboard" },
          },
          {
            id: "nav-recipes",
            label: "All recipes",
            keywords: ["recipes", "list", "all"],
            icon: Book,
            metadata: { href: "/dashboard/recipes" },
          },
        ],
      },
    ];
  }, [recipes]);

  const handleSelect = useCallback(
    (option: CommandOption) => {
      const href =
        typeof option.metadata?.href === "string" ? option.metadata.href : null;
      if (href) {
        router.push(href);
      }
    },
    [router]
  );

  return (
    <CommandSearch
      groups={groups}
      onSelect={handleSelect}
      placeholder="Search recipes..."
      buttonPlaceholder="Search..."
      buttonAriaLabel="Search recipes"
      showSearchAction={false}
      popoverWidth="w-[420px]"
    />
  );
}
