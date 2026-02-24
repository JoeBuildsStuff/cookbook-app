"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  // SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Book } from "lucide-react";
import { SidebarLogo } from "@/components/dashboard/app-sidebar-logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_RECIPE_ICON,
  getRecipeIconOption,
  isRecipeIconName,
  type RecipeIconName,
} from "@/lib/recipe-icons";

const APP_SCHEMA = "cookbook";

type SidebarRecipe = {
  id: string;
  title: string | null;
  icon_name: string | null;
};

export function AppSidebar() {
  const pathname = usePathname();
  const [favorites, setFavorites] = useState<SidebarRecipe[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<SidebarRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSidebarNotes = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFavorites([]);
      setRecentRecipes([]);
      setIsLoading(false);
      return;
    }

    const [favoritesResult, recentResult] = await Promise.all([
      supabase
        .schema(APP_SCHEMA)
        .from("notes")
        .select("id, title, icon_name")
        .eq("user_id", user.id)
        .eq("is_favorite", true)
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase
        .schema(APP_SCHEMA)
        .from("notes")
        .select("id, title, icon_name")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(5),
    ]);

    if (!favoritesResult.error) {
      setFavorites(favoritesResult.data ?? []);
    }
    if (!recentResult.error) {
      setRecentRecipes(recentResult.data ?? []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchSidebarNotes();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchSidebarNotes, pathname]);

  useEffect(() => {
    const handleNotesUpdated = () => {
      void fetchSidebarNotes();
    };

    window.addEventListener("cookbook-notes-updated", handleNotesUpdated);
    return () => {
      window.removeEventListener("cookbook-notes-updated", handleNotesUpdated);
    };
  }, [fetchSidebarNotes]);

  const navigationItems = [
    {
      label: "Recipes",
      href: "/dashboard/recipes",
      icon: Book,
      // KEEP THIS FOR FUTURE POSSIBLE ACTIONS
      // action: handleCreateRecipe,
      // actionAriaLabel: "Create new recipe",
    },
  ];

  const renderRecipeMenuItem = (recipe: SidebarRecipe) => {
    const iconName: RecipeIconName =
      recipe.icon_name && isRecipeIconName(recipe.icon_name)
        ? recipe.icon_name
        : DEFAULT_RECIPE_ICON;
    const recipeIcon = getRecipeIconOption(iconName);

    return (
      <SidebarMenuButton
        asChild
        className={cn(
          pathname === `/dashboard/recipes/${encodeURIComponent(recipe.id)}`
            ? "bg-muted/50 hover:bg-muted font-semibold"
            : "hover:bg-muted"
        )}
      >
        <Link href={`/dashboard/recipes/${encodeURIComponent(recipe.id)}`}>
          <recipeIcon.Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{recipe.title || "Untitled"}</span>
        </Link>
      </SidebarMenuButton>
    );
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarLogo />
        </SidebarHeader>
        <SidebarContent className="flex flex-col">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "w-full justify-start",
                        pathname.startsWith(item.href)
                          ? "bg-muted/50 hover:bg-muted font-semibold"
                          : "hover:bg-muted"
                      )}
                    >
                      <Link href={item.href}>
                        {item.icon && (
                          <item.icon className="mr-2 size-3.5 flex-none text-muted-foreground" />
                        )}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <span className="text-muted-foreground">Loading...</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : favorites.length > 0 ? (
                  favorites.map((recipe) => (
                    <SidebarMenuItem key={recipe.id}>
                      {renderRecipeMenuItem(recipe)}
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <span className="text-muted-foreground">
                        No favorites
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              Recent
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <span className="text-muted-foreground">Loading...</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : recentRecipes.length > 0 ? (
                  recentRecipes.map((recipe) => (
                    <SidebarMenuItem key={recipe.id}>
                      {renderRecipeMenuItem(recipe)}
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <span className="text-muted-foreground">
                        No recent recipes
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <AuthButton />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
