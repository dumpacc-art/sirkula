import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Pt } from '../../lib/pricing'
import type { RoutePlan } from '../../features/tracking/routeDemo'
import './OrderMap.css'

const mk = (kind: 'pickup' | 'fac' | 'veh', letter: string) =>
  L.divIcon({ className: `trk__mk trk__mk--${kind}`, html: `<span>${letter}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] })
const ICON = { pickup: mk('pickup', 'P'), fac: mk('fac', 'F'), veh: mk('veh', 'K') }

/** Main tracking map: pickup point, processing facility, dashed collector leg, solid transport route, stationary collector vehicle. */
export default function OrderMap({ pickup, facility, route, vehicle }: {
  pickup: Pt; facility: Pt | null; route: RoutePlan | null; vehicle: Pt | null
}) {
  const ll = (p: Pt): [number, number] => [p.lat, p.lng]
  return (
    <MapContainer center={ll(pickup)} zoom={13} scrollWheelZoom className="trk__map" aria-label="Order map">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <FitTo points={facility ? [pickup, facility] : [pickup]} />
      {route && <Polyline positions={route.leg1.map(ll)} pathOptions={{ color: '#1b5239', weight: 4, dashArray: '6 8', opacity: 0.7 }} />}
      {route && facility && <Polyline positions={route.leg2.map(ll)} pathOptions={{ color: '#15803d', weight: 5 }} />}
      <Marker position={ll(pickup)} icon={ICON.pickup} title="Pickup point" alt="Pickup point" />
      {facility && <Marker position={ll(facility)} icon={ICON.fac} title="Processing facility" alt="Processing facility" />}
      {vehicle && <Marker position={ll(vehicle)} icon={ICON.veh} title="Collector vehicle (demo)" alt="Collector vehicle (demo)" />}
    </MapContainer>
  )
}

function FitTo({ points }: { points: Pt[] }) {
  const map = useMap()
  const key = points.map(p => `${p.lat},${p.lng}`).join('|')
  useEffect(() => {
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 14)
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number])), { padding: [40, 40] })
  }, [key])
  return null
}
