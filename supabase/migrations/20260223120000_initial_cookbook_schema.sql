-- Initial cookbook app schema (fresh install baseline)
-- Includes notes + comments + chat in isolated cookbook schema.

CREATE SCHEMA IF NOT EXISTS cookbook;

-- Expose cookbook schema via PostgREST/Supabase API
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, cookbook';

-- Shared schema grants/default privileges
GRANT USAGE ON SCHEMA cookbook TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA cookbook TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA cookbook TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA cookbook GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA cookbook GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Notes
CREATE TABLE IF NOT EXISTS cookbook.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled',
  content text NOT NULL DEFAULT '',
  document_path text NOT NULL,
  sort_order double precision NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, document_path)
);

CREATE INDEX IF NOT EXISTS idx_cookbook_notes_user_id ON cookbook.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_cookbook_notes_user_path ON cookbook.notes(user_id, document_path);
CREATE INDEX IF NOT EXISTS idx_cookbook_notes_user_updated ON cookbook.notes(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cookbook_notes_user_viewed ON cookbook.notes(user_id, viewed_at DESC);

-- Comments
CREATE TABLE IF NOT EXISTS cookbook.comment_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES cookbook.notes(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'resolved')),
  anchor_from integer NOT NULL CHECK (anchor_from >= 1),
  anchor_to integer NOT NULL CHECK (anchor_to >= 1),
  anchor_exact text NOT NULL DEFAULT '',
  anchor_prefix text NOT NULL DEFAULT '',
  anchor_suffix text NOT NULL DEFAULT '',
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cookbook.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES cookbook.comment_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cookbook_comment_threads_document_id ON cookbook.comment_threads(document_id);
CREATE INDEX IF NOT EXISTS idx_cookbook_comment_threads_document_updated ON cookbook.comment_threads(document_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cookbook_comments_thread_id ON cookbook.comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_cookbook_comments_thread_created ON cookbook.comments(thread_id, created_at ASC);

ALTER TABLE cookbook.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookbook.comment_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookbook.comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'notes' AND policyname = 'notes_owner_select'
  ) THEN
    CREATE POLICY notes_owner_select ON cookbook.notes
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'notes' AND policyname = 'notes_owner_insert'
  ) THEN
    CREATE POLICY notes_owner_insert ON cookbook.notes
      FOR INSERT TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'notes' AND policyname = 'notes_owner_update'
  ) THEN
    CREATE POLICY notes_owner_update ON cookbook.notes
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'notes' AND policyname = 'notes_owner_delete'
  ) THEN
    CREATE POLICY notes_owner_delete ON cookbook.notes
      FOR DELETE TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'comment_threads' AND policyname = 'comment_threads_owner_select'
  ) THEN
    CREATE POLICY comment_threads_owner_select ON cookbook.comment_threads
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM cookbook.notes n
          WHERE n.id = comment_threads.document_id AND n.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'comment_threads' AND policyname = 'comment_threads_owner_insert'
  ) THEN
    CREATE POLICY comment_threads_owner_insert ON cookbook.comment_threads
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM cookbook.notes n
          WHERE n.id = comment_threads.document_id AND n.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'comment_threads' AND policyname = 'comment_threads_owner_update'
  ) THEN
    CREATE POLICY comment_threads_owner_update ON cookbook.comment_threads
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM cookbook.notes n
          WHERE n.id = comment_threads.document_id AND n.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM cookbook.notes n
          WHERE n.id = comment_threads.document_id AND n.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'comment_threads' AND policyname = 'comment_threads_owner_delete'
  ) THEN
    CREATE POLICY comment_threads_owner_delete ON cookbook.comment_threads
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM cookbook.notes n
          WHERE n.id = comment_threads.document_id AND n.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'comments' AND policyname = 'comments_owner_select'
  ) THEN
    CREATE POLICY comments_owner_select ON cookbook.comments
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM cookbook.comment_threads t
          JOIN cookbook.notes n ON n.id = t.document_id
          WHERE t.id = comments.thread_id AND n.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'comments' AND policyname = 'comments_owner_insert'
  ) THEN
    CREATE POLICY comments_owner_insert ON cookbook.comments
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM cookbook.comment_threads t
          JOIN cookbook.notes n ON n.id = t.document_id
          WHERE t.id = comments.thread_id AND n.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'comments' AND policyname = 'comments_owner_update'
  ) THEN
    CREATE POLICY comments_owner_update ON cookbook.comments
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM cookbook.comment_threads t
          JOIN cookbook.notes n ON n.id = t.document_id
          WHERE t.id = comments.thread_id AND n.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM cookbook.comment_threads t
          JOIN cookbook.notes n ON n.id = t.document_id
          WHERE t.id = comments.thread_id AND n.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'comments' AND policyname = 'comments_owner_delete'
  ) THEN
    CREATE POLICY comments_owner_delete ON cookbook.comments
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM cookbook.comment_threads t
          JOIN cookbook.notes n ON n.id = t.document_id
          WHERE t.id = comments.thread_id AND n.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Notes/comments RPC helpers
