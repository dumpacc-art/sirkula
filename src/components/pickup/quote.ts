import type { Partner } from '../../features/smart-match/rules'
import { quoteCollection, type Quote } from '../../features/pricing/collectionPrice'
import type { Submission } from '../../types'

/** Price quote for the partner already chosen on a submission (regular partners only; the SIRKULA e-waste team has no quote). */
export function quoteForChosen(sub: Submission, partners: Partner[]): Quote | null {
  if (!sub.partner || sub.partner.team) return null
  const p = partners.find(x => x.id === sub.partner!.id)
  if (!p) return null
  return quoteCollection({ pickup: sub.pickup, facility: p.base, kg: sub.quantity.kg })
}
