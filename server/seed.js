// One-time (or re-runnable) seed: loads src/data/*.json into the database.
// Usage: node server/seed.js
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'src', 'data')

function loadJson(name) {
  return JSON.parse(readFileSync(path.join(dataDir, name), 'utf-8'))
}

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

  const ingredients = loadJson('ingredients.json')
  const drinks = loadJson('drinks.json')
  const inventory = loadJson('bar-inventory.json')

  console.log(`Seeding ${ingredients.length} ingredients...`)
  for (const ing of ingredients) {
    await pool.query(
      `INSERT INTO ingredients (id, name, category, description, unit)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET name = $2, category = $3, description = $4, unit = $5`,
      [ing.id, ing.name, ing.category, ing.description || null, ing.unit || 'ml'],
    )
  }

  console.log(`Seeding ${drinks.length} drinks...`)
  for (const d of drinks) {
    await pool.query(
      `INSERT INTO drinks (id, name, glass, method, image, description, favorite, tags, ingredients, instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = $2, glass = $3, method = $4, image = $5, description = $6,
         favorite = $7, tags = $8, ingredients = $9, instructions = $10`,
      [
        d.id,
        d.name,
        d.glass,
        d.method || null,
        d.image || null,
        d.description || null,
        d.favorite || false,
        JSON.stringify(d.tags || []),
        JSON.stringify(d.ingredients || []),
        JSON.stringify(d.instructions || []),
      ],
    )
  }

  console.log(`Seeding cabinet (${inventory.length} items)...`)
  await pool.query('DELETE FROM cabinet_items')
  for (const item of inventory) {
    await pool.query(
      `INSERT INTO cabinet_items (ingredient_id, fill_percent, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (ingredient_id) DO UPDATE SET fill_percent = $2, quantity = $3`,
      [item.ingredientId, item.fillPercent ?? null, item.quantity ?? null],
    )
  }

  console.log('Done.')
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
