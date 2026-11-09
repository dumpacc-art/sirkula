import type { Partner } from '../features/smart-match/rules'
import type { PickupPartner } from '../types'

const hueOf = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h }
const logoOf = (s: string) => s.replace(/^(PT|CV|UD)\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

/** A registered pickup partner as SmartMatch sees it. New partners have no reviews yet, so the rating starts neutral at 4.0. */
export function toPartner(p: PickupPartner): Partner {
  return {
    id: p.id, name: p.companyName, city: p.city, type: p.accepts.length > 0 && p.accepts.every(x => x.startsWith('org-')) ? 'organic' : 'standard',
    logo: logoOf(p.companyName), hue: hueOf(p.companyName), accepts: p.accepts, base: p.base, radiusKm: p.radiusKm, rating: 4, reviews: 0, quotaKg: p.quotaKg,
  }
}
