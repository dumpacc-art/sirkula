import { nearestHubAny, type Pt } from '../../lib/pricing'
import { PRICING_DEFAULTS, REGIONAL_TARIFFS } from '../../config/pricing'
import { haversineKm } from '../smart-match/rules'

/** H = B + (J x T) + (W x K), exact, before rounding. */
export const calcTotal = (B: number, J: number, T: number, W: number, K: number) => B + J * T + W * K

export interface RegionInfo { id: string; name: string }
export interface Breakdown {
  fixed: number; transport: number; handling: number
  /** Difference between the rounded total and the sum of the rounded parts (usually 0). Shown only when not 0. */
  rounding: number; total: number
  distanceKm: number; transportRate: number; weightKg: number; handlingRate: number
}
export type Quote = { status: 'ok'; region: RegionInfo; breakdown: Breakdown } | { status: 'needs_config'; region: RegionInfo }

/** Pricing region = region of the nearest processing hub to the pickup point. */
export function regionForPickup(pickup: Pt): RegionInfo {
  const r = nearestHubAny(pickup).region
  return { id: r.id, name: r.name }
}

/** Quote one partner. The total is rounded to whole Rupiah; the parts are rounded separately and the difference is shown. */
export function quoteCollection(input: { pickup: Pt; facility: Pt; kg: number }): Quote {
  const region = regionForPickup(input.pickup)
  const tariff = REGIONAL_TARIFFS[region.id]
  if (!tariff || !tariff.verified || tariff.transportPerKmIdr === null) return { status: 'needs_config', region }
  const J = haversineKm(input.pickup, input.facility)
  const B = PRICING_DEFAULTS.fixedFeeIdr, T = tariff.transportPerKmIdr
  const K = tariff.handlingPerKgIdr ?? PRICING_DEFAULTS.handlingPerKgIdr, W = input.kg
  const exact = calcTotal(B, J, T, W, K)
  const transport = Math.round(J * T), handling = Math.round(W * K)
  const total = Math.round(exact)
  return { status: 'ok', region, breakdown: { fixed: B, transport, handling, rounding: total - (B + transport + handling), total,
    distanceKm: J, transportRate: T, weightKg: W, handlingRate: K } }
}

export const formatIdr = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID')
