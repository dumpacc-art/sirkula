/**
 * Business rules shared across the app. Single source of truth: do not copy these lists into pages.
 * NOTE: this is a frontend prototype. These rules are enforced in the browser only; a real backend
 * must re-enforce every one of them (see docs/02-foundation.md, "Simulated vs backend").
 */

/** SIRKULA serves all of Indonesia. No region (e.g. Bali) is a default service area. */
export const SERVICE_AREA = {
  countryCode: 'ID',
  name: 'Indonesia',
  /** Neutral overview used before a user picks a place or shares their location. */
  overview: { lat: -2.5, lng: 118 },
  overviewZoom: 5,
} as const

/** Material categories accepted by the registry, matching and the facility map. */
export const MATERIAL_CATEGORIES: readonly string[] = ['Plastic', 'Paper', 'Organic', 'Glass', 'Metal', 'Textile', 'Electronics']

/** Default radius (km) for nearby-facility search. */
export const DEFAULT_SEARCH_RADIUS_KM = 10
