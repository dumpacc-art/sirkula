/**
 * Central collection pricing configuration. Formula: H = B + (J x T) + (W x K)
 *   B = fixed SIRKULA fee (IDR), J = one-way distance pickup -> facility (km),
 *   T = regional transport rate (IDR/km), W = estimated weight (kg), K = handling rate (IDR/kg).
 *
 * Only a region with verified: true can be quoted. Every other region needs its rate configured first.
 * Do not add unverified numbers here: a missing tariff is shown as "needs configuration", never guessed.
 */
export const PRICING_DEFAULTS = { fixedFeeIdr: 10000, handlingPerKgIdr: 800 } as const

export interface RegionalTariff {
  verified: boolean
  /** T: IDR per km. null until verified. */
  transportPerKmIdr: number | null
  /** K override. Falls back to PRICING_DEFAULTS.handlingPerKgIdr when absent. */
  handlingPerKgIdr?: number
  source?: string
}

/** Keys are region ids from lib/pricing REGIONS. Regions without a verified entry cannot be quoted. */
export const REGIONAL_TARIFFS: Record<string, RegionalTariff> = {
  bali: { verified: true, transportPerKmIdr: 1000, handlingPerKgIdr: 800, source: 'SIRKULA specification (Bali default)' },
  jawa: { verified: false, transportPerKmIdr: null },
  sumatera: { verified: false, transportPerKmIdr: null },
  kalimantan: { verified: false, transportPerKmIdr: null },
  sulawesi: { verified: false, transportPerKmIdr: null },
  'nusa-tenggara': { verified: false, transportPerKmIdr: null },
  maluku: { verified: false, transportPerKmIdr: null },
  papua: { verified: false, transportPerKmIdr: null },
}
