/** 38 provinsi Indonesia dengan titik pusat perkiraan (lat, lng). Dipakai untuk data demo, filter, dan peta skematik. */
export interface Province { name: string; lat: number; lng: number }

export const PROVINCES: readonly Province[] = [
  { name: 'Aceh', lat: 4.695, lng: 96.749 },
  { name: 'Sumatera Utara', lat: 2.115, lng: 99.545 },
  { name: 'Sumatera Barat', lat: -0.739, lng: 100.8 },
  { name: 'Riau', lat: 0.293, lng: 101.707 },
  { name: 'Kepulauan Riau', lat: 3.946, lng: 108.143 },
  { name: 'Jambi', lat: -1.485, lng: 102.438 },
  { name: 'Sumatera Selatan', lat: -3.319, lng: 104.915 },
  { name: 'Kepulauan Bangka Belitung', lat: -2.741, lng: 106.44 },
  { name: 'Bengkulu', lat: -3.793, lng: 102.256 },
  { name: 'Lampung', lat: -4.558, lng: 105.407 },
  { name: 'DKI Jakarta', lat: -6.209, lng: 106.846 },
  { name: 'Banten', lat: -6.406, lng: 106.064 },
  { name: 'Jawa Barat', lat: -6.914, lng: 107.609 },
  { name: 'Jawa Tengah', lat: -7.151, lng: 110.14 },
  { name: 'DI Yogyakarta', lat: -7.875, lng: 110.426 },
  { name: 'Jawa Timur', lat: -7.536, lng: 112.238 },
  { name: 'Bali', lat: -8.41, lng: 115.189 },
  { name: 'Nusa Tenggara Barat', lat: -8.653, lng: 117.362 },
  { name: 'Nusa Tenggara Timur', lat: -8.657, lng: 121.079 },
  { name: 'Kalimantan Barat', lat: -0.279, lng: 111.475 },
  { name: 'Kalimantan Tengah', lat: -1.681, lng: 113.382 },
  { name: 'Kalimantan Selatan', lat: -3.093, lng: 115.284 },
  { name: 'Kalimantan Timur', lat: 1.64, lng: 116.42 },
  { name: 'Kalimantan Utara', lat: 3.073, lng: 116.04 },
  { name: 'Sulawesi Utara', lat: 0.625, lng: 123.975 },
  { name: 'Gorontalo', lat: 0.696, lng: 122.446 },
  { name: 'Sulawesi Tengah', lat: -1.43, lng: 121.446 },
  { name: 'Sulawesi Barat', lat: -2.844, lng: 119.232 },
  { name: 'Sulawesi Selatan', lat: -3.669, lng: 119.974 },
  { name: 'Sulawesi Tenggara', lat: -4.145, lng: 122.175 },
  { name: 'Maluku', lat: -3.239, lng: 130.145 },
  { name: 'Maluku Utara', lat: 1.57, lng: 127.809 },
  { name: 'Papua Barat', lat: -1.337, lng: 133.175 },
  { name: 'Papua Barat Daya', lat: -1.0, lng: 131.5 },
  { name: 'Papua', lat: -2.9, lng: 138.4 },
  { name: 'Papua Tengah', lat: -3.9, lng: 136.5 },
  { name: 'Papua Pegunungan', lat: -4.1, lng: 139.0 },
  { name: 'Papua Selatan', lat: -6.4, lng: 140.4 },
]

export const PROVINCE_NAMES: string[] = PROVINCES.map(p => p.name)
export const DEFAULT_PROVINCE = 'Bali'

/** Titik pusat provinsi, atau null jika nama tidak dikenal. */
export const provinceCenter = (name: string): [number, number] | null => {
  const p = PROVINCES.find(x => x.name === name)
  return p ? [p.lat, p.lng] : null
}

/** Provinsi dengan titik pusat terdekat dari sebuah koordinat (perkiraan kasar, bukan batas administratif). */
export function nearestProvince(lat: number, lng: number): string {
  let best = PROVINCES[0], bestD = Infinity
  for (const p of PROVINCES) {
    const dLat = p.lat - lat, dLng = (p.lng - lng) * Math.cos(lat * Math.PI / 180), d = dLat * dLat + dLng * dLng
    if (d < bestD) { best = p; bestD = d }
  }
  return best.name
}
