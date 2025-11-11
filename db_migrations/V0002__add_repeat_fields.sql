ALTER TABLE events ADD COLUMN IF NOT EXISTS repeat TEXT DEFAULT 'none';
ALTER TABLE events ADD COLUMN IF NOT EXISTS repeat_group_id TEXT;

CREATE INDEX IF NOT EXISTS idx_events_repeat_group ON events(repeat_group_id);
