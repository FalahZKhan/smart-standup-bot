-- ============================================================
-- Smart Daily Standup Bot - PostgreSQL Schema
-- ============================================================
-- Run this file to set up the database:
--   psql -U your_user -d standupdb -f schema.sql

-- Create the standups table
-- This stores all standup entries (both manual and GitHub-generated)
CREATE TABLE IF NOT EXISTS standups (
    id          SERIAL PRIMARY KEY,                      -- Auto-incrementing unique ID
    raw_input   TEXT NOT NULL,                           -- The original notes entered by the user
    ai_summary  TEXT NOT NULL,                           -- The AI-generated professional summary
    source      VARCHAR(50) DEFAULT 'manual',            -- Where it came from: 'manual' or 'github'
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- When it was saved
);

-- Index to speed up searches and sorting by date
CREATE INDEX IF NOT EXISTS idx_standups_created_at ON standups(created_at DESC);

-- Index to filter by source (manual vs github)
CREATE INDEX IF NOT EXISTS idx_standups_source ON standups(source);
