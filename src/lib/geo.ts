import { MAPS_KEY, loadGoogleMaps } from './googleMaps'
import { km as straightKm } from './googleMaps'
import type { Pt } from './pricing'

export interface Place extends Pt { label: string }
export interface RouteRes { km: number; straightKm: number; source: 'google' | 'estimate'; path?: Pt[] }

const NOT_FOUND = 'Alamat tidak ditemukan. Coba tulis lebih lengkap (jalan, kecamatan, kota).'

/** Bagian alamat terstruktur. Nama jalan dipisah supaya UI bisa menampilkannya sendiri dan memperingatkan bila tidak ada. */
export interface AddressParts { road?: string; houseNumber?: string; area?: string; district?: string; city?: string; province?: string; postcode?: string }
export interface Resolved {
  label: string; parts: AddressParts
  /** true bila nama jalan diambil dari jalan terdekat (bukan titik tepat di jalan itu), atau tidak ada jalan sama sekali. */
  approx: boolean
  /** Jarak titik ke jalan yang dipakai (meter), bila diketahui. */
  roadDistanceM?: number
  source: 'google' | 'osm' | 'osm+overpass'
}

const uniq = (a: (string | undefined)[]) => a.filter((x, i): x is string => !!x && a.indexOf(x) === i)

/** Susun satu baris alamat: Jalan + No., kelurahan, kecamatan, kota, provinsi + kode pos. */
export function formatAddress(p: AddressParts, extra?: string): string {
  const road = p.road ? (p.houseNumber ? `${p.road} No. ${p.houseNumber}` : p.road) : undefined
  const prov = p.province ? (p.postcode ? `${p.province} ${p.postcode}` : p.province) : p.postcode
  return uniq([extra, road, p.area, p.district, p.city, prov]).join(', ')
}

async function getJson(url: string, ms = 9000, headers?: Record<string, string>): Promise<any> {
  const ctl = new AbortController(), timer = window.setTimeout(() => ctl.abort(), ms)
  try {
    const r = await fetch(url, { signal: ctl.signal, headers })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } finally { window.clearTimeout(timer) }
}

const fromNominatim = (a: Record<string, string> = {}): AddressParts => ({
  road: a.road || a.pedestrian || a.residential || undefined,
  houseNumber: a.house_number || undefined,
  area: a.village || a.suburb || a.neighbourhood || a.quarter || a.hamlet || undefined,
  district: a.city_district || a.municipality || a.subdistrict || undefined,
  city: a.city || a.town || a.regency || a.county || undefined,
  province: a.state || undefined,
  postcode: a.postcode || undefined,
})

/** Jalan yang bisa dilalui kendaraan didahulukan; jalan setapak hanya dipakai kalau tidak ada yang lain. */
const DRIVABLE = new Set(['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential', 'living_street', 'service', 'road'])

function distToSegmentM(p: Pt, a: Pt, b: Pt): number {
  const k = 111320, cos = Math.cos(p.lat * Math.PI / 180)
  const px = 0, py = 0, ax = (a.lng - p.lng) * k * cos, ay = (a.lat - p.lat) * k, bx = (b.lng - p.lng) * k * cos, by = (b.lat - p.lat) * k
  const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2))
  return Math.hypot(ax + t * dx - px, ay + t * dy - py)
}

