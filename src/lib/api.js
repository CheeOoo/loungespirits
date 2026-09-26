// In dev, Vite proxies /api to the Express server (see vite.config.js).
// In production, the same Express server serves both the API and the
// built frontend, so relative /api paths work unchanged either way.
const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  getIngredients: () => request('/ingredients'),
  createIngredient: (ingredient) =>
    request('/ingredients', { method: 'POST', body: JSON.stringify(ingredient) }),
  updateIngredient: (id, ingredient) =>
    request(`/ingredients/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(ingredient),
    }),
  deleteIngredient: (id) =>
    request(`/ingredients/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getCabinet: () => request('/cabinet'),
  setCabinetItem: (ingredientId, { fillPercent, quantity }) =>
    request(`/cabinet/${encodeURIComponent(ingredientId)}`, {
      method: 'PUT',
      body: JSON.stringify({ fillPercent, quantity }),
    }),
  removeCabinetItem: (ingredientId) =>
    request(`/cabinet/${encodeURIComponent(ingredientId)}`, { method: 'DELETE' }),

  getDrinks: () => request('/drinks'),
  createDrink: (drink) =>
    request('/drinks', { method: 'POST', body: JSON.stringify(drink) }),
  updateDrink: (id, drink) =>
    request(`/drinks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(drink),
    }),
  setFavorite: (id, favorite) =>
    request(`/drinks/${encodeURIComponent(id)}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ favorite }),
    }),
  deleteDrink: (id) => request(`/drinks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