CREATE OR REPLACE FUNCTION cookbook.create_note_comment_thread_with_root(
  p_document_id uuid,
  p_user_id uuid,
  p_anchor_from integer,
  p_anchor_to integer,
  p_anchor_exact text,
  p_anchor_prefix text,
  p_anchor_suffix text,
  p_content text
)
RETURNS TABLE(thread_id uuid)
LANGUAGE plpgsql
AS $$
DECLARE
  v_thread_id uuid;
BEGIN
  INSERT INTO cookbook.comment_threads (
    document_id,
    created_by,
    status,
    anchor_from,
    anchor_to,
    anchor_exact,
    anchor_prefix,
    anchor_suffix
  )
  VALUES (
    p_document_id,
    p_user_id,
    'unresolved',
    p_anchor_from,
    p_anchor_to,
    COALESCE(p_anchor_exact, ''),
    COALESCE(p_anchor_prefix, ''),
    COALESCE(p_anchor_suffix, '')
  )
  RETURNING id INTO v_thread_id;

  INSERT INTO cookbook.comments (
    thread_id,
    user_id,
    content
  )
  VALUES (
    v_thread_id,
    p_user_id,
    p_content
  );

  RETURN QUERY SELECT v_thread_id;
END;
$$;

CREATE OR REPLACE FUNCTION cookbook.batch_update_note_comment_thread_anchors(
  p_document_id uuid,
  p_anchors jsonb,
  p_now timestamptz DEFAULT now()
)
RETURNS void
LANGUAGE sql
AS $$
  WITH payload AS (
    SELECT
      a.id,
      a.anchor_from,
      a.anchor_to,
      a.anchor_exact,
      a.anchor_prefix,
      a.anchor_suffix
    FROM jsonb_to_recordset(COALESCE(p_anchors, '[]'::jsonb)) AS a(
      id uuid,
      anchor_from integer,
      anchor_to integer,
      anchor_exact text,
      anchor_prefix text,
      anchor_suffix text
    )
    WHERE a.anchor_from >= 1
      AND a.anchor_to > a.anchor_from
  )
  UPDATE cookbook.comment_threads AS t
  SET
    anchor_from = p.anchor_from,
    anchor_to = p.anchor_to,
    anchor_exact = COALESCE(p.anchor_exact, t.anchor_exact),
    anchor_prefix = COALESCE(p.anchor_prefix, t.anchor_prefix),
    anchor_suffix = COALESCE(p.anchor_suffix, t.anchor_suffix),
    updated_at = p_now
  FROM payload AS p
  WHERE t.id = p.id
    AND t.document_id = p_document_id;
$$;

GRANT EXECUTE ON FUNCTION cookbook.create_note_comment_thread_with_root(uuid, uuid, integer, integer, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION cookbook.batch_update_note_comment_thread_anchors(uuid, jsonb, timestamptz) TO authenticated, service_role;

-- Chat types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'cookbook' AND t.typname = 'chat_role'
  ) THEN
    CREATE TYPE cookbook.chat_role AS ENUM ('user', 'assistant', 'system');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'cookbook' AND t.typname = 'chat_action_type'
  ) THEN
    CREATE TYPE cookbook.chat_action_type AS ENUM (
      'filter', 'sort', 'navigate', 'create', 'function_call'
    );
  END IF;
