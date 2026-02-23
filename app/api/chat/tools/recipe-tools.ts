import type { Anthropic } from "@anthropic-ai/sdk";

import { createClient } from "@/lib/supabase/server";
import {
  createComment,
  createThread,
  listThreads,
} from "@/components/tiptap/lib/comments";
import {
  createUniqueSlug,
  slugToDocumentPath,
} from "@/app/dashboard/recipes/note-path";
import { normalizeNoteContent } from "@/lib/note-content";

const APP_SCHEMA = "cookbook";
const MAX_RECIPE_CHARS = 20000;
const MAX_COMMENT_CHARS = 4000;
const MAX_THREADS = 200;

type ToolResult = Promise<{ success: boolean; data?: unknown; error?: string }>;

type OwnedRecipe = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
};

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asPositiveInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    return null;
  }
  return value;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function truncateText(
  value: string,
  maxChars: number
): { text: string; truncated: boolean } {
  if (value.length <= maxChars) {
    return { text: value, truncated: false };
  }
  return { text: value.slice(0, maxChars), truncated: true };
}

function stripHtml(content: string): string {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function getAuthenticatedContext(): Promise<
  | {
      supabase: Awaited<ReturnType<typeof createClient>>;
      userId: string;
    }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Unauthorized" };
  }

  return {
    supabase,
    userId: user.id,
  };
}

async function getOwnedRecipe(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  recipeId: string
): Promise<OwnedRecipe | null> {
  const { data, error } = await supabase
    .schema(APP_SCHEMA)
    .from("notes")
    .select("id, title, content, created_at, updated_at")
    .eq("id", recipeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as OwnedRecipe | null) ?? null;
}

function recipeUrl(recipeId: string): string {
  return `/dashboard/recipes/${encodeURIComponent(recipeId)}`;
}

function safeCommentContent(content: string, maxChars: number) {
  const { text, truncated } = truncateText(content, maxChars);
  return {
    content: text,
    truncated,
    originalLength: content.length,
  };
}

export const recipesGetRecipeTool: Anthropic.Tool = {
  name: "recipes_get_recipe",
  description:
    "Retrieve a recipe by ID, including title and content (ingredients, instructions, etc). Use this before summarizing or editing a recipe. Recipe IDs come from URLs like /dashboard/recipes/{recipeId}.",
  input_schema: {
    type: "object" as const,
    properties: {
      recipeId: {
        type: "string",
        description:
          "Recipe ID (the UUID in /dashboard/recipes/{recipeId}). When the user is viewing a recipe, this is the ID from the current URL.",
      },
      maxChars: {
        type: "integer",
        description: `Optional max characters of recipe content to return (1-${MAX_RECIPE_CHARS}).`,
      },
    },
    required: ["recipeId"],
  },
};

