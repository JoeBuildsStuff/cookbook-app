import Link from "next/link";
import Image from "next/image";
import {
  ChefHat,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MessageCircle,
  BookOpen,
  PenLine,
  Bot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <main className="max-w-5xl w-full space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <Badge className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground">
            <ChefHat className="size-3.5" />
            <span>Create recipes with AI</span>
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl leading-tight">
            Your recipes,
            <br />
            <span className="text-primary">made with AI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ask the AI chatbot for any recipe — chocolate chip cookies, pad
            thai, coq au vin — and it creates it for you. Edit, tweak, and add
            comments as you go.
          </p>
          <Button asChild>
            <Link href="/dashboard">Start Creating Recipes</Link>
            {/* <ArrowRight className="size-4" /> */}
          </Button>
        </section>

        {/* App Screenshot */}
        <section className="flex justify-center">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-border shadow-lg">
            <Image
              src="/recipe-screenshot.png"
              alt="Screenshot of the Cookbook app showing a recipe with ingredients, instructions, and AI chat"
              width={1200}
              height={800}
              className="w-full h-auto"
              priority
            />
          </div>
        </section>

        {/* Value Proposition */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Better than an index card
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your favorite recipes deserve more than a stained notecard or a
            screenshot buried in your camera roll. Cookbook gives them a real
            home — a digital workspace where you can save, find, revise, and
            perfect every dish you love.
          </p>
        </section>

        {/* Features Grid */}
        <section id="features" className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Save & Retrieve */}
            <div className="p-8 border border-border rounded-xl space-y-4 hover:border-primary/50 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <BookOpen className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                Save and retrieve instantly
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Quickly save any recipe and find it again in seconds. No more
                flipping through binders or scrolling through bookmarks —
                everything lives in one organized, searchable place.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  All your recipes in one place
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Fast search and browse
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Access from any device
                </li>
              </ul>
            </div>

            {/* Edit & Revise */}
            <div className="p-8 border border-border rounded-xl space-y-4 hover:border-primary/50 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <PenLine className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                Edit and revise as you grow
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Tastes change, and your recipes should keep up. Swap
                ingredients, adjust portions, rewrite instructions — a rich
                editor makes it easy to evolve any dish over time.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Rich text editing with formatting
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Tweak ingredients and steps freely
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Drag &amp; drop images
                </li>
              </ul>
            </div>

            {/* Comment & Annotate */}
            <div className="p-8 border border-border rounded-xl space-y-4 hover:border-primary/50 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                Comment on what to tweak
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Think the sauce needs more garlic? Wonder if you should try it
                with brown butter next time? Drop a comment right on the recipe.
                Your future self will thank you.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Inline comments on any section
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Track ideas and experiments
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Resolve threads when you&apos;ve decided
                </li>
              </ul>
            </div>

            {/* AI Assistant */}
            <div className="p-8 border border-border rounded-xl space-y-4 hover:border-primary/50 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Bot className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI built right in</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Need a recipe from scratch? Want to rework an old favorite? The
                AI assistant can create, revise, edit, and comment on recipes
                alongside you — no switching between apps.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Generate full recipes from a prompt
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  AI-powered revisions and suggestions
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Context-aware — it sees what you see
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Everything-in-one-place callout */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-muted/30 text-sm text-muted-foreground">
            <Sparkles className="size-4" />
            <span>
              Powered by Claude, GPT &amp; Cerebras — pick the model you like
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Save, edit, comment, and create — all in one place, with an AI
            assistant that works right alongside you. No more juggling apps,
            websites, and sticky notes.
          </p>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-14 px-8 rounded-2xl border border-border bg-muted/30">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to bring your recipes home?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Start building your digital cookbook in minutes — save an old
            favorite or let the AI create something new.
          </p>
          <Button asChild>
            <Link href="/dashboard">Start Creating Recipes</Link>
            {/* <ArrowRight className="size-4" /> */}
          </Button>
        </section>
      </main>
    </div>
  );
}
