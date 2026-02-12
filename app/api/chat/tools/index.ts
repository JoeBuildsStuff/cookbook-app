import type { Anthropic } from '@anthropic-ai/sdk'
import { templateTool, executeTemplateExample } from './template-tool'

// Export all tool definitions - add your project-specific tools here
export const availableTools: Anthropic.Tool[] = [templateTool]

// Export all execution functions - map tool name to executor
export const toolExecutors: Record<string, (parameters: Record<string, unknown>) => Promise<{ success: boolean; data?: unknown; error?: string }>> = {
  template_example: executeTemplateExample,
}

// Re-export individual tools for direct access
export { templateTool, executeTemplateExample }
