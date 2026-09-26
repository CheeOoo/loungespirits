const DRINKS_KEY = 'lounge-spirits-drinks-overrides'

// Overrides shape: { [drinkId]: partialDrinkFields }
// A partial override merges onto the base drink (favorite toggle, edited fields).
// A user-added drink (id not in base data) is stored as a full drink object here too.
function loadOverrides() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(DRINKS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveOverrides(overrides) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(DRINKS_KEY, JSON.stringify(overrides))
  } catch {
    // storage full or unavailable — fail silently, in-memory state still works this session
  }
}

export function getStoredOverrides() {
  return loadOverrides()
}

export function setStoredOverride(drinkId, partialOrFull) {
  const overrides = loadOverrides()
  overrides[drinkId] = { ...(overrides[drinkId] || {}), ...partialOrFull }
  saveOverrides(overrides)
}

export function deleteStoredOverride(drinkId) {
  const overrides = loadOverrides()
  delete overrides[drinkId]
  saveOverrides(overrides)
}
