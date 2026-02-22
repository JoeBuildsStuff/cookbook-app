"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Tiptap from "@/components/tiptap/tiptap";
import { createClient } from "@/lib/supabase/client";

const APP_SCHEMA = "tech_stack_2026";

type NotesEditorClientProps = {
  noteId: string;
  initialTitle: string;
  initialContent: string;
};

export function NotesEditorClient({
  noteId,
  initialTitle,
  initialContent,
}: NotesEditorClientProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [showComments, setShowComments] = useState(true);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveDocument = useCallback(
    async (nextContent: string, nextTitle: string) => {
      setSaveState("saving");

      const supabase = createClient();
      const { error } = await supabase
        .schema(APP_SCHEMA)
        .from("notes")
        .update({
          title: nextTitle.trim() || "Untitled",
          content: nextContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId);

      if (error) {
        setSaveState("error");
        return;
      }

      setSaveState("saved");
      window.setTimeout(() => {
        setSaveState((current) => (current === "saved" ? "idle" : current));
      }, 1500);
    },
    [noteId]
  );

  const handleChange = useCallback(
    (nextContent: string) => {
      setContent(nextContent);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        void saveDocument(nextContent, title);
      }, 900);
    },
    [saveDocument, title]
  );

  const handleTitleBlur = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    void saveDocument(content, title);
  }, [content, saveDocument, title]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <input
        className="rounded-md border border-border bg-card px-3 py-2 text-sm"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onBlur={handleTitleBlur}
        placeholder="Untitled"
        aria-label="Note title"
      />

      <div className="absolute bottom-2 left-2 px-1 text-xs text-muted-foreground z-10">
        {saveState === "saving" ? "Saving…" : null}
        {saveState === "saved" ? "Saved" : null}
        {saveState === "error" ? "Save failed" : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Tiptap
          content={content}
          onChange={handleChange}
          commentsDocumentId={noteId}
          showComments={showComments}
          onShowCommentsChange={setShowComments}
          enableFileNodes
        />
      </div>
    </div>
  );
}