/** Jalan bernama terdekat dari titik (OpenStreetMap via Overpass). Dipakai kalau reverse geocoding tidak mengembalikan nama jalan. */
async function nearestNamedRoad(p: Pt, radiusM = 80): Promise<{ name: string; distM: number } | null> {
  const q = `[out:json][timeout:8];way(around:${radiusM},${p.lat},${p.lng})["highway"]["name"];out tags geom 30;`
  try {
    const j = await getJson(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`, 9000)
    let best: { name: string; distM: number; drivable: boolean } | null = null
    for (const w of j?.elements ?? []) {
      const g: { lat: number; lon: number }[] = w.geometry ?? []
      let d = Infinity
      for (let i = 0; i < g.length - 1; i++) d = Math.min(d, distToSegmentM(p, { lat: g[i].lat, lng: g[i].lon }, { lat: g[i + 1].lat, lng: g[i + 1].lon }))
      if (g.length === 1) d = distToSegmentM(p, { lat: g[0].lat, lng: g[0].lon }, { lat: g[0].lat, lng: g[0].lon })
      const drivable = DRIVABLE.has(w.tags?.highway)
      if (!isFinite(d)) continue
      if (!best || (drivable && !best.drivable) || (drivable === best.drivable && d < best.distM)) best = { name: w.tags.name, distM: d, drivable }
    }
    return best ? { name: best.name, distM: Math.round(best.distM) } : null
  } catch { return null }
}

const cache = new Map<string, Resolved>()
const keyOf = (p: Pt) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`

function googleParts(comps: any[]): AddressParts {
  const get = (...types: string[]) => comps.find(c => types.some(t => c.types?.includes(t)))?.long_name as string | undefined
  return {
    road: get('route'), houseNumber: get('street_number'),
    area: get('administrative_area_level_4', 'sublocality_level_1', 'sublocality', 'neighborhood'),
    district: get('administrative_area_level_3', 'sublocality_level_2'),
    city: get('administrative_area_level_2', 'locality'),
    province: get('administrative_area_level_1'), postcode: get('postal_code'),
  }
}

/**
 * Koordinat -> alamat dengan nama jalan yang sebenarnya.
 * Google (bila ada key): pilih hasil street_address / route, bukan plus code atau area luas.
 * OpenStreetMap: Nominatim zoom 18; kalau tidak ada nama jalan, cari jalan bernama terdekat (maks. 80 m) lewat Overpass.
 * Mengembalikan null bila semua layanan gagal.
 */
export async function reverseDetailed(p: Pt): Promise<Resolved | null> {
  const k = keyOf(p)
  if (cache.has(k)) return cache.get(k)!
  let out: Resolved | null = null
  if (MAPS_KEY) {
    try {
      const google = await loadGoogleMaps('id')
      const { Geocoder } = await google.maps.importLibrary('geocoding')
      const res = await new Geocoder().geocode({ location: p })
      const list: any[] = (res?.results ?? []).filter((r: any) => !r.types?.includes('plus_code'))
      const hit = list.find(r => r.types?.includes('street_address')) ?? list.find(r => r.types?.includes('premise') || r.types?.includes('route')) ?? list[0]
      if (hit) {
        const parts = googleParts(hit.address_components ?? [])
        out = { label: parts.road ? formatAddress(parts) : hit.formatted_address, parts, approx: !parts.road, source: 'google' }
      }
    } catch { /* jatuh ke OpenStreetMap */ }
  }
  if (!out) {
    try {
      const j = await getJson(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=id&lat=${p.lat}&lon=${p.lng}`, 9000)
      if (j && !j.error) {
        const parts = fromNominatim(j.address)
        let source: Resolved['source'] = 'osm', approx = false, roadDistanceM: number | undefined
        if (!parts.road) {
          const r = await nearestNamedRoad(p)
          if (r) { parts.road = r.name; parts.houseNumber = undefined; roadDistanceM = r.distM; approx = r.distM > 40; source = 'osm+overpass' } else approx = true
        }
        const label = formatAddress(parts) || j.display_name
        if (label) out = { label, parts, approx, roadDistanceM, source }
      }
    } catch { /* tidak ada hasil */ }
  }
  if (out) cache.set(k, out)
  return out
}

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
  let j: any
  try { j = await getJson(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&countrycodes=id&accept-language=id&q=${encodeURIComponent(q)}`, 9000) }
  catch { throw new Error('Layanan pencarian alamat sedang tidak tersedia. Coba lagi atau gunakan lokasi Anda.') }
  if (!j?.length) throw new Error(NOT_FOUND)
  const parts = fromNominatim(j[0].address)
  const name = j[0].name && j[0].name !== parts.road ? j[0].name as string : undefined
  return { lat: +j[0].lat, lng: +j[0].lon, label: formatAddress(parts, name) || j[0].display_name }
}

/** Koordinat -> nama alamat (jatuh ke koordinat kalau gagal). */
export async function reverse(p: Pt): Promise<string> {
  const r = await reverseDetailed(p)
  return r?.label ?? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
}

export type LocationErrorCode = 'unsupported' | 'denied' | 'timeout' | 'unavailable'
/** Typed so UI can show a distinct state per cause instead of matching message text. */
export class LocationError extends Error {
  code: LocationErrorCode
  constructor(message: string, code: LocationErrorCode) { super(message); this.code = code; this.name = 'LocationError' }
}

/**
 * Lokasi perangkat via browser (butuh izin pengguna; HTTPS/localhost).
 * GPS biasanya meleset di pembacaan pertama, jadi posisi dipantau sampai akurasinya <= targetM atau waktu habis,
 * lalu pembacaan paling akurat yang dipakai. Cache posisi lama tidak dipakai.
 */
export function locate(targetM = 25, maxWaitMs = 9000): Promise<Pt & { accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new LocationError('Browser ini tidak mendukung akses lokasi. Ketik alamat saja.', 'unsupported'))
    let best: GeolocationPosition | null = null, done = false, watch = 0, timer = 0
    const finish = (fn: () => void) => { if (done) return; done = true; navigator.geolocation.clearWatch(watch); window.clearTimeout(timer); fn() }
    const ok = () => resolve({ lat: best!.coords.latitude, lng: best!.coords.longitude, accuracy: best!.coords.accuracy })
    watch = navigator.geolocation.watchPosition(
      p => { if (!best || p.coords.accuracy < best.coords.accuracy) best = p; if (p.coords.accuracy <= targetM) finish(ok) },
      e => finish(() => best ? ok() : reject(e.code === 1
        ? new LocationError('Izin lokasi ditolak. Aktifkan izin lokasi di browser atau ketik alamat.', 'denied')
        : e.code === 3
          ? new LocationError('Waktu pencarian lokasi habis. Coba lagi.', 'timeout')
          : new LocationError('Lokasi tidak tersedia. Ketik alamat saja.', 'unavailable'))),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 })
    timer = window.setTimeout(() => finish(() => best ? ok() : reject(new LocationError('Waktu pencarian lokasi habis. Coba lagi.', 'timeout'))), maxWaitMs)
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
