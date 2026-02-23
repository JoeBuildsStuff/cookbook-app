import type { Anthropic } from '@anthropic-ai/sdk'
import {
  recipesAddCommentTool,
  recipesCreateRecipeTool,
  recipesGetCommentsTool,
  recipesGetRecipeTool,
  recipesReplyToCommentTool,
  recipesUpdateRecipeTool,
  executeRecipesAddComment,
  executeRecipesCreateRecipe,
  executeRecipesGetComments,
  executeRecipesGetRecipe,
  executeRecipesReplyToComment,
  executeRecipesUpdateRecipe,
} from './recipe-tools'

// Export all tool definitions - cookbook recipe tools
export const availableTools: Anthropic.Tool[] = [
  recipesGetRecipeTool,
  recipesGetCommentsTool,
  recipesCreateRecipeTool,
  recipesUpdateRecipeTool,
  recipesAddCommentTool,
  recipesReplyToCommentTool,
]

// Export all execution functions - map tool name to executor
export const toolExecutors: Record<string, (parameters: Record<string, unknown>) => Promise<{ success: boolean; data?: unknown; error?: string }>> = {
  recipes_get_recipe: executeRecipesGetRecipe,
  recipes_get_comments: executeRecipesGetComments,
  recipes_create_recipe: executeRecipesCreateRecipe,
  recipes_update_recipe: executeRecipesUpdateRecipe,
  recipes_add_comment: executeRecipesAddComment,
  recipes_reply_to_comment: executeRecipesReplyToComment,
}

// Re-export individual tools for direct access
export {
  recipesGetRecipeTool,
  recipesGetCommentsTool,
  recipesCreateRecipeTool,
  recipesUpdateRecipeTool,
  recipesAddCommentTool,
  recipesReplyToCommentTool,
}
