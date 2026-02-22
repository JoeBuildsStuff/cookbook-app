ALTER TABLE tech_stack_2026.notes
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz;

ALTER TABLE tech_stack_2026.notes
  ALTER COLUMN viewed_at SET DEFAULT now();

UPDATE tech_stack_2026.notes
SET viewed_at = COALESCE(viewed_at, updated_at, created_at, now())
WHERE viewed_at IS NULL;

ALTER TABLE tech_stack_2026.notes
  ALTER COLUMN viewed_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notes_user_viewed
  ON tech_stack_2026.notes(user_id, viewed_at DESC);
