-- Chat tables for tech_stack_2026 schema (agnostic tech stack).
-- Mirrors ai_transcriber chat structure: sessions, messages, attachments, tool calls, suggested actions, branch state.

-- Enums (schema-scoped)
CREATE TYPE tech_stack_2026.chat_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE tech_stack_2026.chat_action_type AS ENUM (
  'filter', 'sort', 'navigate', 'create', 'function_call'
);

-- chat_sessions (index user_id for RLS and list-by-user queries per best practices)
CREATE TABLE tech_stack_2026.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  title text NOT NULL DEFAULT 'New Chat',
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_sessions_user_id ON tech_stack_2026.chat_sessions(user_id);

-- chat_messages (depends on chat_sessions)
CREATE TABLE tech_stack_2026.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES tech_stack_2026.chat_sessions(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES tech_stack_2026.chat_messages(id) ON DELETE SET NULL,
  role tech_stack_2026.chat_role NOT NULL,
  content text NOT NULL DEFAULT '',
  reasoning text,
  context jsonb,
  function_result jsonb,
  citations jsonb,
  root_user_message_id uuid REFERENCES tech_stack_2026.chat_messages(id) ON DELETE SET NULL,
  variant_group_id uuid,
  variant_index int4 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  seq bigint GENERATED ALWAYS AS IDENTITY
);

CREATE INDEX idx_chat_messages_session_id ON tech_stack_2026.chat_messages(session_id);
CREATE INDEX idx_chat_messages_parent_id ON tech_stack_2026.chat_messages(parent_id);
CREATE INDEX idx_chat_messages_root_user_message_id ON tech_stack_2026.chat_messages(root_user_message_id);

-- chat_attachments
CREATE TABLE tech_stack_2026.chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES tech_stack_2026.chat_messages(id) ON DELETE CASCADE,
  name text NOT NULL,
  mime_type text NOT NULL,
  size bigint NOT NULL,
  storage_path text NOT NULL,
  width int4,
  height int4,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_attachments_message_id ON tech_stack_2026.chat_attachments(message_id);

-- chat_tool_calls
CREATE TABLE tech_stack_2026.chat_tool_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES tech_stack_2026.chat_messages(id) ON DELETE CASCADE,
  name text NOT NULL,
  arguments jsonb NOT NULL,
  result jsonb,
  reasoning text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_tool_calls_message_id ON tech_stack_2026.chat_tool_calls(message_id);

-- chat_suggested_actions
CREATE TABLE tech_stack_2026.chat_suggested_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES tech_stack_2026.chat_messages(id) ON DELETE CASCADE,
  type tech_stack_2026.chat_action_type NOT NULL,
  label text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_suggested_actions_message_id ON tech_stack_2026.chat_suggested_actions(message_id);

-- chat_branch_state (unique on session_id, user_message_id for upsert)
CREATE TABLE tech_stack_2026.chat_branch_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES tech_stack_2026.chat_sessions(id) ON DELETE CASCADE,
  user_message_id uuid NOT NULL REFERENCES tech_stack_2026.chat_messages(id) ON DELETE CASCADE,
  signature text,
  active_index int4 NOT NULL DEFAULT 0,
  signatures text[],
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_message_id)
);

CREATE INDEX idx_chat_branch_state_session_id ON tech_stack_2026.chat_branch_state(session_id);

