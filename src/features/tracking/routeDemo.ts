import type { Pt } from '../../lib/pricing'
import type { OrderState } from '../../types'

export interface RoutePlan { depot: Pt; leg1: Pt[]; leg2: Pt[] }

/** Demo route. leg1 runs from the collector depot to the pickup; leg2 runs from the pickup to the facility. leg2[0] is the pickup. */
export function buildRoute(pickup: Pt, facility: Pt): RoutePlan {
  const depot = { lat: pickup.lat + 0.02, lng: pickup.lng + 0.02 }
  return { depot, leg1: curve(depot, pickup, 0.04), leg2: curve(pickup, facility, 0.12) }
}

/** Points along a gently curved line (perpendicular bow, 0 at both ends). */
function curve(a: Pt, b: Pt, bow: number, n = 24): Pt[] {
  const dlat = b.lat - a.lat, dlng = b.lng - a.lng
  const len = Math.hypot(dlat, dlng) || 1
  const nlat = -dlng / len, nlng = dlat / len
  const pts: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n, off = bow * len * Math.sin(Math.PI * t)
    pts.push({ lat: a.lat + dlat * t + nlat * off, lng: a.lng + dlng * t + nlng * off })
  }
  return pts
}

/** Stationary vehicle position for a status. Null means no collector is assigned yet, so no vehicle is shown. */
export function vehiclePosition(route: RoutePlan, status: OrderState): Pt | null {
  switch (status) {
    case 'collector_assigned': return route.depot
    case 'on_the_way_to_pickup': return route.leg1[Math.floor(route.leg1.length / 2)]
    case 'arrived_at_pickup':
    case 'waste_collected': return route.leg2[0]
    case 'in_transit_to_processor': return route.leg2[Math.floor(route.leg2.length / 2)]
    case 'arrived_at_processor':
    case 'completed': return route.leg2[route.leg2.length - 1]
    default: return null
  }
}
