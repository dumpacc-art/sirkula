import type { Batch, Processor, Notif, Activity } from '../types'
export const demoBatches: Batch[] = [
  { id:'BT-1001', name:'PET bottle bales', category:'Plastic', qty:1200, unit:'kg', source:'Harbor Hotel Group', region:'Southeast Asia', status:'validated', date:'2026-09-02', evidence:'none' },
  { id:'BT-1002', name:'Cardboard offcuts', category:'Paper', qty:3400, unit:'kg', source:'Nordlys Packaging', region:'Northern Europe', status:'matched', date:'2026-09-05', evidence:'none' },
  { id:'BT-1003', name:'Food scraps (sorted)', category:'Organic', qty:5200, unit:'kg', source:'Kebun Bersama Community', region:'Southeast Asia', status:'collection_scheduled', date:'2026-09-11', evidence:'none' },
  { id:'BT-1004', name:'Glass cullet', category:'Glass', qty:2100, unit:'kg', source:'Casa Vidrio', region:'Latin America', status:'processing', date:'2026-09-14', evidence:'none' },
  { id:'BT-1005', name:'Aluminium cans', category:'Metal', qty:860, unit:'kg', source:'Metro Beverages', region:'East Africa', status:'evidence_submitted', date:'2026-09-18', evidence:'pending' },
  { id:'BT-1006', name:'Textile trimmings', category:'Textile', qty:640, unit:'kg', source:'Loom & Co', region:'South Asia', status:'verified', date:'2026-09-21', evidence:'accepted' },
  { id:'BT-1007', name:'Mixed e-waste', category:'Electronics', qty:9000, unit:'kg', source:'TechBack Ltd', region:'Northern Europe', status:'registered', date:'2026-10-01', evidence:'none' },
  { id:'BT-1008', name:'HDPE crates', category:'Plastic', qty:450, unit:'kg', source:'Harbor Hotel Group', region:'Southeast Asia', status:'exception', date:'2026-10-03', evidence:'none' },
]
export const demoProcessors: Processor[] = [
  { id:'PR-01', name:'GreenLoop Recyclers', region:'Southeast Asia', accepts:['Plastic','Metal'], capacity:3000, lat:-8.65, lng:115.2 },
  { id:'PR-02', name:'Fibra Nova', region:'Northern Europe', accepts:['Paper','Textile'], capacity:5000, lat:59.9, lng:10.7 },
  { id:'PR-03', name:'Humus Works', region:'Southeast Asia', accepts:['Organic'], capacity:1500, lat:-8.5, lng:115.3 },
  { id:'PR-04', name:'ReVidrio', region:'Latin America', accepts:['Glass'], capacity:200, lat:-33.4, lng:-70.6 },
  { id:'PR-05', name:'CircuitCycle', region:'Northern Europe', accepts:['Electronics','Metal'], capacity:4000, lat:55.7, lng:12.5 },
]
export const demoNotifs: Notif[] = [
  { id:'N1', title:'Match ready', body:'BT-1002 has 2 eligible processors.', time:'2h ago', category:'Match results', read:false, link:'/app/matching' },
  { id:'N2', title:'Evidence awaiting review', body:'BT-1005 utilization evidence submitted.', time:'5h ago', category:'Evidence reviews', read:false, link:'/app/tracking' },
  { id:'N3', title:'Collection reminder', body:'BT-1003 pickup scheduled tomorrow.', time:'1d ago', category:'Collection reminders', read:false, link:'/app/materials' },
  { id:'N4', title:'Agreement needs revision', body:'Shared collection plan v2 was returned.', time:'2d ago', category:'Agreement approvals', read:true, link:'/app/agreements' },
]
export const demoActivity: Activity[] = [
  { id:'A1', text:'Batch BT-1007 registered', time:'1d ago', link:'/app/materials' },
  { id:'A2', text:'Match accepted for BT-1002', time:'2d ago', link:'/app/matching' },
  { id:'A3', text:'Weight discrepancy flagged on BT-1008', time:'3d ago', link:'/app/tracking' },
]
export const flowSeries = [
  { m:'May', collected:420, processed:310 }, { m:'Jun', collected:560, processed:450 }, { m:'Jul', collected:640, processed:540 },
  { m:'Aug', collected:780, processed:620 }, { m:'Sep', collected:910, processed:760 }, { m:'Oct', collected:860, processed:790 },
]
import type { Evidence } from '../types'
export const demoEvidence: Evidence[] = [
  { id:'E1', batchId:'BT-1005', stage:'evidence_submitted', note:'Smelter intake receipt (placeholder)', status:'awaiting review', by:'Metro Beverages', date:'2026-10-12' },
  { id:'E2', batchId:'BT-1006', stage:'evidence_submitted', note:'Yarn production record (placeholder)', status:'accepted', by:'Loom & Co', date:'2026-10-02' },
]
import type { Initiative, Agreement } from '../types'
export const communities = [
  { name:'Kebun Bersama', region:'Southeast Asia', members:142 }, { name:'Nordlys Neighbourhood Co-op', region:'Northern Europe', members:87 }, { name:'Barrio Verde', region:'Latin America', members:203 },
]
export const demoInitiatives: Initiative[] = [
  { id:'IN-1', title:'Shared organic collection route', community:'Kebun Bersama', objective:'Pool food scraps from 40 households', category:'Organic', qty:5200, status:'active', comments:[{ by:'Council', text:'Weekly pickup works for most households.', date:'2026-09-20' }] },
  { id:'IN-2', title:'Textile swap and trimmings recovery', community:'Nordlys Neighbourhood Co-op', objective:'Divert tailoring offcuts', category:'Textile', qty:800, status:'proposed', comments:[] },
  { id:'IN-3', title:'Glass bottle return points', community:'Barrio Verde', objective:'Three neighbourhood return points', category:'Glass', qty:2100, status:'revision', comments:[{ by:'ReVidrio', text:'Please confirm contamination limits.', date:'2026-10-04' }] },
]
export const demoAgreements: Agreement[] = [
  { id:'AG-1', title:'Organic collection route agreement', community:'Kebun Bersama', required:['Kebun Bersama','Humus Works','Harbor Hotel Group'], approvedBy:[{ party:'Kebun Bersama', version:2 }], version:2, status:'pending', effective:'2026-11-01 to 2027-10-31',
    shares:[{ party:'Kebun Bersama', share:40 }, { party:'Humus Works', share:35 }, { party:'Harbor Hotel Group', share:25 }], history:[{ date:'2026-09-25', text:'v1 proposed' }, { date:'2026-10-02', text:'v2 revised: schedule changed' }], updated:'2026-10-02' },
  { id:'AG-2', title:'Glass return point scheme', community:'Barrio Verde', required:['Barrio Verde','ReVidrio'], approvedBy:[], version:1, status:'revision', effective:'2026-12-01 to 2027-11-30',
    shares:[{ party:'Barrio Verde', share:50 }, { party:'ReVidrio', share:50 }], history:[{ date:'2026-10-04', text:'v1 proposed' }, { date:'2026-10-06', text:'Revision requested by ReVidrio' }], updated:'2026-10-06' },
  { id:'AG-3', title:'Packaging offcut take-back', community:'Nordlys Neighbourhood Co-op', required:['Nordlys Packaging','Fibra Nova'], approvedBy:[{ party:'Nordlys Packaging', version:1 }, { party:'Fibra Nova', version:1 }], version:1, status:'active', effective:'2026-08-01 to 2027-07-31',
    shares:[{ party:'Nordlys Packaging', share:60 }, { party:'Fibra Nova', share:40 }], history:[{ date:'2026-07-10', text:'v1 proposed' }, { date:'2026-07-20', text:'Activated after all approvals' }], updated:'2026-07-20' },
]
import type { Product, Order } from '../types'
export const demoProducts: Product[] = [
  { id:'P-1', name:'Recycled PET tote bag', seller:'GreenLoop Recyclers', category:'Bags', price:18, stock:120, desc:'Woven from post-consumer PET bottles.', traceable:true, origin:'PET bottle bales, Southeast Asia (self-reported)', batchId:'BT-1001', region:'Southeast Asia', hue:150 },
  { id:'P-2', name:'Cardboard desk organiser', seller:'Fibra Nova', category:'Home', price:12, stock:2, desc:'Pressed fibre from packaging offcuts. Limited run.', traceable:true, origin:'Cardboard offcuts, Northern Europe (self-reported)', batchId:'BT-1002', region:'Northern Europe', hue:40 },
  { id:'P-3', name:'Compost starter (5 kg)', seller:'Humus Works', category:'Garden', price:9, stock:300, desc:'Finished compost from sorted food scraps.', traceable:false, region:'Southeast Asia', hue:100 },
  { id:'P-4', name:'Cullet glass tumblers (set of 4)', seller:'ReVidrio', category:'Home', price:26, stock:40, desc:'Blown from recovered glass cullet.', traceable:true, origin:'Glass cullet, Latin America (self-reported)', batchId:'BT-1004', region:'Latin America', hue:190 },
  { id:'P-5', name:'Trimmings patchwork scarf', seller:'Loom & Co', category:'Apparel', price:34, stock:25, desc:'Made from textile trimmings.', traceable:true, origin:'Textile trimmings, South Asia. Evidence accepted by a platform reviewer.', batchId:'BT-1006', region:'South Asia', hue:20 },
  { id:'P-6', name:'Aluminium pen set', seller:'CircuitCycle', category:'Office', price:15, stock:0, desc:'Machined from recycled aluminium.', traceable:false, region:'Northern Europe', hue:210 },
]
export const demoOrders: Order[] = [
  { id:'O-1001', buyer:'Cafe Daun', lines:[{ productId:'P-3', name:'Compost starter (5 kg)', qty:10, price:9 }], total:90, date:'2026-10-10', status:'preparing' },
  { id:'O-1002', buyer:'Studio Fjord', lines:[{ productId:'P-1', name:'Recycled PET tote bag', qty:20, price:18 }], total:360, date:'2026-10-14', status:'pending' },
  { id:'O-1003', buyer:'Cafe Daun', lines:[{ productId:'P-4', name:'Cullet glass tumblers (set of 4)', qty:2, price:26 }], total:52, date:'2026-09-30', status:'cancelled' },
]
