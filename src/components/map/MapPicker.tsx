import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Pt } from '../../lib/pricing'
import { MAPS_KEY, loadGoogleMaps } from '../../lib/googleMaps'
import { useT } from '../../i18n'
import './MapPicker.css'

/** Changing `n` tells the map to move to this point (used by search and GPS, not by pin drags). */
export type MapFocus = Pt & { n: number }
interface Props { value: Pt | null; focus?: MapFocus | null; onChange?: (p: Pt) => void; readOnly?: boolean; height?: number }
interface Core { value: Pt | null; focus: MapFocus | null; onChange: (p: Pt) => void; readOnly: boolean }
const INDONESIA: Pt = { lat: -2.5, lng: 118 }

/** Interactive map with a draggable pin. Uses Google Maps when VITE_GOOGLE_MAPS_API_KEY is set, otherwise Leaflet + OpenStreetMap. readOnly shows the pin without editing. */
export default function MapPicker({ value, focus = null, onChange = () => undefined, readOnly = false, height }: Props) {
  const core: Core = { value, focus, onChange, readOnly }
  return <div className={`mpk${readOnly ? ' mpk--ro' : ''}`} style={height ? { height } : undefined}>
    {MAPS_KEY ? <GoogleAdapter {...core} /> : <LeafletAdapter {...core} />}
  </div>
}

const pinIcon = L.divIcon({ className: 'mpk__pin', html: '<span></span>', iconSize: [26, 26], iconAnchor: [13, 26] })

function LeafletAdapter({ value, focus, onChange, readOnly }: Core) {
  const start = value ?? INDONESIA
  return (
    <MapContainer center={[start.lat, start.lng]} zoom={value ? 16 : 5} className="mpk__map"
      scrollWheelZoom={!readOnly} dragging={!readOnly} touchZoom={!readOnly} doubleClickZoom={!readOnly} zoomControl={!readOnly}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {!readOnly && <ClickPick onPick={onChange} />}
      <FocusView focus={focus} />
      {value && <Marker position={[value.lat, value.lng]} draggable={!readOnly} icon={pinIcon}
        eventHandlers={readOnly ? undefined : { dragend: e => { const ll = (e.target as L.Marker).getLatLng(); onChange({ lat: ll.lat, lng: ll.lng }) } }} />}
    </MapContainer>
  )
}
function ClickPick({ onPick }: { onPick: (p: Pt) => void }) {
  useMapEvents({ click: e => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}
function FocusView({ focus }: { focus: MapFocus | null }) {
  const map = useMap()
  useEffect(() => { if (focus) map.flyTo([focus.lat, focus.lng], 16, { duration: .6 }) }, [focus?.n])
  return null
}

function GoogleAdapter({ value, focus, onChange, readOnly }: Core) {
  const { t } = useT()
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null), marker = useRef<any>(null)
  const cb = useRef(onChange); cb.current = onChange
  const latest = useRef({ value, focus, readOnly }); latest.current = { value, focus, readOnly }
  const [failed, setFailed] = useState(false)
  // Map and marker are created once. Later props are applied through the effects below.
  useEffect(() => {
    let alive = true
    loadGoogleMaps('id').then(async g => {
      const { Map } = await g.maps.importLibrary('maps')
      const { Marker } = await g.maps.importLibrary('marker')
      if (!alive || !el.current) return
      const { value: v, focus: f, readOnly: ro } = latest.current
      const start = v ?? INDONESIA
      map.current = new Map(el.current, { center: start, zoom: v ? 16 : 5, mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
        gestureHandling: ro ? 'none' : 'auto', zoomControl: !ro })
      if (!ro) map.current.addListener('click', (e: any) => cb.current({ lat: e.latLng.lat(), lng: e.latLng.lng() }))
      marker.current = new Marker({ draggable: !ro })
      if (!ro) marker.current.addListener('dragend', (e: any) => cb.current({ lat: e.latLng.lat(), lng: e.latLng.lng() }))
      if (v) { marker.current.setPosition(v); marker.current.setMap(map.current) }
      if (f) { map.current.panTo(f); map.current.setZoom(16) }
    }).catch(() => setFailed(true))
    return () => { alive = false }
  }, [])
  useEffect(() => {
    if (!marker.current || !map.current) return
    if (value) { marker.current.setPosition(value); marker.current.setMap(map.current) } else marker.current.setMap(null)
  }, [value?.lat, value?.lng])
  useEffect(() => { if (focus && map.current) { map.current.panTo(focus); map.current.setZoom(16) } }, [focus?.n])
  if (failed) return <div className="mpk__err" role="alert">{t('Google Maps could not be loaded. Check the API key.')}</div>
  return <div ref={el} className="mpk__g" />
}
