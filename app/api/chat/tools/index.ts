import type { Anthropic } from '@anthropic-ai/sdk'
import {
  notesAddCommentTool,
  notesGetCommentsTool,
  notesGetNoteTool,
  notesReplyToCommentTool,
  notesUpdateNoteTool,
  executeNotesAddComment,
  executeNotesGetComments,
  executeNotesGetNote,
  executeNotesReplyToComment,
  executeNotesUpdateNote,
} from './note-tools'

// Export all tool definitions - add your project-specific tools here
export const availableTools: Anthropic.Tool[] = [
  notesGetNoteTool,
  notesGetCommentsTool,
  notesUpdateNoteTool,
  notesAddCommentTool,
  notesReplyToCommentTool,
]

// Export all execution functions - map tool name to executor
export const toolExecutors: Record<string, (parameters: Record<string, unknown>) => Promise<{ success: boolean; data?: unknown; error?: string }>> = {
  notes_get_note: executeNotesGetNote,
  notes_get_comments: executeNotesGetComments,
  notes_update_note: executeNotesUpdateNote,
  notes_add_comment: executeNotesAddComment,
  notes_reply_to_comment: executeNotesReplyToComment,
}

// Re-export individual tools for direct access
export {
  notesGetNoteTool,
  notesGetCommentsTool,
  notesUpdateNoteTool,
  notesAddCommentTool,
  notesReplyToCommentTool,
}
