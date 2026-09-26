import { ref, computed } from 'vue'
import { api } from '@/lib/api'

// module-level (shared) state so Browse and Cabinet pages stay in sync
const ingredients = ref([])
const drinks = ref([])
// Map<ingredientId, { fillPercent: number|null, quantity: number|null }>
const cabinetItems = ref(new Map())
const loading = ref(true)
const loadError = ref(null)

const search = ref('')
const activeFilters = ref(new Set())
const activeTagFilters = ref(new Set())
const showOnlyMakeable = ref(false)

let loadStarted = false

async function loadAll() {
  if (loadStarted) return
  loadStarted = true
  loading.value = true
  loadError.value = null
  try {
    const [ing, dr, cab] = await Promise.all([
      api.getIngredients(),
      api.getDrinks(),
      api.getCabinet(),
    ])
    ingredients.value = ing
    drinks.value = dr
    cabinetItems.value = new Map(
      cab.map((c) => [c.ingredientId, { fillPercent: c.fillPercent, quantity: c.quantity }]),
    )
  } catch (err) {
    console.error(err)
    loadError.value = 'Could not reach the server. Is the API running?'
  } finally {
    loading.value = false
  }
}

export function useDrinks() {
  loadAll()

  function toggleShowOnlyMakeable(value) {
    showOnlyMakeable.value = value
  }

  function setSearch(value) {
    search.value = value
  }

  function ingUnit(id) {
    return ingredients.value.find((i) => i.id === id)?.unit ?? 'ml'
  }

  // add or update a cabinet entry's fill level / quantity
  async function setCabinetItem(ingredientId, { fillPercent, quantity }) {
    const previous = cabinetItems.value.get(ingredientId)
    const next = new Map(cabinetItems.value)
    next.set(ingredientId, { fillPercent: fillPercent ?? null, quantity: quantity ?? null })
    cabinetItems.value = next
    try {
      await api.setCabinetItem(ingredientId, { fillPercent, quantity })
    } catch (err) {
      console.error(err)
      const reverted = new Map(cabinetItems.value)
      if (previous) reverted.set(ingredientId, previous)
      else reverted.delete(ingredientId)
      cabinetItems.value = reverted
    }
  }

  async function removeCabinetItem(ingredientId) {
    const previous = cabinetItems.value.get(ingredientId)
    const next = new Map(cabinetItems.value)
    next.delete(ingredientId)
    cabinetItems.value = next
    try {
      await api.removeCabinetItem(ingredientId)
    } catch (err) {
      console.error(err)
      if (previous) {
        const reverted = new Map(cabinetItems.value)
        reverted.set(ingredientId, previous)
        cabinetItems.value = reverted
      }
    }
  }

  function toggleFilter(id) {
    const next = new Set(activeFilters.value)
    next.has(id) ? next.delete(id) : next.add(id)
    activeFilters.value = next
  }

  function clearFilters() {
    activeFilters.value = new Set()
  }

  function toggleTagFilter(tag) {
    const next = new Set(activeTagFilters.value)
    next.has(tag) ? next.delete(tag) : next.add(tag)
    activeTagFilters.value = next
  }

  function clearTagFilters() {
    activeTagFilters.value = new Set()
  }

  async function toggleFavorite(drinkId) {
    const drink = drinks.value.find((d) => d.id === drinkId)
    if (!drink) return
    const nextFavorite = !drink.favorite
    drinks.value = drinks.value.map((d) =>
      d.id === drinkId ? { ...d, favorite: nextFavorite } : d,
    )
    try {
      await api.setFavorite(drinkId, nextFavorite)
    } catch (err) {
      console.error(err)
      drinks.value = drinks.value.map((d) =>
        d.id === drinkId ? { ...d, favorite: !nextFavorite } : d,
      )
    }
  }

  async function addDrink(drink) {
    const created = await api.createDrink(drink)
    drinks.value = [...drinks.value, created]
    return created
  }

  async function updateDrink(drinkId, fields) {
    const updated = await api.updateDrink(drinkId, fields)
    drinks.value = drinks.value.map((d) => (d.id === drinkId ? updated : d))
    return updated
  }

  async function removeDrink(drinkId) {
    await api.deleteDrink(drinkId)
    drinks.value = drinks.value.filter((d) => d.id !== drinkId)
  }

  async function addIngredient(ingredient) {
    const created = await api.createIngredient(ingredient)
    ingredients.value = [...ingredients.value, created]
    return created
  }

  async function updateIngredient(id, fields) {
    const updated = await api.updateIngredient(id, fields)
    ingredients.value = ingredients.value.map((i) => (i.id === id ? updated : i))
    return updated
  }

  async function removeIngredient(id) {
    await api.deleteIngredient(id)
    ingredients.value = ingredients.value.filter((i) => i.id !== id)
    const next = new Map(cabinetItems.value)
    next.delete(id)
    cabinetItems.value = next
  }

  function ingName(id) {
    return ingredients.value.find((i) => i.id === id)?.name ?? id
  }

  function ingDescription(id) {
    return ingredients.value.find((i) => i.id === id)?.description ?? ''
  }

  function missingIngredients(drink) {
    return drink.ingredients
      .map((i) => i.id)
      .filter((id) => !cabinetItems.value.has(id))
  }

  const ingredientsByCategory = computed(() => {
    const groups = {}
    for (const ing of ingredients.value) {
      groups[ing.category] = groups[ing.category] || []
      groups[ing.category].push(ing)
    }
    return groups
  })

  const allTags = computed(() => {
    const set = new Set()
    for (const d of drinks.value) {
      for (const t of d.tags || []) set.add(t)
    }
    return [...set].sort()
  })

  // cabinet entries joined with their ingredient info, for display on the Cabinet page
  const cabinetEntries = computed(() => {
    return [...cabinetItems.value.entries()]
      .map(([ingredientId, entry]) => {
        const ing = ingredients.value.find((i) => i.id === ingredientId)
        if (!ing) return null
        return { ...ing, ...entry }
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  // ingredients not yet in the cabinet, for the "add to cabinet" picker
  const availableToAdd = computed(() =>
    ingredients.value.filter((i) => !cabinetItems.value.has(i.id)),
  )

  function applySearchAndFilters(list) {
    let result = list

    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      result = result.filter((d) => d.name.toLowerCase().includes(q))
    }

    if (activeFilters.value.size > 0) {
      result = result.filter((d) => {
        const drinkIngredientIds = new Set(d.ingredients.map((i) => i.id))
        return [...activeFilters.value].every((id) => drinkIngredientIds.has(id))
      })
    }

    if (activeTagFilters.value.size > 0) {
      result = result.filter((d) => {
        const drinkTags = new Set(d.tags || [])
        return [...activeTagFilters.value].every((t) => drinkTags.has(t))
      })
    }

    return result
  }

  const filteredDrinks = computed(() => {
    const base = applySearchAndFilters(drinks.value)
    const annotated = base.map((d) => {
      const missing = missingIngredients(d)
      return { ...d, missing, missingCount: missing.length }
    })
    return annotated.sort((a, b) => a.missingCount - b.missingCount)
  })

  const cabinetDrinks = computed(() => {
    let result = filteredDrinks.value
    if (showOnlyMakeable.value) {
      result = result.filter((d) => d.missingCount === 0)
    }
    return result
  })

  return {
    ingredients,
    drinks,
    loading,
    loadError,
    cabinetItems,
    cabinetEntries,
    availableToAdd,
    activeFilters,
    activeTagFilters,
    allTags,
    search,
    setSearch,
    showOnlyMakeable,
    toggleShowOnlyMakeable,
    setCabinetItem,
    removeCabinetItem,
    toggleFilter,
    clearFilters,
    toggleTagFilter,
    clearTagFilters,
    toggleFavorite,
    addDrink,
    updateDrink,
    removeDrink,
    addIngredient,
    updateIngredient,
    removeIngredient,
    ingName,
    ingDescription,
    ingUnit,
    ingredientsByCategory,
    filteredDrinks,
    cabinetDrinks,
  }
}
