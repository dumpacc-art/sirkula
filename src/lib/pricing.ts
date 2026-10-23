import { km as straightKm } from './googleMaps'

// H = B + (J × T) + (W × K)
//   B = biaya tetap, J = jarak jalan (km, dihitung SISTEM), T = tarif/km wilayah, W = berat (kg), K = tarif penanganan/kg wilayah
export const FIXED_FEE = 10000
/** Maksimal jarak garis lurus dari lokasi penjemputan ke hub terdekat agar masih dilayani. */
export const MAX_COVERAGE_KM = 150

export interface Pt { lat: number; lng: number }
export interface Hub extends Pt { id: string; name: string }
export interface Region {
  id: string; name: string
  transportRate: number   // T: Rp per km
  handlingRate: number    // K: Rp per kg
  roadFactor: number      // pengali garis lurus -> perkiraan jarak jalan (dipakai kalau rute Google tidak tersedia)
  terrain: string         // alasan tarif berbeda
  hubs: Hub[]
}

/**
 * Hub = pusat pengolahan FIKTIF (nama karangan, koordinat kira-kira di pusat kota) untuk demo.
 * Tarif juga demo: dibuat naik-turun sesuai kondisi alam & infrastruktur tiap wilayah.
 */
export const REGIONS: Region[] = [
  { id: 'bali', name: 'Bali', transportRate: 1000, handlingRate: 800, roadFactor: 1.35, terrain: 'Pulau kecil, jalan padat & berkelok di area pegunungan tengah.',
    hubs: [{ id: 'bali-dps', name: 'Hub Sirkula Denpasar', lat: -8.6705, lng: 115.2126 }, { id: 'bali-ubd', name: 'Hub Sirkula Ubud', lat: -8.5069, lng: 115.2625 }, { id: 'bali-sgr', name: 'Hub Sirkula Singaraja', lat: -8.112, lng: 115.0882 }, { id: 'bali-amp', name: 'Hub Sirkula Amlapura', lat: -8.453, lng: 115.61 }] },
  { id: 'jawa', name: 'Jawa', transportRate: 900, handlingRate: 700, roadFactor: 1.3, terrain: 'Jaringan jalan & tol terbaik, volume besar membuat tarif paling murah.',
    hubs: [{ id: 'jw-jkt', name: 'Hub Sirkula Jakarta', lat: -6.2088, lng: 106.8456 }, { id: 'jw-bdg', name: 'Hub Sirkula Bandung', lat: -6.9175, lng: 107.6191 }, { id: 'jw-smg', name: 'Hub Sirkula Semarang', lat: -6.9667, lng: 110.4167 }, { id: 'jw-jog', name: 'Hub Sirkula Yogyakarta', lat: -7.7956, lng: 110.3695 }, { id: 'jw-sby', name: 'Hub Sirkula Surabaya', lat: -7.2575, lng: 112.7521 }] },
  { id: 'sumatera', name: 'Sumatera', transportRate: 1250, handlingRate: 850, roadFactor: 1.4, terrain: 'Jarak antarkota jauh, jalur lintas berbukit.',
    hubs: [{ id: 'sm-mdn', name: 'Hub Sirkula Medan', lat: 3.5952, lng: 98.6722 }, { id: 'sm-pdg', name: 'Hub Sirkula Padang', lat: -0.9471, lng: 100.4172 }, { id: 'sm-pku', name: 'Hub Sirkula Pekanbaru', lat: 0.5071, lng: 101.4478 }, { id: 'sm-plg', name: 'Hub Sirkula Palembang', lat: -2.9761, lng: 104.7754 }, { id: 'sm-lmp', name: 'Hub Sirkula Bandar Lampung', lat: -5.45, lng: 105.2667 }] },
  { id: 'kalimantan', name: 'Kalimantan', transportRate: 1500, handlingRate: 950, roadFactor: 1.5, terrain: 'Jalan jarang, lahan gambut & jalur sungai, sering terputus saat hujan.',
    hubs: [{ id: 'kl-ptk', name: 'Hub Sirkula Pontianak', lat: -0.0263, lng: 109.3425 }, { id: 'kl-bjm', name: 'Hub Sirkula Banjarmasin', lat: -3.3194, lng: 114.5908 }, { id: 'kl-bpn', name: 'Hub Sirkula Balikpapan', lat: -1.2654, lng: 116.8312 }, { id: 'kl-plk', name: 'Hub Sirkula Palangka Raya', lat: -2.2161, lng: 113.9135 }] },
  { id: 'sulawesi', name: 'Sulawesi', transportRate: 1400, handlingRate: 900, roadFactor: 1.6, terrain: 'Kontur pegunungan, jalan berkelok & lambat.',
    hubs: [{ id: 'sl-mks', name: 'Hub Sirkula Makassar', lat: -5.1477, lng: 119.4327 }, { id: 'sl-mdo', name: 'Hub Sirkula Manado', lat: 1.4748, lng: 124.8421 }, { id: 'sl-plu', name: 'Hub Sirkula Palu', lat: -0.8917, lng: 119.8707 }, { id: 'sl-kdi', name: 'Hub Sirkula Kendari', lat: -3.9985, lng: 122.5129 }] },
  { id: 'nusa-tenggara', name: 'Nusa Tenggara', transportRate: 1600, handlingRate: 1000, roadFactor: 1.5, terrain: 'Iklim kering, jalan rusak musiman, antarpulau butuh feri.',
    hubs: [{ id: 'nt-mtr', name: 'Hub Sirkula Mataram', lat: -8.5833, lng: 116.1167 }, { id: 'nt-sbw', name: 'Hub Sirkula Sumbawa Besar', lat: -8.4893, lng: 117.42 }, { id: 'nt-lbj', name: 'Hub Sirkula Labuan Bajo', lat: -8.4967, lng: 119.8877 }, { id: 'nt-kpg', name: 'Hub Sirkula Kupang', lat: -10.1772, lng: 123.607 }] },
  { id: 'maluku', name: 'Maluku', transportRate: 2200, handlingRate: 1200, roadFactor: 1.7, terrain: 'Kepulauan, jalan darat pendek & terpisah laut.',
    hubs: [{ id: 'ml-amq', name: 'Hub Sirkula Ambon', lat: -3.6954, lng: 128.1814 }, { id: 'ml-tte', name: 'Hub Sirkula Ternate', lat: 0.7893, lng: 127.3774 }] },
  { id: 'papua', name: 'Papua', transportRate: 3000, handlingRate: 1500, roadFactor: 1.9, terrain: 'Pegunungan & hutan lebat, akses terbatas, biaya logistik tertinggi.',
    hubs: [{ id: 'pp-djj', name: 'Hub Sirkula Jayapura', lat: -2.5337, lng: 140.7181 }, { id: 'pp-soq', name: 'Hub Sirkula Sorong', lat: -0.8762, lng: 131.2558 }, { id: 'pp-mkq', name: 'Hub Sirkula Merauke', lat: -8.4932, lng: 140.4018 }, { id: 'pp-tim', name: 'Hub Sirkula Timika', lat: -4.5466, lng: 136.8872 }] },
]

