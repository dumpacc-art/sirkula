import type { PickupOrder } from '../../types'

/** Completed orders stay in History for this many days after completion, then are removed automatically. */
export const RETENTION_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

/** Expiry time in ms, or null when the record has no completion time (such records never expire). */
export function expiresAtMs(o: Pick<PickupOrder, 'completedAt'>): number | null {
  const done = Date.parse(o.completedAt ?? '')
  return Number.isFinite(done) ? done + RETENTION_DAYS * DAY_MS : null
}

export function isExpired(o: Pick<PickupOrder, 'completedAt'>, nowMs: number): boolean {
  const e = expiresAtMs(o)
  return e !== null && nowMs >= e
}

/** Whole days left before expiry, rounded up. Null when the record never expires. */
export function daysLeft(o: Pick<PickupOrder, 'completedAt'>, nowMs: number): number | null {
  const e = expiresAtMs(o)
  return e === null ? null : Math.max(0, Math.ceil((e - nowMs) / DAY_MS))
}

/** Splits history into records to keep and records past retention. */
export function splitExpired<T extends Pick<PickupOrder, 'completedAt'>>(orders: T[], nowMs: number): { kept: T[]; expired: T[] } {
  const kept: T[] = [], expired: T[] = []
  for (const o of orders) (isExpired(o, nowMs) ? expired : kept).push(o)
  return { kept, expired }
}