-- Helper for RLS: true if the session belongs to the current user (created after chat_sessions exists)
CREATE OR REPLACE FUNCTION tech_stack_2026.is_chat_session_owner(p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = tech_stack_2026, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tech_stack_2026.chat_sessions
    WHERE id = p_session_id AND user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION tech_stack_2026.is_chat_session_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION tech_stack_2026.is_chat_session_owner(uuid) TO service_role;

-- RLS
ALTER TABLE tech_stack_2026.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_2026.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_2026.chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_2026.chat_tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_2026.chat_suggested_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_2026.chat_branch_state ENABLE ROW LEVEL SECURITY;

-- chat_sessions: owner can do everything (use (select auth.uid()) for single eval per query)
CREATE POLICY chat_sessions_select ON tech_stack_2026.chat_sessions
  FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY chat_sessions_insert ON tech_stack_2026.chat_sessions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY chat_sessions_update ON tech_stack_2026.chat_sessions
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY chat_sessions_delete ON tech_stack_2026.chat_sessions
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- chat_messages: access via session ownership
CREATE POLICY chat_messages_select ON tech_stack_2026.chat_messages
  FOR SELECT USING (tech_stack_2026.is_chat_session_owner(session_id));
CREATE POLICY chat_messages_insert ON tech_stack_2026.chat_messages
  FOR INSERT WITH CHECK (tech_stack_2026.is_chat_session_owner(session_id));
CREATE POLICY chat_messages_update ON tech_stack_2026.chat_messages
  FOR UPDATE USING (tech_stack_2026.is_chat_session_owner(session_id));
CREATE POLICY chat_messages_delete ON tech_stack_2026.chat_messages
  FOR DELETE USING (tech_stack_2026.is_chat_session_owner(session_id));

-- chat_attachments: via message -> session ownership
CREATE POLICY chat_attachments_select ON tech_stack_2026.chat_attachments
  FOR SELECT USING (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );
CREATE POLICY chat_attachments_insert ON tech_stack_2026.chat_attachments
  FOR INSERT WITH CHECK (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );
CREATE POLICY chat_attachments_update ON tech_stack_2026.chat_attachments
  FOR UPDATE USING (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );
CREATE POLICY chat_attachments_delete ON tech_stack_2026.chat_attachments
  FOR DELETE USING (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );

-- chat_tool_calls: via message -> session ownership
CREATE POLICY chat_tool_calls_select ON tech_stack_2026.chat_tool_calls
  FOR SELECT USING (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );
CREATE POLICY chat_tool_calls_insert ON tech_stack_2026.chat_tool_calls
  FOR INSERT WITH CHECK (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );
CREATE POLICY chat_tool_calls_update ON tech_stack_2026.chat_tool_calls
  FOR UPDATE USING (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );
CREATE POLICY chat_tool_calls_delete ON tech_stack_2026.chat_tool_calls
  FOR DELETE USING (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );

-- chat_suggested_actions: via message -> session ownership
CREATE POLICY chat_suggested_actions_select ON tech_stack_2026.chat_suggested_actions
  FOR SELECT USING (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );
CREATE POLICY chat_suggested_actions_insert ON tech_stack_2026.chat_suggested_actions
  FOR INSERT WITH CHECK (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );
CREATE POLICY chat_suggested_actions_update ON tech_stack_2026.chat_suggested_actions
  FOR UPDATE USING (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );
CREATE POLICY chat_suggested_actions_delete ON tech_stack_2026.chat_suggested_actions
  FOR DELETE USING (
    tech_stack_2026.is_chat_session_owner(
      (SELECT session_id FROM tech_stack_2026.chat_messages WHERE id = message_id)
    )
  );

-- chat_branch_state: via session ownership
CREATE POLICY chat_branch_state_select ON tech_stack_2026.chat_branch_state
  FOR SELECT USING (tech_stack_2026.is_chat_session_owner(session_id));
CREATE POLICY chat_branch_state_insert ON tech_stack_2026.chat_branch_state
  FOR INSERT WITH CHECK (tech_stack_2026.is_chat_session_owner(session_id));
CREATE POLICY chat_branch_state_update ON tech_stack_2026.chat_branch_state
  FOR UPDATE USING (tech_stack_2026.is_chat_session_owner(session_id));
CREATE POLICY chat_branch_state_delete ON tech_stack_2026.chat_branch_state
  FOR DELETE USING (tech_stack_2026.is_chat_session_owner(session_id));

-- Grants (schema already has USAGE/ALL from registry migration; ensure tables/sequences included)
GRANT ALL ON ALL TABLES IN SCHEMA tech_stack_2026 TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA tech_stack_2026 TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA tech_stack_2026 GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA tech_stack_2026 GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
