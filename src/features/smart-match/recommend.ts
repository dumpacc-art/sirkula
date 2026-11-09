/** Recommendation among eligible partners (available and quoted). Weights sum to 1. */
export const RECOMMEND_WEIGHTS = { price: 0.5, distance: 0.3, fit: 0.2 } as const

/** Share of the partner's accepted types that this order uses. Higher means a more specialised match. */
export function materialFit(orderTypes: string[], accepts: string[]): number {
  if (accepts.length === 0) return 0
  return orderTypes.filter(x => accepts.includes(x)).length / accepts.length
}

export interface Candidate { id: string; priceIdr: number; distanceKm: number; fit: number }

/** Best candidate by weighted score. Price and distance are relative to the cheapest and closest eligible partner. Ties go to the lower price. */
export function pickRecommended(cands: Candidate[]): string | null {
  if (cands.length === 0) return null
  const minP = Math.min(...cands.map(c => c.priceIdr)), minD = Math.min(...cands.map(c => c.distanceKm))
  const score = (c: Candidate) => {
    const priceS = minP / c.priceIdr
    const distS = c.distanceKm === 0 ? 1 : minD === 0 ? 0 : minD / c.distanceKm
    return RECOMMEND_WEIGHTS.price * priceS + RECOMMEND_WEIGHTS.distance * distS + RECOMMEND_WEIGHTS.fit * c.fit
  }
  return [...cands].sort((a, b) => score(b) - score(a) || a.priceIdr - b.priceIdr)[0].id
}
