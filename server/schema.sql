-- Run this once against your Neon database to set up the schema.
-- psql "$DATABASE_URL" -f server/schema.sql

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  -- 'ml' = measured by volume (fill level makes sense in the cabinet)
  -- 'count' = discrete items (limes, mint, eggs) — tracked by quantity
  -- 'dashes', 'barspoons' = small measured amounts, still a real number
  -- 'top' = "fill to top" — no number entered, e.g. soda water
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
  instructions JSONB NOT NULL DEFAULT '[]',
  garnish_id TEXT REFERENCES ingredients(id) ON DELETE SET NULL
);

-- One row per ingredient currently in the cabinet.
-- For measured ingredients (ml/cl/oz): fill_percent is 0/25/50/75/100.
-- For count ingredients: quantity is the number on hand, fill_percent is unused (null).
CREATE TABLE IF NOT EXISTS cabinet_items (
  ingredient_id TEXT PRIMARY KEY REFERENCES ingredients(id) ON DELETE CASCADE,
  fill_percent INTEGER CHECK (fill_percent IN (0, 25, 50, 75, 100)),
  quantity INTEGER CHECK (quantity >= 0)
);

-- Symmetric "can stand in for" relationships between ingredients (e.g. Cointreau
-- / Triple Sec). Each pair is stored once, ordered so ingredient_a_id is always
-- the alphabetically-earlier id — the app enforces this ordering on write, so
-- there's never a separate reversed row to query both directions against.
CREATE TABLE IF NOT EXISTS ingredient_substitutes (
  ingredient_a_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  ingredient_b_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  PRIMARY KEY (ingredient_a_id, ingredient_b_id),
  CHECK (ingredient_a_id < ingredient_b_id)
);