END $$;

-- Chat tables
CREATE TABLE IF NOT EXISTS cookbook.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  title text NOT NULL DEFAULT 'New Chat',
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cookbook_chat_sessions_user_id ON cookbook.chat_sessions(user_id);

CREATE TABLE IF NOT EXISTS cookbook.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES cookbook.chat_sessions(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES cookbook.chat_messages(id) ON DELETE SET NULL,
  role cookbook.chat_role NOT NULL,
  content text NOT NULL DEFAULT '',
  reasoning text,
  context jsonb,
  function_result jsonb,
  citations jsonb,
  root_user_message_id uuid REFERENCES cookbook.chat_messages(id) ON DELETE SET NULL,
  variant_group_id uuid,
  variant_index int4 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  seq bigint GENERATED ALWAYS AS IDENTITY
);

CREATE INDEX IF NOT EXISTS idx_cookbook_chat_messages_session_id ON cookbook.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_cookbook_chat_messages_parent_id ON cookbook.chat_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_cookbook_chat_messages_root_user_message_id ON cookbook.chat_messages(root_user_message_id);

CREATE TABLE IF NOT EXISTS cookbook.chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES cookbook.chat_messages(id) ON DELETE CASCADE,
  name text NOT NULL,
  mime_type text NOT NULL,
  size bigint NOT NULL,
  storage_path text NOT NULL,
  width int4,
  height int4,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cookbook_chat_attachments_message_id ON cookbook.chat_attachments(message_id);

CREATE TABLE IF NOT EXISTS cookbook.chat_tool_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES cookbook.chat_messages(id) ON DELETE CASCADE,
  name text NOT NULL,
  arguments jsonb NOT NULL,
  result jsonb,
  reasoning text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cookbook_chat_tool_calls_message_id ON cookbook.chat_tool_calls(message_id);

CREATE TABLE IF NOT EXISTS cookbook.chat_suggested_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES cookbook.chat_messages(id) ON DELETE CASCADE,
  type cookbook.chat_action_type NOT NULL,
  label text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cookbook_chat_suggested_actions_message_id ON cookbook.chat_suggested_actions(message_id);

CREATE TABLE IF NOT EXISTS cookbook.chat_branch_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES cookbook.chat_sessions(id) ON DELETE CASCADE,
  user_message_id uuid NOT NULL REFERENCES cookbook.chat_messages(id) ON DELETE CASCADE,
  signature text,
  active_index int4 NOT NULL DEFAULT 0,
  signatures text[],
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_message_id)
);
CREATE INDEX IF NOT EXISTS idx_cookbook_chat_branch_state_session_id ON cookbook.chat_branch_state(session_id);

