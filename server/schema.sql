-- Run this once against your Neon database to set up the schema.
-- psql "$DATABASE_URL" -f server/schema.sql

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  -- 'ml', 'cl', 'oz' = measured (poured from a container, fill level makes sense)
  -- 'count' = discrete items (limes, mint, eggs) — tracked by quantity, not a fill percentage
  unit TEXT NOT NULL DEFAULT 'ml'
);

CREATE TABLE IF NOT EXISTS drinks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  glass TEXT NOT NULL,
  method TEXT,
  image TEXT,
  description TEXT,
  favorite BOOLEAN NOT NULL DEFAULT false,
  tags JSONB NOT NULL DEFAULT '[]',
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions JSONB NOT NULL DEFAULT '[]'
);

-- One row per ingredient currently in the cabinet.
-- For measured ingredients (ml/cl/oz): fill_percent is 0/25/50/75/100.
-- For count ingredients: quantity is the number on hand, fill_percent is unused (null).
CREATE TABLE IF NOT EXISTS cabinet_items (
  ingredient_id TEXT PRIMARY KEY REFERENCES ingredients(id) ON DELETE CASCADE,
  fill_percent INTEGER CHECK (fill_percent IN (0, 25, 50, 75, 100)),
  quantity INTEGER CHECK (quantity >= 0)
);
