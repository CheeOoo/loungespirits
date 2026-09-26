import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pg from 'pg'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

// ---------- Ingredients ----------

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

app.get('/api/ingredients', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM ingredients ORDER BY name')
  res.json(rows)
})

app.post('/api/ingredients', async (req, res) => {
  const { name, category, description, unit } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' })
  }
  let id = slugify(name)
  try {
    // avoid id collisions
    let finalId = id
    let n = 2
    while (true) {
      const { rows } = await pool.query('SELECT 1 FROM ingredients WHERE id = $1', [finalId])
      if (rows.length === 0) break
      finalId = `${id}-${n}`
      n++
    }
    const { rows } = await pool.query(
      `INSERT INTO ingredients (id, name, category, description, unit)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [finalId, name.trim(), category || 'other', description?.trim() || null, unit || 'ml'],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create ingredient.' })
  }
})

app.put('/api/ingredients/:id', async (req, res) => {
  const { id } = req.params
  const { name, category, description, unit } = req.body
  const { rows } = await pool.query(
    `UPDATE ingredients SET name = $2, category = $3, description = $4, unit = $5
     WHERE id = $1 RETURNING *`,
    [id, name, category, description?.trim() || null, unit],
  )
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Ingredient not found.' })
  }
  res.json(rows[0])
})

app.delete('/api/ingredients/:id', async (req, res) => {
  await pool.query('DELETE FROM ingredients WHERE id = $1', [req.params.id])
  res.status(204).end()
})

// ---------- Cabinet (fill-level inventory) ----------

app.get('/api/cabinet', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM cabinet_items')
  res.json(
    rows.map((r) => ({
      ingredientId: r.ingredient_id,
      fillPercent: r.fill_percent,
      quantity: r.quantity,
    })),
  )
})

// create or update a cabinet entry (used both when adding a new ingredient to
// the cabinet, and when adjusting an existing one's fill level/quantity)
app.put('/api/cabinet/:ingredientId', async (req, res) => {
  const { ingredientId } = req.params
  const { fillPercent, quantity } = req.body
  const { rows } = await pool.query(
    `INSERT INTO cabinet_items (ingredient_id, fill_percent, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (ingredient_id) DO UPDATE SET fill_percent = $2, quantity = $3
     RETURNING *`,
    [ingredientId, fillPercent ?? null, quantity ?? null],
  )
  const r = rows[0]
  res.json({ ingredientId: r.ingredient_id, fillPercent: r.fill_percent, quantity: r.quantity })
})

app.delete('/api/cabinet/:ingredientId', async (req, res) => {
  await pool.query('DELETE FROM cabinet_items WHERE ingredient_id = $1', [req.params.ingredientId])
  res.status(204).end()
})

// ---------- Drinks ----------

function rowToDrink(row) {
  return {
    id: row.id,
    name: row.name,
    glass: row.glass,
    method: row.method,
    image: row.image,
    description: row.description,
    favorite: row.favorite,
    tags: row.tags,
    ingredients: row.ingredients,
    instructions: row.instructions,
  }
}

app.get('/api/drinks', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM drinks ORDER BY name')
  res.json(rows.map(rowToDrink))
})

app.post('/api/drinks', async (req, res) => {
  const d = req.body
  try {
    await pool.query(
      `INSERT INTO drinks (id, name, glass, method, image, description, favorite, tags, ingredients, instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
    res.status(201).json(d)
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'A drink with this id already exists.' })
    } else {
      console.error(err)
      res.status(500).json({ error: 'Failed to create drink.' })
    }
  }
})

app.put('/api/drinks/:id', async (req, res) => {
  const { id } = req.params
  const d = req.body
  const { rows } = await pool.query(
    `UPDATE drinks SET
       name = $2, glass = $3, method = $4, image = $5, description = $6,
       favorite = $7, tags = $8, ingredients = $9, instructions = $10
     WHERE id = $1
     RETURNING *`,
    [
      id,
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
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Drink not found.' })
  }
  res.json(rowToDrink(rows[0]))
})

// lightweight favorite-only toggle, so the common case doesn't need a full drink payload
app.patch('/api/drinks/:id/favorite', async (req, res) => {
  const { id } = req.params
  const { favorite } = req.body
  const { rows } = await pool.query(
    'UPDATE drinks SET favorite = $2 WHERE id = $1 RETURNING *',
    [id, favorite],
  )
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Drink not found.' })
  }
  res.json(rowToDrink(rows[0]))
})

app.delete('/api/drinks/:id', async (req, res) => {
  await pool.query('DELETE FROM drinks WHERE id = $1', [req.params.id])
  res.status(204).end()
})

// ---------- Serve built frontend in production ----------

const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
