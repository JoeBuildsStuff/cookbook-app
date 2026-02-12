# Chat API Tools

This directory contains tool definitions and execution logic for the chat API. Tools are functions that the AI can call to perform specific actions.

## Structure

- `index.ts` - Exports all tools and executors
- `template-tool.ts` - Placeholder template for adding your own tools
- `README.md` - This documentation file

## Adding Your Own Tools

1. Create a new file in this directory (e.g., `my-tool.ts`)
2. Define the tool schema and execution function:

```typescript
import type { Anthropic } from '@anthropic-ai/sdk'

export const myTool: Anthropic.Tool = {
  name: 'my_tool_name',
  description: 'Description of what this tool does',
  input_schema: {
    type: 'object' as const,
    properties: {
      param1: {
        type: 'string',
        description: 'Description of parameter 1',
      },
    },
    required: ['param1'],
  },
}

export async function executeMyTool(
  parameters: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    // Your tool logic here
    const result = await someFunction(parameters)
    return { success: true, data: result }
  } catch (error) {
    console.error('My tool execution error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
```

3. Update `index.ts` to include your new tool:

```typescript
import { myTool, executeMyTool } from './my-tool'

export const availableTools: Anthropic.Tool[] = [
  templateTool,
  myTool,
]

export const toolExecutors: Record<string, ...> = {
  template_example: executeTemplateExample,
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
