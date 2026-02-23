import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { ChefHat, Book, MessageSquare, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const APP_SCHEMA = "cookbook";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: recipes } = await supabase
    .schema(APP_SCHEMA)
    .from("notes")
    .select("id, title, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5);

  const { count: totalCount } = await supabase
    .schema(APP_SCHEMA)
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="flex flex-col gap-3 h-full w-full overflow-auto">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Cookbook</h1>
        <p className="text-muted-foreground mt-1">
          Create recipes with the AI chatbot, edit them, and keep them all in
          one place.
        </p>
      </div>

      {/* Quick stats & actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total recipes
            </CardTitle>
            <Book className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Create with AI
            </CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Open any recipe and ask the chatbot — e.g. &quot;make me chocolate
              chip cookies&quot;
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/recipes">
                View Recipes <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent recipes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="size-4" />
            Recent recipes
          </CardTitle>
          <CardDescription>Your most recently updated recipes</CardDescription>
        </CardHeader>
        <CardContent>
          {recipes && recipes.length > 0 ? (
            <ul className="space-y-2">
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <Link
                    href={`/dashboard/recipes/${encodeURIComponent(recipe.id)}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent transition-colors group"
                  >
                    <span className="font-medium truncate">
                      {recipe.title || "Untitled"}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatDistanceToNow(new Date(recipe.updated_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              No recipes yet. Open a recipe and ask the AI chatbot to create one
              for you, or create a blank recipe from the Recipes page.
            </p>
          )}
          {recipes && recipes.length > 0 && (
            <Button asChild variant="ghost" size="sm" className="mt-2">
              <Link href="/dashboard/recipes">
                View all recipes <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
