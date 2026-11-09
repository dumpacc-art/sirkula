import type { Product, ProductSource } from '../types'

/** Kategori marketplace. `key` dipakai di data produk (Product.category). */
export interface MkCategory { key: string; label: string; group: 'fresh' | 'upcycle' | 'home'; emoji: string }
export const MK_CATEGORIES: MkCategory[] = [
  { key: 'Vegetables', label: 'Vegetables', group: 'fresh', emoji: '🥬' },
  { key: 'Fruits', label: 'Fruits', group: 'fresh', emoji: '🍊' },
  { key: 'Herbs & spices', label: 'Herbs & spices', group: 'fresh', emoji: '🌿' },
  { key: 'Staples', label: 'Staples', group: 'fresh', emoji: '🌾' },
  { key: 'Garden', label: 'Garden', group: 'home', emoji: '🪴' },
  { key: 'Bags', label: 'Bags', group: 'upcycle', emoji: '👜' },
  { key: 'Apparel', label: 'Apparel', group: 'upcycle', emoji: '🧣' },
  { key: 'Home', label: 'Home', group: 'home', emoji: '🏠' },
  { key: 'Office', label: 'Office', group: 'upcycle', emoji: '✏️' },
  { key: 'Other', label: 'Other', group: 'home', emoji: '📦' },
]
export const FRESH_KEYS = MK_CATEGORIES.filter(c => c.group === 'fresh').map(c => c.key)
export const UNITS = ['pcs', 'kg', 'gram', 'ikat', 'pak', 'set', 'liter']

export const SOURCE_LABEL: Record<ProductSource, string> = {
  upcycle: 'Recycled product',
  farm: 'Farmer partnership',
  partner: 'Partner product',
}

/** Penjelasan tetap untuk produk hasil kerja sama petani: tanpa angka diskon, langsung dijelaskan asalnya. */
export const FARM_NOTE_TITLE = 'Circular result between partners'
export const FARM_NOTE =
  'Harvested by partner farmers and sold through SIRKULA under a commission agreed beforehand. A shorter chain means a fairer price for you and the farmer.'

/** "12000" -> "12.000". Hanya angka; dipakai untuk input harga. */
export const formatThousands = (raw: string | number) => {
  const d = String(raw).replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
/** "12.000" -> 12000 */
export const parseThousands = (s: string) => Number(s.replace(/\D/g, '')) || 0
