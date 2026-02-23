"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { normalizeNoteContent } from "@/lib/note-content";
import { createUniqueSlug, slugToDocumentPath } from "./note-path";

const APP_SCHEMA = "cookbook";

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
