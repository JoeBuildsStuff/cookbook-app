# Cookbook

A web cookbook application for creating and managing recipes with an AI assistant. Recipes are rich-text documents (ingredients, instructions, notes) stored in Supabase and edited with Tiptap. A sidebar navigator and AI chatbot help you create, update, and discuss recipes.

## Features

### Recipes

- **Recipe dashboard** – List recipes with sort options (modified, created, last viewed). Create new recipes from the sidebar or dashboard.
- **Rich-text editor** – Edit recipes with [Tiptap](https://tiptap.dev) (headings, lists, links, tables, code blocks).
- **File handling** – Supabase-backed uploads for images; non-images (PDFs, DOCX, etc.) as file nodes. Drag & drop or paste into the editor.

### Comments

- **Threaded comments** – Add comments on recipes and reply within threads.
- **Anchored to text** – Comments attach to selected text; anchors stay in sync as you edit.
- **Resolve / reopen** – Mark threads resolved or reopen them from the comments panel.
- **Comments panel** – Side panel with filters for open vs resolved threads.
- **Inline creation** – Create comments from text selection in the editor or via the AI chatbot.

### AI Chatbot

- **Context-aware** – Uses the current recipe URL so the AI can operate on what you’re viewing.
- **Recipe tools** – Create, update, and fetch recipes; add comments and replies.
- **Web search** – Real-time search with citations (Anthropic only).
- **File attachments** – Attach images and documents to chat messages.
- **Model selection** – Claude (Haiku, Sonnet, Opus), GPT-5 variants, Cerebras.
- **Reasoning effort** – Configurable reasoning level for supported models.

### Account

- **Auth** – Sign in, sign up, verify OTP/email, password reset, update password.
- **Account settings** – Profile (display name, avatar), notifications, billing, delete account.

## Tech Stack

- **Framework** – Next.js 16 (App Router)
- **UI** – React 19, Radix UI, Tailwind CSS
- **Editor** – Tiptap
- **Database** – Supabase (Postgres)
- **AI** – Anthropic (Claude), OpenAI, Cerebras, with shared function-calling tools

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI providers (at least one for chat)
ANTHROPIC_API_KEY=your_anthropic_key      # Claude models
OPENAI_API_KEY=your_openai_key            # GPT models
CEREBRAS_API_KEY=your_cerebras_key        # Cerebras models

# Optional: web search (Anthropic only)
WEB_SEARCH_MAX_USES=5
```

### Database

Apply the Supabase migrations in `supabase/migrations/` to set up the schema (notes, comments, etc.).

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (Auth)/             # signin, signup, verify-otp, verify-email, password reset
  dashboard/
    recipes/          # Recipe list & editor
    account-settings/ # Profile, notifications, billing, delete account
  api/
    chat/             # Anthropic, OpenAI, Cerebras routes
    documents/[id]/   # Comment threads, anchors, CRUD
  home/               # Landing layout
components/
  dashboard/          # Sidebar, layout
  tiptap/             # Editor, comments, file handling
lib/                  # Supabase, utilities
supabase/migrations/  # Schema & migrations
```

**Backend**

- **RLS** – Row-level security on notes and comments so users only access their own data.
- **Comments API** – CRUD for threads, comments, and anchors at `/api/documents/[id]/threads/...`.

## Chat API

The chatbot exposes tools for recipe management and comments:

| Tool | Purpose |
|------|---------|
| `recipes_get_recipe` | Fetch a recipe by ID |
| `recipes_get_comments` | List comment threads on a recipe |
| `recipes_create_recipe` | Create a new recipe |
| `recipes_update_recipe` | Update title or content |
| `recipes_add_comment` | Add a comment thread |
| `recipes_reply_to_comment` | Reply to a thread |

When you're on `/dashboard/recipes/{id}`, the chat sends that `id` as context so the AI can operate on the current recipe.

See [`app/api/chat/README.md`](app/api/chat/README.md) and [`app/api/chat/openai/README.md`](app/api/chat/openai/README.md) for provider details and environment setup. See [`components/tiptap/README.md`](components/tiptap/README.md) for editor and comments behavior.

## Deploy

Build for production:

```bash
pnpm build
pnpm start
```

For Vercel, connect the repo and configure the same environment variables.
