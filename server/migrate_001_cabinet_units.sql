-- Run this if you already have a database from before the cabinet/ingredient-units
-- overhaul. Safe to run once. Adds the new unit column and cabinet_items table,
-- and migrates your existing bar_inventory (have/don't-have) into cabinet_items
-- at 100% fill for anything you'd checked off.
--
-- psql "$DATABASE_URL" -f server/migrate_001_cabinet_units.sql

ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'ml';

CREATE TABLE IF NOT EXISTS cabinet_items (
  ingredient_id TEXT PRIMARY KEY REFERENCES ingredients(id) ON DELETE CASCADE,
  fill_percent INTEGER CHECK (fill_percent IN (0, 25, 50, 75, 100)),
  quantity INTEGER CHECK (quantity >= 0)
);

-- Migrate old checkbox-style inventory: anything you'd marked "have" becomes
-- a cabinet entry at 100% fill (or quantity 1, for count-type ingredients —
-- none exist yet at migration time, but this keeps the migration correct
-- even if you'd already changed a unit before running it).
INSERT INTO cabinet_items (ingredient_id, fill_percent, quantity)
SELECT
  bi.ingredient_id,
  CASE WHEN i.unit = 'count' THEN NULL ELSE 100 END,
  CASE WHEN i.unit = 'count' THEN 1 ELSE NULL END
FROM bar_inventory bi
JOIN ingredients i ON i.id = bi.ingredient_id
ON CONFLICT (ingredient_id) DO NOTHING;

-- bar_inventory is no longer used by the app — drop it once you've confirmed
-- the migration above worked (SELECT * FROM cabinet_items; check it looks right).
-- Left as a manual step on purpose, in case you want to double check first:
-- DROP TABLE bar_inventory;
