import type { Role } from '../types'

/**
 * Single source of truth for role permissions (prototype).
 * This only controls what the UI shows. It is NOT security: real authorization must live on a backend.
 */
export const ROLES: readonly Role[] = ['generator', 'processor', 'transport', 'community', 'seller', 'buyer', 'admin']

/** App areas under /app/<key>. 'all' means every signed-in role. */
export const ROUTE_ACCESS: Record<string, readonly Role[] | 'all'> = {
  dashboard: 'all', materials: 'all', matching: 'all', tracking: 'all', communities: 'all', agreements: 'all',
  marketplace: 'all', orders: 'all', map: 'all', analytics: 'all', reports: 'all', notifications: 'all', pickup: 'all', premium: 'all', settings: 'all',
  admin: ['admin'],
}

/** Fine-grained actions. */
export const ACTION_ACCESS = {
  'admin.access': ['admin'],
  'evidence.review': ['admin'],
  'listing.create': ['seller'],
} as const satisfies Record<string, readonly Role[]>

export type Action = keyof typeof ACTION_ACCESS

export function canAccessRoute(role: Role | undefined, key: string): boolean {
  const rule = ROUTE_ACCESS[key]
  if (rule === undefined) return false
  if (rule === 'all') return true
  return !!role && rule.includes(role)
}

export function can(role: Role | undefined, action: Action): boolean {
  return !!role && (ACTION_ACCESS[action] as readonly Role[]).includes(role)
}
