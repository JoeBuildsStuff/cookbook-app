-- Add favorite support for cookbook notes/recipes
ALTER TABLE cookbook.notes
  ADD COLUMN IF NOT EXISTS is_favorite boolean;

UPDATE cookbook.notes
SET is_favorite = false
WHERE is_favorite IS NULL;

ALTER TABLE cookbook.notes
  ALTER COLUMN is_favorite SET DEFAULT false,
  ALTER COLUMN is_favorite SET NOT NULL;

-- Optimized for sidebar query: WHERE user_id = ? AND is_favorite = true ORDER BY updated_at DESC LIMIT N
CREATE INDEX IF NOT EXISTS idx_cookbook_notes_user_favorites_updated
  ON cookbook.notes (user_id, updated_at DESC)
  WHERE is_favorite = true;
