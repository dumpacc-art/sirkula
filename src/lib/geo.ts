import { MAPS_KEY, loadGoogleMaps } from './googleMaps'
import { km as straightKm } from './googleMaps'
import type { Pt } from './pricing'

export interface Place extends Pt { label: string }
export interface RouteRes { km: number; straightKm: number; source: 'google' | 'estimate'; path?: Pt[] }

const NOT_FOUND = 'Alamat tidak ditemukan. Coba tulis lebih lengkap (jalan, kecamatan, kota).'

/** Alamat -> koordinat. Google Geocoder bila ada API key, selain itu OpenStreetMap Nominatim. */
export async function geocode(address: string): Promise<Place> {
  const q = address.trim()
  if (q.length < 3) throw new Error('Masukkan alamat minimal 3 karakter.')
  if (MAPS_KEY) {
    try {
      const google = await loadGoogleMaps('id')
      const { Geocoder } = await google.maps.importLibrary('geocoding')
      const res = await new Geocoder().geocode({ address: q, region: 'ID', componentRestrictions: { country: 'ID' } })
      const r = res?.results?.[0]
      if (r) return { lat: r.geometry.location.lat(), lng: r.geometry.location.lng(), label: r.formatted_address }
      throw new Error(NOT_FOUND)
    } catch (e: any) {
      if (e?.code === 'ZERO_RESULTS' || e?.message === NOT_FOUND) throw new Error(NOT_FOUND)
      // error lain (key dibatasi, Geocoding API belum aktif, dll) -> coba cadangan
    }
  }
  const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=id&q=${encodeURIComponent(q)}`, { headers: { 'Accept-Language': 'id' } })
  if (!r.ok) throw new Error('Layanan pencarian alamat sedang tidak tersedia. Coba lagi atau gunakan lokasi Anda.')
  const j = await r.json()
  if (!j?.length) throw new Error(NOT_FOUND)
  return { lat: +j[0].lat, lng: +j[0].lon, label: j[0].display_name }
}

/** Koordinat -> nama alamat (opsional; jatuh ke koordinat kalau gagal). */
export async function reverse(p: Pt): Promise<string> {
  const fallback = `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
  if (!MAPS_KEY) return fallback
  try {
    const google = await loadGoogleMaps('id')
    const { Geocoder } = await google.maps.importLibrary('geocoding')
    const res = await new Geocoder().geocode({ location: p })
    return res?.results?.[0]?.formatted_address ?? fallback
  } catch { return fallback }
}

/** Lokasi perangkat via browser (butuh izin pengguna; HTTPS/localhost). */
export function locate(): Promise<Pt & { accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Browser ini tidak mendukung akses lokasi. Ketik alamat saja.'))
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      e => reject(new Error(e.code === 1 ? 'Izin lokasi ditolak. Aktifkan izin lokasi di browser atau ketik alamat.' : e.code === 3 ? 'Waktu pencarian lokasi habis. Coba lagi.' : 'Lokasi tidak tersedia. Ketik alamat saja.')),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 })
  })
}

/** Jarak jalan dari Google Directions; jika tidak tersedia -> garis lurus × faktor jalan wilayah. */
export async function roadRoute(from: Pt, to: Pt, roadFactor: number): Promise<RouteRes> {
  const straight = straightKm(from, to)
  if (MAPS_KEY) {
    try {
      const google = await loadGoogleMaps('id')
      const { DirectionsService } = await google.maps.importLibrary('routes')
      const res = await new DirectionsService().route({ origin: from, destination: to, travelMode: 'DRIVING' })
      const route = res?.routes?.[0], m = route?.legs?.[0]?.distance?.value
      if (m) return { km: m / 1000, straightKm: straight, source: 'google', path: route.overview_path.map((p: any) => ({ lat: p.lat(), lng: p.lng() })) }
    } catch { /* jatuh ke estimasi */ }
  }
  return { km: straight * roadFactor, straightKm: straight, source: 'estimate' }
}
