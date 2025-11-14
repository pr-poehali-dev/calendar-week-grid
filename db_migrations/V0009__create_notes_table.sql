-- Create notes table for storing user notes
CREATE TABLE IF NOT EXISTS t_p36597579_calendar_week_grid.notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON t_p36597579_calendar_week_grid.notes(user_id);