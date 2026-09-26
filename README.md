# Lounge Spirits

A drinks-recipe site: browse cocktails, filter by ingredient or tag, track what's in
your cabinet, and see what you can make. Favorites, added drinks, and edits are saved
to a real database so they're the same on every device.

## Stack

- **Vite + Vue 3** — frontend
- **Tailwind CSS v4** — via `@tailwindcss/vite`, theme in `src/style.css`
- **shadcn-vue** components in `src/components/ui/`
- **Express** — small API server in `server/`
- **Postgres (Neon)** — database, free tier

## Local development

You need two things running at once: the API server and the Vite dev server.

### 1. Set up the database

**New database (first time setting this up):**
1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the connection string from your Neon dashboard.
3. Copy `.env.example` to `.env` and paste it in as `DATABASE_URL`.
4. Run the schema against your database:
   ```bash
   psql "$DATABASE_URL" -f server/schema.sql
   ```
   (If you don't have `psql` installed, Neon's dashboard has a SQL editor you can
   paste `server/schema.sql` into instead.)
5. Load the starter data:
   ```bash
   npm run seed
   ```

**Already have a database from before the cabinet/ingredient-units update?** Run
the migration instead of the full schema:
```bash
psql "$DATABASE_URL" -f server/migrate_001_cabinet_units.sql
```
This adds the new `unit` column and `cabinet_items` table, and copies your existing
have/don't-have list into cabinet entries at 100% fill. It leaves the old
`bar_inventory` table in place (unused) so you can double-check the migration before
dropping it yourself.

### 2. Run both servers

```bash
npm install
npm run server   # starts the API on http://localhost:3001
```

In a second terminal:

```bash
npm run dev       # starts Vite on http://localhost:5173
```

Vite proxies `/api/*` requests to the Express server automatically (see
`vite.config.js`), so open `http://localhost:5173` — not the server's port — while
developing.

## Deploying to Render (free)

1. Push this repo to GitHub.
2. Create a free Postgres database at [neon.tech](https://neon.tech) if you haven't
   already, and run `server/schema.sql` + `npm run seed` against it (seeding can be
   done from your own machine, pointed at the Neon `DATABASE_URL` — it doesn't need
   to run on Render).
3. On [render.com](https://render.com), create a new **Web Service** from your repo.
   If you commit `render.yaml`, Render will pick up the build/start commands
   automatically — otherwise set them manually:
   - Build command: `npm install && npm run build`
   - Start command: `npm run server`
4. Add an environment variable: `DATABASE_URL` = your Neon connection string.
5. Deploy. Render builds the frontend and starts the Express server, which serves
   both the API and the built site from one URL.

**Good to know:** Render's free tier sleeps after ~15 minutes idle; the next visit
wakes it up, which takes 30-50+ seconds. Neon's free tier also suspends after
inactivity but wakes in under a couple of seconds, so it's rarely the noticeable part.

## Structure

```
server/
  index.js                     Express API — drinks, ingredients, cabinet endpoints
  schema.sql                    fresh install: run once against a new Neon database
  migrate_001_cabinet_units.sql  existing database: adds unit + cabinet_items
  seed.js                        loads src/data/*.json into the database (one-time or re-run)
src/
  components/ui/       shadcn-vue components
  components/           DrinkCard, DrinkDetailDialog, DrinkFormDialog, CabinetEntryRow,
                          AddToCabinetDialog, IngredientFormDialog, FillLevelSlider, etc.
  composables/
    useDrinks.js         loads from and mutates through the API — shared app state
  data/
    ingredients.json     starter data, only used by the seed script now
    drinks.json            (not read by the running app — the database is the source of truth)
    bar-inventory.json     starter cabinet fill levels, also seed-only
  lib/
    api.js                thin fetch wrapper for the backend
    utils.js               cn() helper for shadcn components
  pages/
    BrowsePage.vue        all drinks, search + filter
    CabinetPage.vue       your cabinet (fill levels) + "what can I make"
    IngredientsPage.vue   add/edit ingredients, their category and measurement type
```

## API

All endpoints are under `/api`:

| Method | Path | Purpose |
|---|---|---|
| GET | `/ingredients` | list all ingredients |
| POST | `/ingredients` | create an ingredient (`{ name, category, description, unit }`) |
| PUT | `/ingredients/:id` | update an ingredient |
| DELETE | `/ingredients/:id` | delete an ingredient (also removes it from the cabinet) |
| GET | `/cabinet` | list cabinet entries (`{ ingredientId, fillPercent, quantity }`) |
| PUT | `/cabinet/:ingredientId` | add or update a cabinet entry's fill level/quantity |
| DELETE | `/cabinet/:ingredientId` | remove an ingredient from the cabinet |
| GET | `/drinks` | list all drinks |
| POST | `/drinks` | create a drink |
| PUT | `/drinks/:id` | update a drink |
| PATCH | `/drinks/:id/favorite` | toggle favorite (`{ favorite: true/false }`) |
| DELETE | `/drinks/:id` | delete a drink |

An ingredient's `unit` is either `ml` (measured — gets a 0/25/50/75/100% fill slider
in the cabinet) or `count` (discrete items like limes or mint — gets a plain number
instead, since a fill percentage doesn't mean anything for something you count).

## Adding more shadcn-vue components later

```bash
npx shadcn-vue@latest add dialog
```

`components.json` is already configured (style: new-york, base color: neutral) so
this should work from your own machine (the CLI needs to reach shadcn-vue.com's
registry, which may not be reachable from every environment).
