-- Run this to add ingredient-substitute support. Safe to run once.
-- psql "$DATABASE_URL" -f server/migrate_003_substitutes.sql

CREATE TABLE IF NOT EXISTS ingredient_substitutes (
  ingredient_a_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  ingredient_b_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  PRIMARY KEY (ingredient_a_id, ingredient_b_id),
  CHECK (ingredient_a_id < ingredient_b_id)
);