export interface Nearest { region: Region; hub: Hub; straightKm: number }

export function nearestHub(from: Pt, region: Region): Nearest {
  let best: Nearest | null = null
  for (const hub of region.hubs) { const d = straightKm(from, hub); if (!best || d < best.straightKm) best = { region, hub, straightKm: d } }
  return best!
}
export function nearestHubAny(from: Pt): Nearest {
  return REGIONS.map(r => nearestHub(from, r)).reduce((a, b) => (b.straightKm < a.straightKm ? b : a))
}

export type PriceResult =
  | { available: false; reason: string }
  | { available: true; fixed: number; premiumDiscount: number; transport: number; handling: number; total: number; transportRate: number; handlingRate: number }

export function calcPrice(o: { region?: Region; distanceKm: number | null; weightKg: number | null; premium: boolean }): PriceResult {
  const { region, distanceKm: J, weightKg: W, premium } = o
  if (!region) return { available: false, reason: 'Pilih wilayah terlebih dahulu.' }
  if (J == null || !(J >= 0)) return { available: false, reason: 'Jarak belum dihitung. Isi alamat atau gunakan lokasi Anda.' }
  if (W == null || !(W > 0)) return { available: false, reason: 'Isi berat sampah (kg).' }
  const fixed = FIXED_FEE
  const premiumDiscount = premium ? FIXED_FEE : 0
  const transport = J * region.transportRate
  const handling = W * region.handlingRate
  return { available: true, fixed, premiumDiscount, transport, handling, total: fixed - premiumDiscount + transport + handling, transportRate: region.transportRate, handlingRate: region.handlingRate }
}
export const rupiah = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID')
