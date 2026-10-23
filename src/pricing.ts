// H = B + (J × T) + (W × K)
export const FIXED_FEE = 10000   // B
export const HANDLING_RATE = 800 // K per kg

export interface Region { id: string; name: string; transportRate: number | null } // T per km
// Hanya Bali yang punya tarif. Wilayah lain null => estimasi belum tersedia.
export const REGIONS: Region[] = [
  { id: 'bali', name: 'Bali', transportRate: 1000 },
  { id: 'jawa', name: 'Jawa', transportRate: null },
  { id: 'sumatera', name: 'Sumatera', transportRate: null },
  { id: 'kalimantan', name: 'Kalimantan', transportRate: null },
  { id: 'sulawesi', name: 'Sulawesi', transportRate: null },
]

export type PriceResult =
  | { available: false; reason: string }
  | { available: true; fixed: number; premiumDiscount: number; transport: number; handling: number; total: number }

export function calcPrice(o: { region?: Region; distanceKm: number | null; weightKg: number | null; premium: boolean }): PriceResult {
  const { region, distanceKm: J, weightKg: W, premium } = o
  if (!region) return { available: false, reason: 'Pilih wilayah terlebih dahulu.' }
  if (region.transportRate == null) return { available: false, reason: `Estimasi untuk wilayah ${region.name} belum tersedia (tarif belum ditetapkan).` }
  if (J == null || !(J >= 0)) return { available: false, reason: 'Jarak ke fasilitas pengolah belum tersedia. Isi jarak dalam km.' }
  if (W == null || !(W > 0)) return { available: false, reason: 'Isi berat sampah (kg).' }
  const fixed = FIXED_FEE
  const premiumDiscount = premium ? FIXED_FEE : 0
  const transport = J * region.transportRate
  const handling = W * HANDLING_RATE
  return { available: true, fixed, premiumDiscount, transport, handling, total: fixed - premiumDiscount + transport + handling }
}
export const rupiah = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID')
