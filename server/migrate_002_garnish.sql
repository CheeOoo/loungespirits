-- Run this to add the garnish field to drinks. Safe to run once.
-- psql "$DATABASE_URL" -f server/migrate_002_garnish.sql

ALTER TABLE drinks ADD COLUMN IF NOT EXISTS garnish_id TEXT REFERENCES ingredients(id) ON DELETE SET NULL;
