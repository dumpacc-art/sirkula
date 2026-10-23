import type { Batch, Processor } from '../../types'
export interface Weights { distance:number; cost:number; capacity:number }
export interface Candidate { processor:Processor; score:number; distanceKm:number; cost:number; reasons:string[]; concerns:string[] }
export interface Excluded { processor:Processor; reason:string }
const centroid: Record<string,[number,number]> = { 'Southeast Asia':[-2,110], 'Northern Europe':[58,12], 'Latin America':[-25,-60], 'East Africa':[-1,37], 'South Asia':[22,78] }
const serviceKm: Record<string,number> = { 'PR-01':12000, 'PR-02':3000, 'PR-03':800, 'PR-04':5000, 'PR-05':12000 }
const km = (a:[number,number], b:[number,number]) => { const r = (x:number) => x*Math.PI/180
  const h = Math.sin(r(b[0]-a[0])/2)**2 + Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(r(b[1]-a[1])/2)**2
  return Math.round(12742*Math.asin(Math.sqrt(h))) }
export function findMatches(batch: Batch, procs: Processor[], w: Weights) {
  const excluded: Excluded[] = []; const pool: Omit<Candidate,'score'|'reasons'>[] = []
  for (const p of procs) {
    const d = km(centroid[batch.region] ?? [0,0], [p.lat, p.lng])
    if (!p.accepts.includes(batch.category)) { excluded.push({ processor:p, reason:`Does not accept ${batch.category}` }); continue }
    if (p.capacity < batch.qty) { excluded.push({ processor:p, reason:`Capacity ${p.capacity} kg is below ${batch.qty} kg` }); continue }
    if (d > (serviceKm[p.id] ?? Infinity)) { excluded.push({ processor:p, reason:`Outside service area (${d} km > ${serviceKm[p.id]} km)` }); continue }
    pool.push({ processor:p, distanceKm:d, cost:Math.round(d * 0.08 * batch.qty / 100) / 10, concerns:['Cost is a demo estimate'] })
  }
  const maxD = Math.max(1, ...pool.map(c => c.distanceKm)), maxC = Math.max(1, ...pool.map(c => c.cost)), sum = w.distance + w.cost + w.capacity || 1
  const candidates: Candidate[] = pool.map(c => {
    const dS = 1 - c.distanceKm / maxD * .8, cS = 1 - c.cost / maxC * .8, kS = Math.min(1, (c.processor.capacity - batch.qty) / c.processor.capacity + .3)
    const score = Math.round((w.distance*dS + w.cost*cS + w.capacity*kS) / sum * 100)
    const concerns = [...c.concerns]; if (c.processor.capacity - batch.qty < 300) concerns.push('Little spare capacity after this batch')
    return { ...c, score, concerns, reasons:[`Accepts ${batch.category}`, `${c.distanceKm} km away (distance score ${Math.round(dS*100)})`, `Est. transport ${c.cost} USD (demo)`, `${c.processor.capacity - batch.qty} kg spare capacity after acceptance`] }
  }).sort((a, b) => b.score - a.score)
  return { candidates, excluded }
}
