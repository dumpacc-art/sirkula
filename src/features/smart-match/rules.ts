/** Rule-based partner matching. Hard rules exclude partners first; distance, rating and remaining quota only rank the rest. */
export interface Partner {
  id: string; name: string; city: string; type: 'standard' | 'organic'; logo: string; hue: number
  accepts: string[]; base: { lat: number; lng: number }; radiusKm: number; rating: number; reviews: number; quotaKg: number
}
export interface RuleWeights { distance: number; rating: number; capacity: number }
export type Issue =
  | { kind: 'material'; missing: string[] }
  | { kind: 'area'; km: number; radius: number }
  | { kind: 'quota'; left: number; need: number }
export type Availability = 'available' | 'material' | 'area' | 'quota'
export interface PartnerEvaluation {
  partner: Partner; distanceKm: number; remainingKg: number; issues: Issue[]; availability: Availability; score: number | null
}
export interface OrderInput { wasteTypes: string[]; kg: number; lat: number; lng: number }

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const r = (x: number) => (x * Math.PI) / 180
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

/**
 * Hard rules, checked in this order: material accepted (every selected sub-category), inside coverage radius,
 * remaining quota covers the order. The first failing rule is the availability shown to the user.
 * Available partners are scored 0-100 from distance (closer), rating and remaining quota (weights from the sliders).
 */
export function evaluatePartners(order: OrderInput, partners: Partner[], load: Record<string, number>, w: RuleWeights): PartnerEvaluation[] {
  const out = partners.map((p): PartnerEvaluation => {
    const distanceKm = Math.round(haversineKm({ lat: order.lat, lng: order.lng }, p.base) * 10) / 10
    const remainingKg = Math.max(0, p.quotaKg - (load[p.id] ?? 0))
    const issues: Issue[] = []
    const missing = order.wasteTypes.filter(id => !p.accepts.includes(id))
    if (missing.length) issues.push({ kind: 'material', missing })
    if (distanceKm > p.radiusKm) issues.push({ kind: 'area', km: distanceKm, radius: p.radiusKm })
    if (remainingKg < order.kg) issues.push({ kind: 'quota', left: remainingKg, need: order.kg })
    const availability: Availability = issues.length === 0 ? 'available' : issues[0].kind
    let score: number | null = null
    if (availability === 'available') {
      const dS = Math.max(0, 1 - distanceKm / p.radiusKm), rS = p.rating / 5, cS = remainingKg / p.quotaKg
      const sum = w.distance + w.rating + w.capacity || 1
      score = Math.round((100 * (w.distance * dS + w.rating * rS + w.capacity * cS)) / sum)
    }
    return { partner: p, distanceKm, remainingKg, issues, availability, score }
  })
  const rank = (e: PartnerEvaluation) => (e.availability === 'available' ? 0 : 1)
  return out.sort((a, b) => rank(a) - rank(b) || (b.score ?? 0) - (a.score ?? 0) || a.distanceKm - b.distanceKm)
}