export async function executeRecipesGetRecipe(
  parameters: Record<string, unknown>
): ToolResult {
  try {
    const recipeId = asString(parameters.recipeId);
    if (!recipeId) {
      return { success: false, error: "recipeId is required" };
    }

    const maxChars = clamp(
      asPositiveInteger(parameters.maxChars) ?? MAX_RECIPE_CHARS,
      1,
      MAX_RECIPE_CHARS
    );

    const auth = await getAuthenticatedContext();
    if ("error" in auth) {
      return { success: false, error: auth.error };
    }

    const recipe = await getOwnedRecipe(auth.supabase, auth.userId, recipeId);
    if (!recipe) {
      return { success: false, error: "Recipe not found" };
    }

    const content = recipe.content ?? "";
    const truncated = truncateText(content, maxChars);

    return {
      success: true,
      data: {
        recipe: {
          id: recipe.id,
          title: recipe.title ?? "Untitled Recipe",
          content: truncated.text,
          contentTruncated: truncated.truncated,
          originalContentLength: content.length,
          createdAt: recipe.created_at,
          updatedAt: recipe.updated_at,
          url: recipeUrl(recipe.id),
        },
      },
    };
  } catch (error) {
    console.error("recipes_get_recipe execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const recipesGetCommentsTool: Anthropic.Tool = {
  name: "recipes_get_comments",
  description:
    "Retrieve comment threads on a recipe. Use to see feedback, suggestions, or discussion attached to a recipe.",
  input_schema: {
    type: "object" as const,
    properties: {
      recipeId: {
        type: "string",
        description:
          "Recipe ID (the UUID in /dashboard/recipes/{recipeId}).",
      },
      includeResolved: {
        type: "boolean",
        description: "Include resolved threads. Defaults to true.",
      },
      limitThreads: {
        type: "integer",
        description: `Maximum number of threads to return (1-${MAX_THREADS}). Defaults to 50.`,
      },
      maxCharsPerComment: {
        type: "integer",
        description: `Maximum comment content size in chars per comment (1-${MAX_COMMENT_CHARS}). Defaults to ${MAX_COMMENT_CHARS}.`,
      },
    },
    required: ["recipeId"],
  },
};

export async function executeRecipesGetComments(
  parameters: Record<string, unknown>
): ToolResult {
  try {
    const recipeId = asString(parameters.recipeId);
    if (!recipeId) {
      return { success: false, error: "recipeId is required" };
    }

    const includeResolved =
      typeof parameters.includeResolved === "boolean"
        ? parameters.includeResolved
        : true;
    const limitThreads = clamp(
      asPositiveInteger(parameters.limitThreads) ?? 50,
      1,
      MAX_THREADS
    );
    const maxCharsPerComment = clamp(
      asPositiveInteger(parameters.maxCharsPerComment) ?? MAX_COMMENT_CHARS,
      1,
      MAX_COMMENT_CHARS
    );

    const auth = await getAuthenticatedContext();
    if ("error" in auth) {
      return { success: false, error: auth.error };
    }

    const recipe = await getOwnedRecipe(auth.supabase, auth.userId, recipeId);
    if (!recipe) {
      return { success: false, error: "Recipe not found" };
    }

    const allThreads = await listThreads(recipeId, auth.userId);
    const filteredThreads = includeResolved
      ? allThreads
      : allThreads.filter((thread) => thread.status === "unresolved");

    const threads = filteredThreads.slice(0, limitThreads).map((thread) => ({
      id: thread.id,
      status: thread.status,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      resolvedAt: thread.resolvedAt,
      anchor: {
        from: thread.anchorFrom,
        to: thread.anchorTo,
        exact: thread.anchorExact,
      },
      comments: thread.comments.map((comment) => ({
        id: comment.id,
        userId: comment.userId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        ...safeCommentContent(comment.content, maxCharsPerComment),
      })),
    }));

    const totalComments = filteredThreads.reduce(
      (sum, thread) => sum + thread.comments.length,
      0
    );

    return {
      success: true,
      data: {
        recipeId,
        recipeTitle: recipe.title ?? "Untitled Recipe",
        includeResolved,
        totalThreads: filteredThreads.length,
        totalComments,
        returnedThreads: threads.length,
        threads,
        url: recipeUrl(recipeId),
      },
    };
  } catch (error) {
    console.error("recipes_get_comments execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const recipesUpdateRecipeTool: Anthropic.Tool = {
  name: "recipes_update_recipe",
  description:
    "Update a recipe's title and/or content. Use this to save edits when the user asks you to add ingredients, change instructions, fix typos, or revise a recipe. Content is rich text (can include formatting).",
  input_schema: {
    type: "object" as const,
    properties: {
      recipeId: {
        type: "string",
        description:
          "Recipe ID (the UUID in /dashboard/recipes/{recipeId}).",
      },
      title: {
        type: "string",
        description: "Updated recipe title (e.g. dish name).",
      },
      content: {
        type: "string",
        description:
          "Updated full recipe content (replaces existing). Include ingredients, instructions, notes. Can use HTML/rich text formatting.",
      },
    },
    required: ["recipeId"],
  },
};

export async function executeRecipesUpdateRecipe(
  parameters: Record<string, unknown>
): ToolResult {
  try {
    const recipeId = asString(parameters.recipeId);
    if (!recipeId) {
      return { success: false, error: "recipeId is required" };
    }

    const titleProvided = typeof parameters.title === "string";
    const contentProvided = typeof parameters.content === "string";

    if (!titleProvided && !contentProvided) {
      return {
        success: false,
        error: "At least one of title or content must be provided",
      };
    }

    const auth = await getAuthenticatedContext();
    if ("error" in auth) {
      return { success: false, error: auth.error };
    }

    const recipe = await getOwnedRecipe(auth.supabase, auth.userId, recipeId);
    if (!recipe) {
      return { success: false, error: "Recipe not found" };
    }

    const payload: {
      title?: string;
      content?: string;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (titleProvided) {
      const rawTitle = (parameters.title as string).trim();
      payload.title = rawTitle.length > 0 ? rawTitle : "Untitled Recipe";
    }

    if (contentProvided) {
      payload.content = await normalizeNoteContent(parameters.content as string);
    }

    const { data: updated, error } = await auth.supabase
      .schema(APP_SCHEMA)
      .from("notes")
      .update(payload)
      .eq("id", recipeId)
      .eq("user_id", auth.userId)
      .select("id, title, content, created_at, updated_at")
      .single();

    if (error || !updated) {
      return {
        success: false,
        error: error?.message ?? "Failed to update recipe",
      };
    }

    return {
      success: true,
      data: {
        recipe: {
          id: updated.id,
          title: updated.title ?? "Untitled Recipe",
          content: updated.content ?? "",
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
          url: recipeUrl(updated.id),
        },
      },
    };
  } catch (error) {
    console.error("recipes_update_recipe execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const recipesCreateRecipeTool: Anthropic.Tool = {
  name: "recipes_create_recipe",
  description:
    "Create a new recipe. Use when the user wants to add a new recipe to their cookbook. Returns the new recipe's ID and URL.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: {
        type: "string",
        description:
          "Recipe title (e.g. 'Chocolate Chip Cookies', 'Spaghetti Carbonara'). Defaults to 'New Recipe' if empty.",
      },
      content: {
        type: "string",
        description:
          "Optional initial recipe content (ingredients, instructions). Can be empty to start with a blank recipe.",
      },
    },
    required: [],
  },
};

export async function executeRecipesCreateRecipe(
  parameters: Record<string, unknown>
): ToolResult {
  try {
    const title =
      (typeof parameters.title === "string" && parameters.title.trim()) ||
      "New Recipe";
    const rawContent =
      (typeof parameters.content === "string" && parameters.content) || "";
    const content = await normalizeNoteContent(rawContent);

    const auth = await getAuthenticatedContext();
    if ("error" in auth) {
      return { success: false, error: auth.error };
    }

    const { data: existingRecipes, error: existingError } = await auth.supabase
      .schema(APP_SCHEMA)
      .from("notes")
      .select("document_path")
      .eq("user_id", auth.userId);

    if (existingError) {
      return { success: false, error: existingError.message };
    }

    const slug = createUniqueSlug(
      title,
      existingRecipes?.map((r) => r.document_path) ?? []
    );

    const { data: newRecipe, error: insertError } = await auth.supabase
      .schema(APP_SCHEMA)
      .from("notes")
      .insert({
        user_id: auth.userId,
        title: title.trim(),
        document_path: slugToDocumentPath(slug),
        sort_order: (existingRecipes?.length ?? 0) + 1,
        content,
      })
      .select("id, title, created_at, updated_at")
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return {
      success: true,
      data: {
        recipe: {
          id: newRecipe.id,
          title: newRecipe.title ?? "New Recipe",
          url: recipeUrl(newRecipe.id),
          createdAt: newRecipe.created_at,
          updatedAt: newRecipe.updated_at,
        },
      },
    };
  } catch (error) {
    console.error("recipes_create_recipe execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const recipesAddCommentTool: Anthropic.Tool = {
  name: "recipes_add_comment",
  description:
    "Create a new comment thread on a recipe. Use when the user wants to add a note, suggestion, or discussion point to a recipe.",
  input_schema: {
    type: "object" as const,
    properties: {
      recipeId: {
        type: "string",
        description:
          "Recipe ID (the UUID in /dashboard/recipes/{recipeId}).",
      },
      content: {
        type: "string",
        description: "Comment content for the new thread.",
      },
      anchorText: {
        type: "string",
        description: "Optional anchor text to attach the comment to a specific part of the recipe.",
      },
    },
    required: ["recipeId", "content"],
  },
};

export async function executeRecipesAddComment(
  parameters: Record<string, unknown>
): ToolResult {
  try {
    const recipeId = asString(parameters.recipeId);
    const content = asString(parameters.content);

    if (!recipeId) {
      return { success: false, error: "recipeId is required" };
    }
    if (!content) {
      return { success: false, error: "content is required" };
    }

    const auth = await getAuthenticatedContext();
    if ("error" in auth) {
      return { success: false, error: auth.error };
    }

    const recipe = await getOwnedRecipe(auth.supabase, auth.userId, recipeId);
    if (!recipe) {
      return { success: false, error: "Recipe not found" };
    }

    const plainContent = stripHtml(recipe.content ?? "");
    const anchorFrom = 1;
    const inferredAnchorText =
      asString(parameters.anchorText) ?? plainContent.slice(0, 120);
    const safeAnchorText = inferredAnchorText || "Recipe comment";
    const anchorTo = Math.max(
      2,
      Math.min(anchorFrom + safeAnchorText.length, plainContent.length + 1 || 2)
    );
    const anchorPrefix = "";
    const anchorSuffix = plainContent.slice(
      Math.max(0, anchorTo - 1),
      Math.max(0, anchorTo - 1 + 48)
    );

    const thread = await createThread({
      documentId: recipeId,
      userId: auth.userId,
      anchorFrom,
      anchorTo,
      anchorExact: safeAnchorText,
      anchorPrefix,
      anchorSuffix,
      content,
    });

    const rootComment = thread.comments[0];

    return {
      success: true,
      data: {
        recipeId,
        threadId: thread.id,
        rootCommentId: rootComment?.id ?? null,
        threadStatus: thread.status,
        createdAt: thread.createdAt,
        url: recipeUrl(recipeId),
      },
    };
  } catch (error) {
    console.error("recipes_add_comment execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const recipesReplyToCommentTool: Anthropic.Tool = {
  name: "recipes_reply_to_comment",
  description:
    "Add a reply to an existing comment thread on a recipe.",
  input_schema: {
    type: "object" as const,
    properties: {
      recipeId: {
        type: "string",
        description:
          "Recipe ID (the UUID in /dashboard/recipes/{recipeId}).",
      },
      threadId: {
        type: "string",
        description: "Thread ID to reply to.",
      },
      content: {
        type: "string",
        description: "Reply content.",
      },
    },
    required: ["recipeId", "threadId", "content"],
  },
};

export async function executeRecipesReplyToComment(
  parameters: Record<string, unknown>
): ToolResult {
  try {
    const recipeId = asString(parameters.recipeId);
    const threadId = asString(parameters.threadId);
    const content = asString(parameters.content);

    if (!recipeId) {
      return { success: false, error: "recipeId is required" };
    }
    if (!threadId) {
      return { success: false, error: "threadId is required" };
    }
    if (!content) {
      return { success: false, error: "content is required" };
    }

    const auth = await getAuthenticatedContext();
    if ("error" in auth) {
      return { success: false, error: auth.error };
    }

    const recipe = await getOwnedRecipe(auth.supabase, auth.userId, recipeId);
    if (!recipe) {
      return { success: false, error: "Recipe not found" };
    }

    const comment = await createComment({
      documentId: recipeId,
      threadId,
      userId: auth.userId,
      content,
    });

    return {
      success: true,
      data: {
        recipeId,
        threadId,
        commentId: comment.id,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        url: recipeUrl(recipeId),
      },
    };
  } catch (error) {
    console.error("recipes_reply_to_comment execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
