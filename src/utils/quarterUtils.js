/**
 * Quarter and Month helper utilities for 3-Month Breakdown views in Charts
 */

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export const QUARTER_MONTH_MAP = {
  calendar: {
    Q1: { monthIndices: [0, 1, 2], names: ['Jan', 'Feb', 'Mar'], label: 'Q1 (Jan - Mar)' },
    Q2: { monthIndices: [3, 4, 5], names: ['Apr', 'May', 'Jun'], label: 'Q2 (Apr - Jun)' },
    Q3: { monthIndices: [6, 7, 8], names: ['Jul', 'Aug', 'Sep'], label: 'Q3 (Jul - Sep)' },
    Q4: { monthIndices: [9, 10, 11], names: ['Oct', 'Nov', 'Dec'], label: 'Q4 (Oct - Dec)' }
  },
  fiscal: {
    Q1: { monthIndices: [3, 4, 5], names: ['Apr', 'May', 'Jun'], label: 'Q1 (Apr - Jun)' },
    Q2: { monthIndices: [6, 7, 8], names: ['Jul', 'Aug', 'Sep'], label: 'Q2 (Jul - Sep)' },
    Q3: { monthIndices: [9, 10, 11], names: ['Oct', 'Nov', 'Dec'], label: 'Q3 (Oct - Dec)' },
    Q4: { monthIndices: [0, 1, 2], names: ['Jan', 'Feb', 'Mar'], label: 'Q4 (Jan - Mar)' }
  }
}

export const MONTH_COLORS = {
  m1: '#3b82f6', // Month 1: Blue
  m2: '#f59e0b', // Month 2: Warm Amber
  m3: '#10b981'  // Month 3: Fresh Emerald Green
}

/**
 * Returns month indices and names for a quarter in calendar or fiscal mode
 */
export function getQuarterMonths(quarter = 'Q1', mode = 'calendar') {
  const qKey = quarter && quarter !== 'ALL' ? quarter : 'Q1'
  const modeKey = mode === 'fiscal' ? 'fiscal' : 'calendar'
  return QUARTER_MONTH_MAP[modeKey][qKey] || QUARTER_MONTH_MAP.calendar.Q1
}
