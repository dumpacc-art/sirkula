import { Sprout, MapPinned, Building2, Store, type LucideIcon } from 'lucide-react'

/** Program kerja sama yang bisa diajukan ke SIRKULA. `share` = bagian pengaju (%) pada usulan awal; sisanya SIRKULA. */
export interface CooperationProgram { id: string; Icon: LucideIcon; title: string; desc: string; who: string; terms: string[]; share: number }
export const SIRKULA_PARTY = 'SIRKULA'
export const cooperationPrograms: CooperationProgram[] = [
  { id: 'farm', Icon: Sprout, title: 'Farmer and compost supply', desc: 'Sell farm produce or compost through the circular marketplace, with the commission agreed beforehand.', who: 'Farmers, farmer groups',
    terms: ['Commission set in the agreement', 'Stock updated by the farmer', 'Origin recorded for each listing'], share: 85 },
  { id: 'point', Icon: MapPinned, title: 'Community collection point', desc: 'Run a drop-off point so neighbours can bring sorted waste close to home.', who: 'Waste banks, RT/RW, communities',
    terms: ['A fixed place and opening days', 'Basic sorting by material', 'Monthly volume report'], share: 60 },
  { id: 'corp', Icon: Building2, title: 'Corporate waste generator', desc: 'Regular pickup contract for hotels, factories and offices with traceable results.', who: 'Hotels, factories, offices',
    terms: ['Estimated monthly volume per material', 'Pickup schedule', 'Impact report per period'], share: 50 },
  { id: 'seller', Icon: Store, title: 'Marketplace seller', desc: 'List recycled or upcycled products on the SIRKULA marketplace.', who: 'Upcycle makers, small businesses',
    terms: ['Product origin recorded', 'Price and stock kept current', 'Commission shown before listing'], share: 90 },
]
