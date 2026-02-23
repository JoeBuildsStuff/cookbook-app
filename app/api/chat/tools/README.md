# Chat API Tools

This directory contains tool definitions and execution logic for the chat API.

## Structure

- `index.ts` - Exports all enabled tools and executor mapping
- `recipe-tools.ts` - Cookbook recipe tools (read/create/update recipes, comments)
- `README.md` - Documentation

## Cookbook Context

This is a **cookbook app**. Users manage recipes, not generic notes. All tools use recipe terminology so the AI understands it's helping with recipes (ingredients, instructions, dish names, etc.).

## Enabled Tools

- `recipes_get_recipe`
  - Input: `recipeId`, optional `maxChars`
  - Output: recipe title/content and `/dashboard/recipes/:id` URL
- `recipes_get_comments`
  - Input: `recipeId`, optional `includeResolved`, `limitThreads`, `maxCharsPerComment`
  - Output: comment threads with replies and statuses
- `recipes_create_recipe`
  - Input: optional `title`, optional `content`
  - Output: new recipe with id and URL
- `recipes_update_recipe`
  - Input: `recipeId`, and at least one of `title` or `content`
  - Output: updated recipe record
- `recipes_add_comment`
  - Input: `recipeId`, `content`, optional `anchorText`
  - Output: created thread ID and root comment ID
- `recipes_reply_to_comment`
  - Input: `recipeId`, `threadId`, `content`
  - Output: created reply comment metadata

All tools enforce Supabase auth and only operate on recipes owned by the current user.

## Recipe Page Context

The chat client sends `client_path` (current URL path) to chat APIs.  
If the user is on `/dashboard/recipes/{id}`, use that `{id}` as `recipeId` for tool calls.

## Adding New Tools

1. Create a file in this directory (example: `my-tool.ts`)
2. Define tool schema + executor:

```typescript
import type { Anthropic } from "@anthropic-ai/sdk";

export const myTool: Anthropic.Tool = {
  name: "my_tool_name",
  description: "Description of what this tool does",
  input_schema: {
    type: "object" as const,
    properties: {
      param1: {
        type: "string",
        description: "Description of parameter 1",
      },
    },
    required: ["param1"],
  },
};

export async function executeMyTool(
  parameters: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    // Your tool logic here
    const result = await someFunction(parameters);
    return { success: true, data: result };
  } catch (error) {
    console.error("My tool execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
```

3. Register it in `index.ts`:

```typescript
import { myTool, executeMyTool } from './my-tool'

export const availableTools: Anthropic.Tool[] = [
  recipesGetRecipeTool,
  myTool,
]

export const toolExecutors: Record<string, ...> = {
  recipes_get_recipe: executeRecipesGetRecipe,
  my_tool_name: executeMyTool,
}
```

## Tool Format

Tools use the Anthropic tool schema format, which is compatible with:

- Anthropic Claude (via `route.ts`)
- OpenAI (converted in `openai/route.ts`)
- Cerebras (converted in `cerebras/route.ts`)

Each tool needs:

1. **Definition** – `name`, `description`, and `input_schema` (JSON Schema)
2. **Executor** – An async function that receives parameters and returns `{ success, data?, error? }`
