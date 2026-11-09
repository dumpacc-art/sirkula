import type { PartnerBusinessType } from '../types'

/** Share of the total weight of ORGANIC waste a pickup partner receives through SIRKULA that goes to the SIRKULA office. */
export const ORGANIC_SHARE_PCT = 15
export const CONTRACT_VERSION = '2026-11 v1'
export const BUSINESS_TYPES: { value: PartnerBusinessType; label: string }[] = [
  { value: 'collector', label: 'Waste collector / transport' },
  { value: 'recycler', label: 'Recycler / processor' },
  { value: 'composter', label: 'Composter / organic processor' },
  { value: 'wastebank', label: 'Waste bank / community' },
  { value: 'other', label: 'Other business' },
]
/** Contract text shown before registering. `{pct}` is replaced with ORGANIC_SHARE_PCT. Prototype text, not legal advice. */
export const CONTRACT_CLAUSES: { title: string; body: string }[] = [
  { title: '1. Parties and purpose', body: 'This agreement is between SIRKULA ("SIRKULA") and the company named in your profile ("the Partner"). The Partner offers pickup and handling of the waste types it lists, and SIRKULA lists the Partner as an option when users book a pickup.' },
  { title: '2. Accepted waste and service area', body: 'The Partner only accepts the waste types, monthly capacity and service radius it declared in its profile, and keeps them accurate. The Partner may update them at any time; changes apply to new orders only.' },
  { title: '3. Pickup orders', body: 'When a user chooses the Partner, the Partner collects the waste at the agreed time and updates the order status. The price shown to the user at matching is the price for that order.' },
  { title: '4. Organic waste share to SIRKULA', body: 'The Partner agrees to hand over {pct}% of the total weight of organic waste it receives through SIRKULA to the SIRKULA office. The share is counted over each calendar month from the weights recorded when the waste arrives, and is delivered to the SIRKULA office or collected from the Partner by SIRKULA. This clause applies only to organic waste.' },
  { title: '5. Weighing and records', body: 'The Partner weighs every delivery on arrival and records the weight in SIRKULA. These records are used to calculate the organic share and the impact reports. Wrong or missing records can lead to suspension.' },
  { title: '6. Handling and evidence', body: 'The Partner handles waste safely and lawfully, keeps the permits that its business needs, and provides evidence of processing or reuse when SIRKULA asks for it.' },
  { title: '7. Suspension and ending', body: 'SIRKULA may suspend the Partner if records are inaccurate, the organic share is not delivered, or orders are repeatedly not served. Either side can end the agreement with 30 days written notice. Orders already confirmed are completed first.' },
  { title: '8. Prototype notice', body: 'This is a prototype. The agreement is saved as a record in this browser and is not a legally enforceable contract.' },
]
