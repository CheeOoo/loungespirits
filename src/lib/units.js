// Single source of truth for ingredient measurement types.
// - value: stored in the database (ingredients.unit)
// - label: shown in the Ingredients form dropdown
// - abbrev: short tag shown on drink cards, e.g. "2[ml]"
// - hasAmount: false means no number is entered for this unit (e.g. "top")
// - showsFillLevel: whether this unit gets a 0/25/50/75/100% slider in the cabinet
//   (vs. a plain count) — only true for genuinely poured/measured units.
export const UNIT_TYPES = [
  {
    value: 'cl',
    label: 'Centilitres (measured, shows a fill level)',
    abbrev: 'cl',
    hasAmount: true,
    showsFillLevel: true,
  },
  {
    value: 'ml',
    label: 'Millilitres (measured, shows a fill level)',
    abbrev: 'ml',
    hasAmount: true,
    showsFillLevel: true,
  },
  {
    value: 'count',
    label: 'Count (discrete items, e.g. limes, mint)',
    abbrev: 'x',
    hasAmount: true,
    showsFillLevel: false,
  },
  {
    value: 'dashes',
    label: 'Dashes (bitters, small measured amounts)',
    abbrev: 'dashes',
    hasAmount: true,
    showsFillLevel: true,
  },
  {
    value: 'barspoons',
    label: 'Barspoons',
    abbrev: 'bsp',
    hasAmount: true,
    showsFillLevel: true,
  },
  {
    value: 'top',
    label: 'Top up (no amount, e.g. soda water)',
    abbrev: 'top',
    hasAmount: false,
    showsFillLevel: true,
  },
]

const BY_VALUE = Object.fromEntries(UNIT_TYPES.map((u) => [u.value, u]))

export function getUnitType(value) {
  return BY_VALUE[value] || BY_VALUE.ml
}
