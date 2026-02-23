import Link from "next/link";
import {
  MessageSquare,
  FileText,
  ChefHat,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MessageCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <main className="max-w-5xl w-full space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground">
            <ChefHat className="size-3.5" />
            <span>Create recipes with AI</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl leading-tight">
            Your recipes,
            <br />
            <span className="text-primary">made with AI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ask the AI chatbot for any recipe — chocolate chip cookies, pad thai,
            coq au vin — and it creates it for you. Edit, tweak, and add comments
            as you go.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              Start Creating Recipes
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section id="features" className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Chat, create, and refine — all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Recipe Creation */}
            <div className="p-8 border border-border rounded-xl space-y-4 hover:border-primary/50 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Ask for any recipe</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Type what you want — &quot;chocolate chip cookies&quot;, &quot;vegan curry&quot;,
                &quot;grandma&apos;s banana bread&quot; — and the AI creates a full recipe
                with ingredients and instructions, saved straight to your
                cookbook.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Instant recipe generation
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Ingredients and step-by-step instructions
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Update or refine recipes via chat
                </li>
              </ul>
            </div>

            {/* Rich Recipe Editor */}
            <div className="p-8 border border-border rounded-xl space-y-4 hover:border-primary/50 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Edit and format</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Recipes are rich documents — add headings, lists, tables, images,
                and links. Tweak portions, swap ingredients, or add your own
                notes. The AI sees what you&apos;re editing and can help.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Rich text editing
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Drag &amp; drop images
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Context-aware AI assistant
                </li>
              </ul>
            </div>

            {/* Comments & Collaboration */}
            <div className="p-8 border border-border rounded-xl space-y-4 hover:border-primary/50 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Comments and feedback</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Add comments on recipes — &quot;Maybe a little less flour&quot; or &quot;Try
                doubling the vanilla&quot;. The AI can add comments too. Keep notes
                and iterate without losing anything.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Threaded comments on text
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  AI can suggest or log changes
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Resolve and revisit threads
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Simple highlight */}
        <section className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-muted/30 text-sm text-muted-foreground">
            <Sparkles className="size-4" />
            <span>Powered by Claude, GPT &amp; Cerebras — pick the model you like</span>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-14 px-8 rounded-2xl border border-border bg-muted/30">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to cook?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Create your first recipe with the AI assistant in minutes.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            Start Creating Recipes
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
