import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { NotesEditorClient } from './notes-editor-client'

const APP_SCHEMA = 'tech_stack_2026'

export default async function NotesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const userId = user.id

  const { data: latestNote, error: latestNoteError } = await supabase
    .schema(APP_SCHEMA)
    .from('notes')
    .select('id, title, content')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestNoteError) {
    throw latestNoteError
  }

  let noteId = latestNote?.id ?? null
  let title = latestNote?.title ?? 'My Note'
  let content = latestNote?.content ?? ''

  if (!noteId) {
    const { data: inserted, error: insertError } = await supabase
      .schema(APP_SCHEMA)
      .from('notes')
      .insert({
        user_id: userId,
        title: 'My Note',
        document_path: '/my-note',
        sort_order: 0,
        content: '',
      })
      .select('id, title, content')
      .single()

    if (insertError || !inserted) {
      throw insertError ?? new Error('Unable to create note')
    }

    noteId = inserted.id
    title = inserted.title ?? 'My Note'
    content = inserted.content ?? ''
  }

  return <NotesEditorClient noteId={noteId} initialTitle={title} initialContent={content} />
}
