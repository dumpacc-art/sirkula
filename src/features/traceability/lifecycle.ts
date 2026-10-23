import type { BatchStatus } from '../../types'
export const stages: { key:BatchStatus; label:string; event:string }[] = [
  { key:'registered', label:'Registered', event:'Batch record created' }, { key:'validated', label:'Validated', event:'Details checked' },
  { key:'matched', label:'Matched', event:'Processor match accepted' }, { key:'collection_scheduled', label:'Collection scheduled', event:'Pickup slot booked' },
  { key:'collected', label:'Collected', event:'Picked up by transport' }, { key:'received', label:'Received', event:'Weighed at processor' },
  { key:'processing', label:'Processing', event:'Processing started' }, { key:'evidence_submitted', label:'Utilization evidence', event:'Evidence submitted' },
  { key:'verified', label:'Verified', event:'Reviewer accepted evidence' }, { key:'completed', label:'Completed', event:'Record closed' },
]
export const EXCEPTION_AT = 5
export type StageState = 'done' | 'current' | 'pending' | 'exception'
export function stageState(status: BatchStatus, i: number): StageState {
  if (status === 'exception') return i < EXCEPTION_AT ? 'done' : i === EXCEPTION_AT ? 'exception' : 'pending'
  if (status === 'rejected') return i < 2 ? 'done' : i === 2 ? 'exception' : 'pending'
  const cur = stages.findIndex(s => s.key === status)
  return i < cur ? 'done' : i === cur ? 'current' : 'pending'
}
// Demo weights in kg. Historical values are never overwritten.
export const weights: Record<string, { pickup:number; received:number; input:number; output:number; note?:string }> = {
  'BT-1004': { pickup:2100, received:2095, input:2095, output:1980 },
  'BT-1006': { pickup:640, received:640, input:640, output:600 },
  'BT-1008': { pickup:450, received:392, input:392, output:0, note:'58 kg lower at receiving than at pickup. Possible moisture loss or loading error. Under review.' },
}
