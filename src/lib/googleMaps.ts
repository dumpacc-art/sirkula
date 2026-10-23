/* Minimal Google Maps JS loader (no extra npm dependency). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type G = any
declare global { interface Window { google?: G; __gmapsReady?: () => void } }

export const MAPS_KEY: string = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? ''
let loading: Promise<G> | null = null

export function loadGoogleMaps(language: string): Promise<G> {
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google)
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    window.__gmapsReady = () => resolve(window.google)
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}&v=weekly&loading=async&language=${language}&callback=__gmapsReady`
    s.async = true; s.onerror = () => { loading = null; reject(new Error('Google Maps failed to load')) }
    document.head.appendChild(s)
  })
  return loading
}

export const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const r = (x: number) => x * Math.PI / 180, h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}
