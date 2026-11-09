export const MAX_KG = 100000
export const MAX_BAGS = 1000
export const MAX_NOTES = 300
export const MAX_DAYS_AHEAD = 60

/** Accepts "12.5" or "12,5". The dot or comma is the decimal separator; thousand separators are not allowed. */
export function parseKg(s: string): number | null {
  const t = s.trim().replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(t)) return null
  const n = Number(t)
  return n > 0 && n <= MAX_KG ? n : null
}

/** Empty is allowed (optional). Otherwise a whole number from 1 to MAX_BAGS. */
export function bagsValid(s: string): boolean {
  const t = s.trim()
  if (!t) return true
  return /^\d+$/.test(t) && Number(t) >= 1 && Number(t) <= MAX_BAGS
}
export const parseBags = (s: string): number | null => (s.trim() ? Number(s.trim()) : null)

/** Local calendar date as YYYY-MM-DD (not UTC, so the date input matches the user's day). */
export function localDate(offsetDays = 0): string {
  const d = new Date(); d.setDate(d.getDate() + offsetDays)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
