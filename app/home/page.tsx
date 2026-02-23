import Link from "next/link";
import {
  MessageSquare,
  FileText,
  Table2,
  Sparkles,
  Zap,
  Brain,
  ChevronRight,
  ArrowRight,
  Paperclip,
  SlidersHorizontal,
  AlignLeft,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <main className="max-w-5xl w-full space-y-28">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground">
            <Sparkles className="size-3.5" />
            <span>Powered by Claude, GPT &amp; Cerebras</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl leading-tight">
            Your AI workspace,
            <br />
            <span className="text-primary">all in one place</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chat with the world&apos;s best AI models, take smart notes, and
            manage data — all through a single AI assistant that understands
            your context.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="https://github.com/JoeBuildsStuff/tech-stack-010226"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3 border border-border rounded-md hover:bg-accent transition-colors text-sm"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* Core Features — 3 Pillars */}
        <section id="features" className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three powerful tools, one seamless AI-powered experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Chat */}
            <div className="p-8 border border-border rounded-xl space-y-4 hover:border-primary/50 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Multi-Model AI Chat</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Switch between Claude, GPT, and Cerebras models mid-session.
                Attach files, invoke tools, and get responses that understand
                your full context.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Claude Haiku, Sonnet &amp; Opus
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  OpenAI GPT models
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  File &amp; image attachments
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Tool &amp; function calling
                </li>
              </ul>
            </div>

            {/* Notes */}
            <div className="p-8 border border-border rounded-xl space-y-4 hover:border-primary/50 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Notes</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                A full-featured rich text editor with tables, code blocks, and
                links. Your AI assistant lives alongside your notes, ready to
                help at any moment.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Rich text formatting
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Tables &amp; code blocks
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Sort by modified, created, or viewed
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  AI note-taking assistant
                </li>
              </ul>
            </div>

            {/* Data Tables */}
            <div className="p-8 border border-border rounded-xl space-y-4 hover:border-primary/50 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Table2 className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Intelligent Data</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Advanced data tables with AI-powered filtering and navigation.
                Describe what you&apos;re looking for in plain English and the
                assistant does the rest.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Natural language filtering
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Sort &amp; pagination controls
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  Configurable columns
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 shrink-0 text-primary" />
                  URL-persisted state
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* AI Models Section */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Pick your model. Switch anytime.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Access the world&apos;s leading AI providers from a single
              interface — no juggling between apps
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center gap-3">
                <Brain className="size-5 text-primary" />
                <h3 className="font-semibold">Anthropic Claude</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Haiku 4.5, Sonnet 4.6 &amp; Opus 4.6 — from fast to frontier
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="size-5 text-primary" />
                <h3 className="font-semibold">OpenAI GPT</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                GPT-5 family models for versatile, capable AI assistance
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-primary" />
                <h3 className="font-semibold">Cerebras</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Ultra-fast inference with open Llama models
              </p>
            </div>
          </div>
        </section>

        {/* Highlights row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="flex justify-center">
              <Paperclip className="size-7 text-primary" />
            </div>
            <h3 className="font-semibold">Attach anything</h3>
            <p className="text-sm text-muted-foreground">
              Send images, documents, audio, or video directly in the chat
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-center">
              <SlidersHorizontal className="size-7 text-primary" />
            </div>
            <h3 className="font-semibold">Tune your reasoning</h3>
            <p className="text-sm text-muted-foreground">
              Dial in the reasoning effort level to balance speed and depth
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-center">
              <AlignLeft className="size-7 text-primary" />
            </div>
            <h3 className="font-semibold">Context-aware</h3>
            <p className="text-sm text-muted-foreground">
              The assistant sees what you&apos;re working on and responds
              accordingly
            </p>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="space-y-8 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Built on a modern stack
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Production-ready technologies powering every feature
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              "Next.js 15",
              "React 19",
              "TypeScript",
              "Tailwind CSS 4",
              "Supabase",
              "Tiptap",
              "shadcn/ui",
              "TanStack Table",
              "Zustand",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full border border-border bg-muted/50 text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-14 px-8 rounded-2xl border border-border bg-muted/30">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Sign up free and start chatting with the world&apos;s best AI
            models in minutes.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            Launch App
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
