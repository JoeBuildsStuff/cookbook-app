-- Add recipe icon support for cookbook notes/recipes
ALTER TABLE cookbook.notes
  ADD COLUMN IF NOT EXISTS icon_name text;

UPDATE cookbook.notes
SET icon_name = 'utensils-crossed'
WHERE icon_name IS NULL;

ALTER TABLE cookbook.notes
  ALTER COLUMN icon_name SET DEFAULT 'utensils-crossed',
  ALTER COLUMN icon_name SET NOT NULL;
