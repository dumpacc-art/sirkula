import type { OrderState, PickupOrder } from '../../types'

/** Strict sequence. Statuses only move forward, one step at a time. */
export const ORDER_STATES: OrderState[] = [
  'pending_match', 'matched', 'scheduled', 'collector_assigned', 'on_the_way_to_pickup',
  'arrived_at_pickup', 'waste_collected', 'in_transit_to_processor', 'arrived_at_processor', 'completed',
]
export type Phase = 'planning' | 'pickup' | 'transit' | 'done'
export const PHASE: Record<OrderState, Phase> = {
  pending_match: 'planning', matched: 'planning', scheduled: 'planning',
  collector_assigned: 'pickup', on_the_way_to_pickup: 'pickup', arrived_at_pickup: 'pickup', waste_collected: 'pickup',
  in_transit_to_processor: 'transit', arrived_at_processor: 'transit',
  completed: 'done',
}
export const DEMO_COLLECTOR = { name: 'Collector team (demo)', vehicle: 'Light truck (demo)' } as const

export const isOrderState = (s: unknown): s is OrderState => typeof s === 'string' && (ORDER_STATES as string[]).includes(s)
export const stateIndex = (s: OrderState) => ORDER_STATES.indexOf(s)
export const nextState = (s: OrderState): OrderState | null => (stateIndex(s) < ORDER_STATES.length - 1 ? ORDER_STATES[stateIndex(s) + 1] : null)

/**
 * Advances one step. Returns null when the order is already completed.
 * Assigns the demo collector on collector_assigned. Completing an order records the measured weight,
 * the completion time, and settles payment (demo: payment is simulated, no money moves).
 */
export function advanceOrder(
  o: Pick<PickupOrder, 'status' | 'statusHistory' | 'collector' | 'waste'>,
  at: string,
  measuredKg?: number,
) {
  const n = nextState(o.status)
  if (!n) return null
  const base = { ...o, status: n, statusHistory: [...o.statusHistory, { status: n, at }], collector: n === 'collector_assigned' ? { ...DEMO_COLLECTOR } : o.collector }
  if (n !== 'completed') return base
  return { ...base, measuredKg: measuredKg ?? o.waste.kg, completedAt: at, paymentStatus: 'paid' as const }
}

/** Records saved before the state machine used 'confirmed' or other names are mapped to 'scheduled'. Fills fields added later.
 *  A completed record saved before completion recorded weight and payment gets those filled from its own data. */
export function migratePickupOrder(o: any): PickupOrder {
  const extra = { paymentStatus: o?.paymentStatus === 'paid' ? 'paid' as const : 'unpaid' as const }
  if (isOrderState(o?.status)) {
    const base = { ...extra, ...o } as PickupOrder
    if (base.status !== 'completed') return base
    const at = base.statusHistory?.[base.statusHistory.length - 1]?.at ?? base.createdAt
    return { ...base, measuredKg: base.measuredKg ?? base.waste?.kg ?? null, completedAt: base.completedAt ?? at, paymentStatus: 'paid' }
  }
  const history = Array.isArray(o?.statusHistory) ? o.statusHistory.map((h: any) => ({ status: isOrderState(h?.status) ? h.status : 'scheduled', at: String(h?.at ?? o?.createdAt ?? '') })) : []
  return { ...extra, ...o, status: 'scheduled', statusHistory: history.length ? history : [{ status: 'scheduled', at: String(o?.createdAt ?? '') }] } as PickupOrder
}
