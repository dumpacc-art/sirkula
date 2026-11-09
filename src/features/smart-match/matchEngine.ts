import type { Batch, Processor } from '../../types'
import { provinceCenter } from '../../config/provinces'
import { rupiah } from '../../lib/pricing'
export interface Weights { distance:number; cost:number; capacity:number }
export interface Candidate { processor:Processor; score:number; distanceKm:number; cost:number; reasons:string[]; concerns:string[] }
export interface Excluded { processor:Processor; reason:string }
const serviceKm: Record<string,number> = { 'PR-01':1500, 'PR-02':800, 'PR-03':300, 'PR-04':1200, 'PR-05':2500 }
const km = (a:[number,number], b:[number,number]) => { const r = (x:number) => x*Math.PI/180
  const h = Math.sin(r(b[0]-a[0])/2)**2 + Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(r(b[1]-a[1])/2)**2
  return Math.round(12742*Math.asin(Math.sqrt(h))) }
export function findMatches(batch: Batch, procs: Processor[], w: Weights) {
  const excluded: Excluded[] = []; const pool: Omit<Candidate,'score'|'reasons'>[] = []
  for (const p of procs) {
    const d = km(provinceCenter(batch.region) ?? [-2.5,118], [p.lat, p.lng])
    if (!p.accepts.includes(batch.category)) { excluded.push({ processor:p, reason:`Does not accept ${batch.category}` }); continue }
    if (p.capacity < batch.qty) { excluded.push({ processor:p, reason:`Capacity ${p.capacity} kg is below ${batch.qty} kg` }); continue }
    if (d > (serviceKm[p.id] ?? Infinity)) { excluded.push({ processor:p, reason:`Outside service area (${d} km > ${serviceKm[p.id]} km)` }); continue }
    pool.push({ processor:p, distanceKm:d, cost:Math.round((d * 4000 + batch.qty * 500) / 1000) * 1000, concerns:['Cost is a demo estimate'] })
  }
  const maxD = Math.max(1, ...pool.map(c => c.distanceKm)), maxC = Math.max(1, ...pool.map(c => c.cost)), sum = w.distance + w.cost + w.capacity || 1
  const candidates: Candidate[] = pool.map(c => {
    const dS = 1 - c.distanceKm / maxD * .8, cS = 1 - c.cost / maxC * .8, kS = Math.min(1, (c.processor.capacity - batch.qty) / c.processor.capacity + .3)
    const score = Math.round((w.distance*dS + w.cost*cS + w.capacity*kS) / sum * 100)
    const concerns = [...c.concerns]; if (c.processor.capacity - batch.qty < 300) concerns.push('Little spare capacity after this batch')
    return { ...c, score, concerns, reasons:[`Accepts ${batch.category}`, `${c.distanceKm} km away (distance score ${Math.round(dS*100)})`, `Est. transport ${rupiah(c.cost)} (demo)`, `${c.processor.capacity - batch.qty} kg spare capacity after acceptance`] }
  }).sort((a, b) => b.score - a.score)
  return { candidates, excluded }
}