CREATE OR REPLACE FUNCTION cookbook.is_chat_session_owner(p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = cookbook, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM cookbook.chat_sessions
    WHERE id = p_session_id AND user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION cookbook.is_chat_session_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION cookbook.is_chat_session_owner(uuid) TO service_role;

ALTER TABLE cookbook.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookbook.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookbook.chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookbook.chat_tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookbook.chat_suggested_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookbook.chat_branch_state ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_sessions' AND policyname = 'chat_sessions_select'
  ) THEN
    CREATE POLICY chat_sessions_select ON cookbook.chat_sessions
      FOR SELECT USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_sessions' AND policyname = 'chat_sessions_insert'
  ) THEN
    CREATE POLICY chat_sessions_insert ON cookbook.chat_sessions
      FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_sessions' AND policyname = 'chat_sessions_update'
  ) THEN
    CREATE POLICY chat_sessions_update ON cookbook.chat_sessions
      FOR UPDATE USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_sessions' AND policyname = 'chat_sessions_delete'
  ) THEN
    CREATE POLICY chat_sessions_delete ON cookbook.chat_sessions
      FOR DELETE USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_messages' AND policyname = 'chat_messages_select'
  ) THEN
    CREATE POLICY chat_messages_select ON cookbook.chat_messages
      FOR SELECT USING (cookbook.is_chat_session_owner(session_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_messages' AND policyname = 'chat_messages_insert'
  ) THEN
    CREATE POLICY chat_messages_insert ON cookbook.chat_messages
      FOR INSERT WITH CHECK (cookbook.is_chat_session_owner(session_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_messages' AND policyname = 'chat_messages_update'
  ) THEN
    CREATE POLICY chat_messages_update ON cookbook.chat_messages
      FOR UPDATE USING (cookbook.is_chat_session_owner(session_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_messages' AND policyname = 'chat_messages_delete'
  ) THEN
    CREATE POLICY chat_messages_delete ON cookbook.chat_messages
      FOR DELETE USING (cookbook.is_chat_session_owner(session_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_attachments' AND policyname = 'chat_attachments_select'
  ) THEN
    CREATE POLICY chat_attachments_select ON cookbook.chat_attachments
      FOR SELECT USING (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_attachments' AND policyname = 'chat_attachments_insert'
  ) THEN
    CREATE POLICY chat_attachments_insert ON cookbook.chat_attachments
      FOR INSERT WITH CHECK (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_attachments' AND policyname = 'chat_attachments_update'
  ) THEN
    CREATE POLICY chat_attachments_update ON cookbook.chat_attachments
      FOR UPDATE USING (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_attachments' AND policyname = 'chat_attachments_delete'
  ) THEN
    CREATE POLICY chat_attachments_delete ON cookbook.chat_attachments
      FOR DELETE USING (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_tool_calls' AND policyname = 'chat_tool_calls_select'
  ) THEN
    CREATE POLICY chat_tool_calls_select ON cookbook.chat_tool_calls
      FOR SELECT USING (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_tool_calls' AND policyname = 'chat_tool_calls_insert'
  ) THEN
    CREATE POLICY chat_tool_calls_insert ON cookbook.chat_tool_calls
      FOR INSERT WITH CHECK (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_tool_calls' AND policyname = 'chat_tool_calls_update'
  ) THEN
    CREATE POLICY chat_tool_calls_update ON cookbook.chat_tool_calls
      FOR UPDATE USING (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_tool_calls' AND policyname = 'chat_tool_calls_delete'
  ) THEN
    CREATE POLICY chat_tool_calls_delete ON cookbook.chat_tool_calls
      FOR DELETE USING (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_suggested_actions' AND policyname = 'chat_suggested_actions_select'
  ) THEN
    CREATE POLICY chat_suggested_actions_select ON cookbook.chat_suggested_actions
      FOR SELECT USING (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_suggested_actions' AND policyname = 'chat_suggested_actions_insert'
  ) THEN
    CREATE POLICY chat_suggested_actions_insert ON cookbook.chat_suggested_actions
      FOR INSERT WITH CHECK (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_suggested_actions' AND policyname = 'chat_suggested_actions_update'
  ) THEN
    CREATE POLICY chat_suggested_actions_update ON cookbook.chat_suggested_actions
      FOR UPDATE USING (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_suggested_actions' AND policyname = 'chat_suggested_actions_delete'
  ) THEN
    CREATE POLICY chat_suggested_actions_delete ON cookbook.chat_suggested_actions
      FOR DELETE USING (
        cookbook.is_chat_session_owner(
          (SELECT session_id FROM cookbook.chat_messages WHERE id = message_id)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_branch_state' AND policyname = 'chat_branch_state_select'
  ) THEN
    CREATE POLICY chat_branch_state_select ON cookbook.chat_branch_state
      FOR SELECT USING (cookbook.is_chat_session_owner(session_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_branch_state' AND policyname = 'chat_branch_state_insert'
  ) THEN
    CREATE POLICY chat_branch_state_insert ON cookbook.chat_branch_state
      FOR INSERT WITH CHECK (cookbook.is_chat_session_owner(session_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_branch_state' AND policyname = 'chat_branch_state_update'
  ) THEN
    CREATE POLICY chat_branch_state_update ON cookbook.chat_branch_state
      FOR UPDATE USING (cookbook.is_chat_session_owner(session_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'cookbook' AND tablename = 'chat_branch_state' AND policyname = 'chat_branch_state_delete'
  ) THEN
    CREATE POLICY chat_branch_state_delete ON cookbook.chat_branch_state
      FOR DELETE USING (cookbook.is_chat_session_owner(session_id));
  END IF;
END $$;
