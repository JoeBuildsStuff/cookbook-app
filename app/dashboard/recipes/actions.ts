"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { normalizeNoteContent } from "@/lib/note-content";
import { createUniqueSlug, slugToDocumentPath } from "./note-path";

const APP_SCHEMA = "cookbook";
const DEFAULT_RECIPE_ICON = "utensils-crossed";
const RECIPE_ICON_NAME_SET = new Set<string>([
  "utensils-crossed",
  "chef-hat",
  "beef",
  "drumstick",
  "fish",
  "salad",
  "carrot",
  "apple",
  "pizza",
  "sandwich",
  "soup",
  "croissant",
  "cookie",
  "ice-cream-cone",
  "coffee",
]);

export async function updateNoteContentAction(
  noteId: string,
  content: string,
  title: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedId = noteId.trim();
  if (!trimmedId) {
    return { success: false, error: "Invalid note ID" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const sanitizedContent = await normalizeNoteContent(content);

  const { error } = await supabase
    .schema(APP_SCHEMA)
    .from("notes")
    .update({
      title: title.trim() || "Untitled",
      content: sanitizedContent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", trimmedId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/recipes/${encodeURIComponent(trimmedId)}`);
  revalidatePath("/dashboard/recipes");
  return { success: true };
}

export async function createNoteAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: existingNotes, error: existingError } = await supabase
    .schema(APP_SCHEMA)
    .from("notes")
    .select("document_path")
    .eq("user_id", user.id);

  if (existingError) {
    throw existingError;
  }

  const slug = createUniqueSlug(
    "My Note",
    existingNotes?.map((note) => note.document_path) ?? []
  );

  const { data: newNote, error: insertError } = await supabase
    .schema(APP_SCHEMA)
    .from("notes")
    .insert({
      user_id: user.id,
      title: "My Note",
      document_path: slugToDocumentPath(slug),
      sort_order: (existingNotes?.length ?? 0) + 1,
      content: "",
      icon_name: DEFAULT_RECIPE_ICON,
    })
    .select("id")
    .single();

  if (insertError) {
    throw insertError;
  }

  redirect(`/dashboard/recipes/${encodeURIComponent(newNote.id)}`);
}

export async function deleteNoteAction(noteId: string) {
  const normalizedNoteId = noteId.trim();
  if (!normalizedNoteId) {
    return { success: false, error: "Invalid note ID" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .schema(APP_SCHEMA)
    .from("notes")
    .delete()
    .eq("id", normalizedNoteId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/recipes");
  return { success: true };
}

export async function setNoteFavoriteAction(
  noteId: string,
  isFavorite: boolean
): Promise<{ success: boolean; error?: string }> {
  const normalizedNoteId = noteId.trim();
  if (!normalizedNoteId) {
    return { success: false, error: "Invalid note ID" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .schema(APP_SCHEMA)
    .from("notes")
    .update({
      is_favorite: isFavorite,
      updated_at: new Date().toISOString(),
    })
    .eq("id", normalizedNoteId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/recipes/${encodeURIComponent(normalizedNoteId)}`);
  revalidatePath("/dashboard/recipes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setNoteIconAction(
  noteId: string,
  iconName: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedNoteId = noteId.trim();
  if (!normalizedNoteId) {
    return { success: false, error: "Invalid note ID" };
  }

  if (!RECIPE_ICON_NAME_SET.has(iconName)) {
    return { success: false, error: "Invalid icon selection" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .schema(APP_SCHEMA)
    .from("notes")
    .update({
      icon_name: iconName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", normalizedNoteId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/recipes/${encodeURIComponent(normalizedNoteId)}`);
  revalidatePath("/dashboard/recipes");
  revalidatePath("/dashboard");
  return { success: true };
}
