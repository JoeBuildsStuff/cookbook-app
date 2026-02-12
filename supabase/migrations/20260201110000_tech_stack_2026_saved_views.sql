-- saved_views table in tech_stack_2026 (agnostic tech stack).
-- Saved table configurations per user (filters, sorting, visibility, etc.).

CREATE TABLE tech_stack_2026.saved_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  table_key text NOT NULL,
  name text NOT NULL,
  description text,
  state jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE tech_stack_2026.saved_views IS 'Saved table configurations per user (filters, sorting, visibility, etc.)';
COMMENT ON COLUMN tech_stack_2026.saved_views.table_key IS 'Identifier for which table/view this configuration applies to (e.g., contacts, meetings)';
COMMENT ON COLUMN tech_stack_2026.saved_views.state IS 'JSON payload storing DataTable state (filters, sorting, column visibility/order, pagination, metadata)';

CREATE INDEX idx_saved_views_user_id ON tech_stack_2026.saved_views(user_id);
CREATE INDEX idx_saved_views_table_key ON tech_stack_2026.saved_views(table_key);
CREATE INDEX idx_saved_views_user_table ON tech_stack_2026.saved_views(user_id, table_key);

ALTER TABLE tech_stack_2026.saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_views_select ON tech_stack_2026.saved_views
  FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY saved_views_insert ON tech_stack_2026.saved_views
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY saved_views_update ON tech_stack_2026.saved_views
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY saved_views_delete ON tech_stack_2026.saved_views
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

GRANT ALL ON tech_stack_2026.saved_views TO anon, authenticated, service_role;
