import type { PickupLocation, PickupOrder, Submission } from '../../types'

export type RepeatDraft = Omit<Submission, 'id' | 'createdAt' | 'status' | 'batchId'>

/**
 * Builds a new, unconfirmed order draft from a past order. It copies the pickup address, waste categories,
 * quantity and notes. It does NOT copy the partner, price, photo or preferred date: partner availability,
 * distance and price are recalculated in SmartMatch, and the user confirms the new order there.
 */
export function repeatDraftFromOrder(o: PickupOrder, nowIso: string): RepeatDraft {
  const pickup: PickupLocation = {
    lat: o.coords.lat, lng: o.coords.lng, addressText: o.address,
    building: '', floor: '', landmark: '', source: 'map', savedAt: nowIso,
  }
  return {
    stream: o.waste.stream,
    workflow: o.waste.workflow,
    wasteTypes: [...o.waste.categories],
    pickup,
    photo: null,
    quantity: { kg: o.waste.kg, bags: o.waste.bags, preferredDate: null, notes: o.waste.notes },
  }
}
