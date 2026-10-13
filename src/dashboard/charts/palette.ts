// Validated against our dark surface (#0f172a) via the dataviz skill's validate_palette.js.
// Fixed order — never cycled or reassigned by rank. Past 8 categories, fold into "Other".
export const CATEGORICAL_PALETTE = [
  '#3987e5', // blue
  '#d95926', // orange
  '#199e70', // aqua
  '#c98500', // yellow
  '#d55181', // magenta
  '#008300', // green
  '#9085e9', // violet
  '#e66767', // red
]

export const OTHER_COLOR = '#64748b' // slate-500, deliberately outside the categorical set

// Reserved — never reused for series identity.
export const STATUS_COLORS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
}

// Sequential: one hue, light -> dark, for magnitude (heatmap, histogram).
export const SEQUENTIAL_BLUE = [
  '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b',
]

export const CHART_INK = {
  primary: '#f0efec',
  secondary: '#c3c2b7',
  muted: '#898781',
  gridline: '#2c2c2a',
  baseline: '#383835',
}

const MAX_SLOTS = 8

export interface CategoryValue {
  label: string
  value: number
}

/**
 * Caps a categorical series at `maxSlots` (default 8, the validated palette width),
 * folding the tail into "Other". Pie charts pass 6 — "part-to-whole at a glance only,
 * <= 6 segments" per the dataviz skill's anti-patterns guidance, stricter than bar/line.
 */
export function foldToSlots(data: CategoryValue[], maxSlots = MAX_SLOTS): (CategoryValue & { color: string })[] {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  if (sorted.length <= maxSlots) {
    return sorted.map((d, i) => ({ ...d, color: CATEGORICAL_PALETTE[i] }))
  }
  const head = sorted.slice(0, maxSlots - 1).map((d, i) => ({ ...d, color: CATEGORICAL_PALETTE[i] }))
  const tail = sorted.slice(maxSlots - 1)
  const otherValue = tail.reduce((sum, d) => sum + d.value, 0)
  return [...head, { label: 'Other', value: otherValue, color: OTHER_COLOR }]
}

export function sequentialColorFor(value: number, max: number): string {
  if (max <= 0) return SEQUENTIAL_BLUE[0]
  const ratio = Math.min(1, Math.max(0, value / max))
  const index = Math.round(ratio * (SEQUENTIAL_BLUE.length - 1))
  return SEQUENTIAL_BLUE[index]
}
