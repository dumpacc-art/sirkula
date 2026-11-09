import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { splitExpired } from '../features/history/retention'
import { deleteBlob } from '../lib/photos'
import { advanceOrder, migratePickupOrder } from '../features/tracking/orderStateMachine'
import type { OnboardingState, Submission, SubmissionPatch, PickupOrder, PriceBreakdown, Batch, Notif, Activity, User, Processor, Match, Evidence, Initiative, Agreement, Product, CartLine, Order, OrderStatus, Prefs, Pickup, SellerProfile, PickupPartner } from '../types'
import { translate } from '../i18n/translate'
import { toPartner } from '../lib/partners'
import { DEMO_PARTNERS } from '../data/smartMatchPartners'
import { ORGANIC_SHARE_PCT, CONTRACT_VERSION } from '../config/partnerContract'
import type { Partner } from '../features/smart-match/rules'
import { nearestProvince } from '../config/provinces'
import { demoBatches, demoNotifs, demoActivity, demoProcessors, demoEvidence, demoInitiatives, demoAgreements, demoProducts, demoOrders } from '../data/demoData'
interface S { user:User|null; batches:Batch[]; notifs:Notif[]; activity:Activity[]; processors:Processor[]; matches:Match[]; evidence:Evidence[]; initiatives:Initiative[]; agreements:Agreement[]; products:Product[]; cart:CartLine[]; orders:Order[]; sellers:SellerProfile[]; prefs:Prefs; pickups:Pickup[]; onboarding:OnboardingState; submissions:Submission[]; partnerLoad:Record<string,number>; pickupOrders:PickupOrder[]; orderHistory:PickupOrder[]; pickupPartners:PickupPartner[] }
interface Ctx extends S {
  toast:string|null; unread:number
  /** Mitra untuk SmartMatch: mitra demo + mitra pickup yang aktif dan mendaftar sendiri. */
  partners:Partner[]
  /** Mendaftar sebagai mitra pickup (butuh `contract`) atau memperbarui profil yang sudah ada (tanpa `contract`). Mengembalikan id mitra. */
  savePickupPartner:(d:Omit<PickupPartner,'id'|'ownerEmail'|'registeredAt'|'contract'|'active'> & { active?:boolean; signedBy?:string; signedRole?:string })=>string
  /** DEMO: menghapus profil mitra pickup milik akun ini beserta perjanjiannya. Order yang sudah dikonfirmasi tidak ikut terhapus. */
  deletePickupPartner:()=>void
  login:(u:User)=>void; logout:()=>void
  addBatch:(b:Omit<Batch,'id'|'date'|'status'>)=>void; markRead:(id:string)=>void; updateUser:(u:Partial<User>)=>void; setPrefs:(p:Partial<Prefs>)=>void; addToCart:(id:string, qty:number)=>void; removeFromCart:(id:string)=>void; setCartQty:(id:string, qty:number)=>void; placeOrder:()=>void; setOrderStatus:(id:string, st:OrderStatus)=>void; addProduct:(p:Pick<Product,'name'|'price'|'stock'|'category'> & Partial<Pick<Product,'unit'|'desc'|'source'|'region'>>)=>boolean; updateProduct:(id:string, patch:Partial<Pick<Product,'name'|'price'|'stock'|'category'|'unit'|'desc'>>)=>void; deleteProduct:(id:string)=>void; registerSeller:(p:Pick<SellerProfile,'shopName'|'region'|'about'|'kind'>)=>void; addInitiative:(i:Omit<Initiative,'id'|'status'|'comments'>)=>void; addComment:(id:string, text:string)=>void; agreementAction:(id:string, act:'approve'|'revise'|'reject'|'resubmit', note:string, party?:string)=>void; proposeCooperation:(p:{ title:string; partner:string; note:string; kind:'partner'|'program'; qty?:number; share?:number })=>string; setShare:(id:string, party:string, share:number)=>void; addEvidence:(batchId:string, note:string)=>void; reviewEvidence:(id:string, ok:boolean)=>void; acceptMatch:(batchId:string, procId:string, score:number)=>boolean; rejectMatch:(batchId:string, procId:string)=>void; markAllRead:()=>void; requestPickup:(p:Pick<Pickup,'qty'|'address'|'lat'|'lng'|'source'>)=>void; notify:(m:string, vars?:Record<string,string|number>)=>void; updateOnboarding:(p:Partial<OnboardingState>)=>void; addSubmission:(x:Omit<Submission,'id'|'createdAt'|'status'|'batchId'>)=>string
  updateSubmission:(id:string, patch:SubmissionPatch)=>void
  selectPartner:(subId:string, partner:{ id:string; name:string; score:number; distanceKm:number; remainingKg:number; team?:boolean; priceIdr?:number })=>void
  cancelPartner:(subId:string)=>void
  confirmOrder:(subId:string, price:PriceBreakdown|null)=>string|null
  /** Advances the active order one step. Completing it moves the order to orderHistory and returns it; otherwise returns null. */
  advancePickupOrder:(orderId:string, measuredKg?:number)=>PickupOrder|null
  /** Permanently removes one completed record from History and its photo from this device. */
  deleteHistoryOrder:(orderId:string)=>void
}
const KEY = 'sirkula-proto-v1'
/** Versi data demo. Jika berbeda dari yang tersimpan, data demo lama (nama, provinsi, harga) diganti dengan yang baru; data buatan pengguna tetap. */
const DATA_V = '4', DATA_KEY = KEY + ':data'
/** Next free numeric id (max + 1), so ids stay unique after records are deleted. */
const nextNum = (ids: string[], base: number) => Math.max(base, ...ids.map(i => parseInt(i.replace(/\D/g, ''), 10) || 0)) + 1
const mergeDemo = <T extends { id:string }>(saved: T[] | undefined, demo: T[]): T[] => { const ids = new Set(demo.map(d => d.id)); return [...(saved ?? []).filter(x => !ids.has(x.id)), ...demo] }
/** Stable user id derived from the account email (prototype; a backend would issue real ids). */
export const userIdOf = (email?: string) => { let h = 5381; for (const c of email ?? 'guest') h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return 'USR-' + h.toString(36).toUpperCase() }
const init: S = { user:null, batches:demoBatches, notifs:demoNotifs, activity:demoActivity, processors:demoProcessors, matches:[], evidence:demoEvidence, initiatives:demoInitiatives, agreements:demoAgreements, products:demoProducts, cart:[], orders:demoOrders, sellers:[], prefs:{ language:'English', currency:'IDR', units:'kg', emailAlerts:true }, pickups:[], onboarding:{ completed:false, step:0, pickup:null, draft:null, photo:null, wasteTypes:[], quantity:{ kg:'', bags:'', date:'', notes:'' } }, submissions:[], partnerLoad:{}, pickupOrders:[], orderHistory:[], pickupPartners:[] }
const C = createContext<Ctx>(null as unknown as Ctx)
export const useStore = () => useContext(C)
export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<S>(() => { try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '') ?? {}
    // Completed orders always belong in history, even if an older version left them in the active list.
    const orders = (saved.pickupOrders ?? []).map(migratePickupOrder) as PickupOrder[]
    const history = (saved.orderHistory ?? []).map(migratePickupOrder) as PickupOrder[]
    const stale = localStorage.getItem(DATA_KEY) !== DATA_V
    const fresh: Partial<S> = stale ? {
      batches: mergeDemo(saved.batches, demoBatches), notifs: mergeDemo(saved.notifs, demoNotifs), activity: mergeDemo(saved.activity, demoActivity),
      processors: demoProcessors, evidence: mergeDemo(saved.evidence, demoEvidence), initiatives: mergeDemo(saved.initiatives, demoInitiatives),
      agreements: mergeDemo(saved.agreements, demoAgreements), products: mergeDemo(saved.products, demoProducts), orders: mergeDemo(saved.orders, demoOrders),
      matches: (saved.matches ?? []).map((m: Match) => ({ ...m, processorName: demoProcessors.find(p => p.id === m.processorId)?.name ?? m.processorName })),
      prefs: { ...init.prefs, ...saved.prefs, currency: 'IDR' },
    } : {}
    return { ...init, ...saved, ...fresh, onboarding:{ ...init.onboarding, ...saved.onboarding },
      pickupOrders: orders.filter(o => o.status !== 'completed'),
      orderHistory: [...orders.filter(o => o.status === 'completed'), ...history] } as S
  } catch { return init } })
  const [toast, setToast] = useState<string|null>(null)
  // Retention sweep: completed records past RETENTION_DAYS are removed on load and once a minute.
  // The ref gives the sweep the latest state without re-creating the interval on every change.
  const sRef = useRef(s); sRef.current = s
  useEffect(() => {
    const sweep = () => {
      const { expired } = splitExpired(sRef.current.orderHistory, Date.now())
      if (!expired.length) return
      expired.forEach(o => { if (o.waste.photoId) deleteBlob(o.waste.photoId).catch(() => undefined) })
      const ids = new Set(expired.map(o => o.id))
      setS(p => ({ ...p, orderHistory: p.orderHistory.filter(o => !ids.has(o.id)),
        activity: [...expired.map(o => ({ id: `A${Date.now()}${o.id}`, text: `History ${o.id} expired after retention period`, time: 'just now', link: '/app/orders?tab=history' })), ...p.activity] }))
    }
    sweep()
    const timer = setInterval(sweep, 60_000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); localStorage.setItem(DATA_KEY, DATA_V) } catch { /* storage unavailable */ } }, [s])
  const notify = (m:string, vars?:Record<string,string|number>) => { setToast(translate(s.prefs.language, m, vars)); setTimeout(() => setToast(null), 3000) }
  useEffect(() => { document.documentElement.lang = s.prefs.language === 'Bahasa Indonesia' ? 'id' : 'en' }, [s.prefs.language])
  const value: Ctx = {
    ...s, toast, unread: s.notifs.filter(n => !n.read).length, notify,
    partners: [...DEMO_PARTNERS, ...s.pickupPartners.filter(x => x.active).map(toPartner)],
    savePickupPartner: d => {
      const email = s.user?.email ?? 'guest', old = s.pickupPartners.find(x => x.ownerEmail === email), day = new Date().toISOString().slice(0,10)
      const id = old?.id ?? `PP-${nextNum(s.pickupPartners.map(x => x.id), 1000)}`
      const { signedBy, signedRole, active, ...rest } = d
      const rec: PickupPartner = old ? { ...old, ...rest, active: active ?? old.active }
        : { ...rest, id, ownerEmail:email, active:true, registeredAt:day, contract:{ version:CONTRACT_VERSION, organicSharePct:ORGANIC_SHARE_PCT, signedBy:signedBy ?? '', signedRole:signedRole ?? '', signedAt:day } }
      setS(p => {
        let agreements = p.agreements
        if (!old) {
          const next = `AG-${nextNum(p.agreements.map(a => a.id), 0)}`, end = `${+day.slice(0,4) + 1}${day.slice(4)}`
          agreements = [{ id:next, title:'Pickup partner agreement', community:'SIRKULA', required:[rec.companyName, 'SIRKULA'], approvedBy:[{ party:rec.companyName, version:1 }, { party:'SIRKULA', version:1 }], version:1, status:'active', effective:`${day} to ${end}`,
            shares:[{ party:rec.companyName, share:100 - ORGANIC_SHARE_PCT }, { party:'SIRKULA', share:ORGANIC_SHARE_PCT }], history:[{ date:day, text:`v1 signed by ${rec.contract.signedBy}` }, { date:day, text:'Activated after all approvals' }], updated:day,
            kind:'program', note:`${ORGANIC_SHARE_PCT}% of organic waste weight goes to the SIRKULA office.` }, ...p.agreements]
        }
        return { ...p, agreements, pickupPartners: old ? p.pickupPartners.map(x => x.id === id ? rec : x) : [rec, ...p.pickupPartners],
          activity:[{ id:`A${Date.now()}`, text: old ? `Pickup partner profile updated: ${rec.companyName}` : `Registered as pickup partner: ${rec.companyName}`, time:'just now', link:'/app/partners?tab=programs' }, ...p.activity] }
      })
      return id
    },
    deletePickupPartner: () => {
      const email = s.user?.email ?? 'guest', mine = s.pickupPartners.find(x => x.ownerEmail === email)
      if (!mine) return
      setS(p => ({ ...p,
        pickupPartners: p.pickupPartners.filter(x => x.id !== mine.id),
        // Perjanjian mitra ini ikut dihapus; order yang sudah dikonfirmasi tetap ada di Orders/History.
        agreements: p.agreements.filter(a => !(a.title === 'Pickup partner agreement' && a.required.includes(mine.companyName))),
        // Draft yang sudah memilih mitra ini kembali ke langkah "Pilih mitra".
        submissions: p.submissions.map(x => !x.orderId && x.partner?.id === mine.id ? { ...x, status: 'submitted', partner: undefined } : x),
        batches: p.batches.map(b => p.submissions.some(x => !x.orderId && x.partner?.id === mine.id && x.batchId === b.id) ? { ...b, status: 'registered' } : b),
        partnerLoad: Object.fromEntries(Object.entries(p.partnerLoad).filter(([k]) => k !== mine.id)),
        activity: [{ id: `A${Date.now()}`, text: `Pickup partner deleted: ${mine.companyName}`, time: 'just now', link: '/app/partners?tab=programs' }, ...p.activity] }))
      notify('Pickup partner deleted (demo)')
    },
    login: user => setS(p => ({ ...p, user })),
    logout: () => setS(p => ({ ...p, user:null })),
    addBatch: b => setS(p => {
      const id = `BT-${1001 + p.batches.length}`
      return { ...p, batches:[{ ...b, id, status:'registered', date:new Date().toISOString().slice(0,10) }, ...p.batches],
        activity:[{ id:`A${Date.now()}`, text:`Batch ${id} registered`, time:'just now', link:'/app/materials' }, ...p.activity] }
    }),
    acceptMatch: (batchId, procId, score) => {
      const b = s.batches.find(x => x.id === batchId), pr = s.processors.find(x => x.id === procId)
      if (b?.workflow === 'sirkula-ewaste') { notify('E-waste is handled by the SIRKULA workflow. Regular partners cannot be selected.'); return false }
      if (!b || !pr || pr.capacity < b.qty) { notify('Cannot accept: capacity insufficient'); return false }
      const m: Match = { id:`M-${Date.now()}`, batchId, processorId:procId, processorName:pr.name, qty:b.qty, score, status:'accepted', date:new Date().toISOString().slice(0,10) }
      setS(p => ({ ...p, matches:[m, ...p.matches],
        processors:p.processors.map(x => x.id === procId ? { ...x, capacity:x.capacity - b.qty } : x),
        batches:p.batches.map(x => x.id === batchId ? { ...x, status:'matched' } : x),
        activity:[{ id:`A${Date.now()}`, text:`Match accepted: ${batchId} → ${pr.name}`, time:'just now', link:'/app/pickup' }, ...p.activity] }))
      notify('Match accepted. {name} capacity reserved (demo).', { name:pr.name }); return true
    },
    rejectMatch: (batchId, procId) => {
      const pr = s.processors.find(x => x.id === procId); if (!pr) return
      setS(p => ({ ...p, matches:[{ id:`M-${Date.now()}`, batchId, processorId:procId, processorName:pr.name, qty:0, score:0, status:'rejected', date:new Date().toISOString().slice(0,10) }, ...p.matches] }))
      notify('Candidate rejected')
    },
    addEvidence: (batchId, note) => setS(p => ({ ...p,
      evidence:[{ id:`E${Date.now()}`, batchId, stage:'evidence_submitted', note, status:'awaiting review', by:p.user?.org ?? 'Organisasi Demo', date:new Date().toISOString().slice(0,10) }, ...p.evidence],
      batches:p.batches.map(b => b.id === batchId ? { ...b, status:'evidence_submitted', evidence:'pending' } : b) })),
    reviewEvidence: (id, ok) => setS(p => { const e = p.evidence.find(x => x.id === id); if (!e) return p
      return { ...p, evidence:p.evidence.map(x => x.id === id ? { ...x, status:ok ? 'accepted' : 'rejected' } : x),
        batches:p.batches.map(b => b.id === e.batchId ? { ...b, status:ok ? 'verified' : 'processing', evidence:ok ? 'accepted' : 'none' } : b),
        activity:[{ id:`A${Date.now()}`, text:`Evidence ${ok ? 'accepted' : 'rejected'} for ${e.batchId}`, time:'just now', link:'/app/orders' }, ...p.activity] } }),
    addInitiative: i => setS(p => ({ ...p, initiatives:[{ ...i, id:`IN-${p.initiatives.length + 1}`, status:'proposed', comments:[] }, ...p.initiatives] })),
    addComment: (id, text) => setS(p => ({ ...p, initiatives:p.initiatives.map(x => x.id === id ? { ...x, comments:[...x.comments, { by:p.user?.name ?? 'Pengguna Demo', text, date:new Date().toISOString().slice(0,10) }] } : x) })),
    proposeCooperation: x => {
      const id = `AG-${nextNum(s.agreements.map(a => a.id), 0)}`, d = new Date().toISOString().slice(0,10), me = s.user?.org || s.user?.name || 'Organisasi Demo', mine = Math.min(100, Math.max(0, x.share ?? 50))
      const a: Agreement = { id, title:x.title, community:x.partner, required:[me, x.partner], approvedBy:[{ party:me, version:1 }], version:1, status:'pending', effective:'—',
        shares:[{ party:me, share:mine }, { party:x.partner, share:100 - mine }], history:[{ date:d, text:`v1 proposed by ${me}` }], updated:d, kind:x.kind, note:[x.note, x.qty ? `~${x.qty} kg` : ''].filter(Boolean).join(' · ') }
      setS(p => ({ ...p, agreements:[a, ...p.agreements], activity:[{ id:`A${Date.now()}`, text:`Cooperation proposed: ${x.title}`, time:'just now', link:`/app/partners?tab=agreements&id=${id}` }, ...p.activity] }))
      return id
    },
    setShare: (id, party, share) => setS(p => ({ ...p, agreements:p.agreements.map(a => a.id === id ? { ...a, shares:a.shares.map(x => x.party === party ? { ...x, share:Math.max(0, share) } : x) } : a) })),
    agreementAction: (id, act, note, party) => setS(p => { const a = p.agreements.find(x => x.id === id); if (!a) return p
      const d = new Date().toISOString().slice(0,10), n = note ? `: ${note}` : ''; let u: Agreement = { ...a, updated:d }
      if (act === 'approve') { if (a.status !== 'pending' || !party) return p
        u.approvedBy = [...a.approvedBy.filter(x => x.party !== party), { party, version:a.version }]
        u.history = [...a.history, { date:d, text:`${party} approved v${a.version}${n}` }]
        if (a.required.every(r => u.approvedBy.some(x => x.party === r && x.version === a.version))) { u.status = 'active'; u.history.push({ date:d, text:'Activated after all approvals' }) } }
      if (act === 'revise') { u.status = 'revision'; u.history = [...a.history, { date:d, text:`Revision requested${n}` }] }
      if (act === 'reject') { u.status = 'rejected'; u.history = [...a.history, { date:d, text:`Rejected${n}` }] }
      if (act === 'resubmit') { u.version = a.version + 1; u.approvedBy = []; u.status = 'pending'; u.history = [...a.history, { date:d, text:`v${u.version} submitted. All approvals reset${n}` }] }
      return { ...p, agreements:p.agreements.map(x => x.id === id ? u : x), activity:[{ id:`A${Date.now()}`, text:`${a.title}: ${act}`, time:'just now', link:'/app/partners?tab=agreements' }, ...p.activity] } }),
    addToCart: (id, qty) => { const pr = s.products.find(x => x.id === id); if (!pr) return
      const have = s.cart.find(c => c.productId === id)?.qty ?? 0
      if (qty < 1 || have + qty > pr.stock) { notify('Only {stock} in stock ({have} already in cart)', { stock:pr.stock, have }); return }
      setS(p => ({ ...p, cart:p.cart.some(c => c.productId === id) ? p.cart.map(c => c.productId === id ? { ...c, qty:c.qty + qty } : c) : [...p.cart, { productId:id, qty }] })); notify('Added to cart') },
    setCartQty: (id, qty) => setS(p => { const pr = p.products.find(x => x.id === id); if (!pr) return p; const q = Math.max(0, Math.min(qty, pr.stock)); return { ...p, cart:q === 0 ? p.cart.filter(c => c.productId !== id) : p.cart.map(c => c.productId === id ? { ...c, qty:q } : c) } }),
    removeFromCart: id => setS(p => ({ ...p, cart:p.cart.filter(c => c.productId !== id) })),
    placeOrder: () => {
      if (!s.cart.length) return
      for (const c of s.cart) { const pr = s.products.find(x => x.id === c.productId); if (!pr || pr.stock < c.qty) { notify('{name} no longer has enough stock', { name:pr?.name ?? 'Item' }); return } }
      setS(p => { const lines = p.cart.map(c => { const pr = p.products.find(x => x.id === c.productId)!; return { productId:pr.id, name:pr.name, qty:c.qty, price:pr.price } })
        const o: Order = { id:`O-${1001 + p.orders.length}`, buyer:p.user?.org ?? 'Organisasi Demo', lines, total:lines.reduce((a, l) => a + l.qty * l.price, 0), date:new Date().toISOString().slice(0,10), status:'pending' }
        return { ...p, orders:[o, ...p.orders], cart:[], products:p.products.map(x => { const c = p.cart.find(k => k.productId === x.id); return c ? { ...x, stock:x.stock - c.qty } : x }),
          activity:[{ id:`A${Date.now()}`, text:`Order ${o.id} created (prototype)`, time:'just now', link:'/app/marketplace#orders' }, ...p.activity] } })
      notify('Prototype order created. No payment taken.') },
    setOrderStatus: (id, st) => setS(p => { const o = p.orders.find(x => x.id === id); if (!o) return p
      const restock = st === 'cancelled' && o.status !== 'cancelled'
      return { ...p, orders:p.orders.map(x => x.id === id ? { ...x, status:st } : x), products:restock ? p.products.map(x => { const l = o.lines.find(k => k.productId === x.id); return l ? { ...x, stock:x.stock + l.qty } : x }) : p.products } }),
    registerSeller: sp => { if (!s.user) return; const prof: SellerProfile = { ...sp, ownerId:userIdOf(s.user.email), joined:new Date().toISOString().slice(0,10) }
      setS(p => ({ ...p, sellers:[...p.sellers.filter(x => x.ownerId !== prof.ownerId), prof] })); notify('You are now a selling partner') },
    addProduct: pr => { const u = s.user; const me = u ? s.sellers.find(x => x.ownerId === userIdOf(u.email)) : undefined
      if (!u || !me) { notify('Register as a selling partner first'); return false }
      setS(p => ({ ...p, products:[{ unit:'pcs', source:'partner', region:me.region, ...pr, desc:pr.desc?.trim() || 'Listing from a selling partner.', id:`P-${Date.now().toString(36)}`, seller:me.shopName, sellerId:me.ownerId, mine:true, traceable:false, hue:Math.floor(Math.random() * 360) } as Product, ...p.products] })); return true },
    updateProduct: (id, patch) => setS(p => ({ ...p, products:p.products.map(x => x.id === id && x.mine ? { ...x, ...patch } : x) })),
    deleteProduct: id => setS(p => ({ ...p, products:p.products.filter(x => !(x.id === id && x.mine)), cart:p.cart.filter(c => c.productId !== id) })),
    updateUser: u => setS(p => p.user ? { ...p, user:{ ...p.user, ...u } } : p),
    setPrefs: x => setS(p => ({ ...p, prefs:{ ...p.prefs, ...x } })),
    markRead: id => setS(p => ({ ...p, notifs:p.notifs.map(n => n.id === id ? { ...n, read:true } : n) })),
    requestPickup: x => setS(p => ({ ...p,
      pickups:[{ ...x, id:`PK-${2001 + p.pickups.length}`, requester:p.user?.org ?? 'Organisasi Demo', date:new Date().toISOString().slice(0,10), status:'requested' }, ...p.pickups],
      activity:[{ id:`A${Date.now()}`, text:`Food waste pickup requested: ${x.qty} kg`, time:'just now', link:'/app/dashboard' }, ...p.activity] })),
    updateOnboarding: p => setS(s => ({ ...s, onboarding:{ ...s.onboarding, ...p } })),
    addSubmission: x => {
      const id = `SUB-${1001 + s.submissions.length}`, batchId = `BT-${1001 + s.batches.length}`, date = new Date().toISOString().slice(0,10)
      const sub: Submission = { ...x, id, batchId, createdAt: new Date().toISOString(), status: 'submitted' }
      const batch: Batch = { id: batchId, name: `Order ${id}`, category: x.stream, qty: x.quantity.kg, unit: 'kg', source: x.pickup.addressText, region: nearestProvince(x.pickup.lat, x.pickup.lng),
        status: 'registered', date, evidence: 'none', workflow: x.workflow, lat: x.pickup.lat, lng: x.pickup.lng }
      setS(p => ({ ...p, submissions: [sub, ...p.submissions], batches: [batch, ...p.batches],
        activity: [{ id: `A${Date.now()}`, text: `Order ${id} submitted (${x.workflow})`, time: 'just now', link: '/app/pickup' }, ...p.activity] }))
      return id
    },
    updateSubmission: (subId, patch) => setS(p => {
      const sub = p.submissions.find(x => x.id === subId)
      if (!sub) return p
      const next = { ...sub, ...patch }
      return { ...p,
        submissions: p.submissions.map(x => x.id === subId ? next : x),
        batches: p.batches.map(b => b.id === sub.batchId ? { ...b, category: next.stream, qty: next.quantity.kg, source: next.pickup.addressText, lat: next.pickup.lat, lng: next.pickup.lng, workflow: next.workflow } : b) }
    }),
    selectPartner: (subId, partner) => {
      const sub = s.submissions.find(x => x.id === subId)
      if (!sub || sub.partner) return
      const kg = sub.quantity.kg
      if (!partner.team && partner.remainingKg < kg) { notify('Quota is full'); return }
      const date = new Date().toISOString().slice(0, 10)
      const m: Match = { id: `M-${Date.now()}`, batchId: sub.batchId, processorId: partner.id, processorName: partner.name, qty: kg, score: partner.score, status: 'accepted', date }
      setS(p => ({ ...p,
        submissions: p.submissions.map(x => x.id === subId ? { ...x, status: partner.team ? 'sirkula_team' : 'partner_selected',
          partner: { id: partner.id, name: partner.name, score: partner.score, distanceKm: partner.distanceKm, team: !!partner.team, priceIdr: partner.priceIdr } } : x),
        batches: p.batches.map(b => b.id === sub.batchId ? { ...b, status: 'matched' } : b),
        partnerLoad: partner.team ? p.partnerLoad : { ...p.partnerLoad, [partner.id]: (p.partnerLoad[partner.id] ?? 0) + kg },
        matches: [m, ...p.matches],
        activity: [{ id: `A${Date.now()}`, text: partner.team ? `Order ${sub.id} routed to SIRKULA e-waste team` : `Order ${sub.id} matched with ${partner.name}`, time: 'just now', link: '/app/pickup' }, ...p.activity] }))
      notify(partner.team ? 'Order routed to the SIRKULA e-waste team' : 'Partner selected (demo)')
    },
    cancelPartner: subId => {
      const sub = s.submissions.find(x => x.id === subId)
      if (!sub || !sub.partner || sub.orderId) return // a confirmed order cannot be unselected
      const pid = sub.partner.id, kg = sub.quantity.kg, team = sub.partner.team
      setS(p => ({ ...p,
        submissions: p.submissions.map(x => x.id === subId ? { ...x, status: 'submitted', partner: undefined } : x),
        batches: p.batches.map(b => b.id === sub.batchId ? { ...b, status: 'registered' } : b),
        partnerLoad: team ? p.partnerLoad : { ...p.partnerLoad, [pid]: Math.max(0, (p.partnerLoad[pid] ?? 0) - kg) } }))
      notify('Partner selection cancelled')
    },
    confirmOrder: (subId, price) => {
      const sub = s.submissions.find(x => x.id === subId)
      if (!sub || !sub.partner || sub.orderId) return null
      // Counts completed orders too, so IDs stay unique after an order moves to history.
      const id = `ORD-${1001 + s.pickupOrders.length + s.orderHistory.length}`, now = new Date().toISOString()
      const order: PickupOrder = {
        id, userId: userIdOf(s.user?.email), createdAt: now, status: 'scheduled', submissionId: sub.id, batchId: sub.batchId,
        waste: { stream: sub.stream, workflow: sub.workflow, categories: sub.wasteTypes, kg: sub.quantity.kg, bags: sub.quantity.bags,
          preferredDate: sub.quantity.preferredDate, notes: sub.quantity.notes, photoId: sub.photo?.id ?? null },
        partner: { id: sub.partner.id, name: sub.partner.name, team: sub.partner.team, score: sub.partner.score, distanceKm: sub.partner.distanceKm },
        price, coords: { lat: sub.pickup.lat, lng: sub.pickup.lng }, address: sub.pickup.addressText,
        statusHistory: [{ status: 'pending_match', at: now }, { status: 'matched', at: now }, { status: 'scheduled', at: now }],
      }
      setS(p => ({ ...p,
        pickupOrders: [order, ...p.pickupOrders],
        submissions: p.submissions.map(x => x.id === subId ? { ...x, status: 'confirmed', orderId: id } : x),
        activity: [{ id: `A${Date.now()}`, text: `Order ${id} confirmed`, time: 'just now', link: '/app/orders' }, ...p.activity] }))
      notify('Order confirmed')
      return id
    },
    advancePickupOrder: (orderId, measuredKg) => {
      const o = s.pickupOrders.find(x => x.id === orderId)
      if (!o) return null
      if (measuredKg !== undefined && (!Number.isFinite(measuredKg) || measuredKg <= 0)) { notify('Enter a valid weight'); return null }
      const now = new Date().toISOString()
      const n = advanceOrder(o, now, measuredKg)
      if (!n) { notify('This order is already completed'); return null }
      if (n.status === 'completed') {
        // Completing ends the active tracking session. The record moves to history and is kept.
        const done: PickupOrder = { ...o, ...n }
        setS(p => ({ ...p,
          pickupOrders: p.pickupOrders.filter(x => x.id !== orderId),
          orderHistory: [done, ...p.orderHistory],
          activity: [{ id: `A${Date.now()}`, text: `Order ${orderId} completed`, time: 'just now', link: `/app/orders?tab=history&order=${orderId}` }, ...p.activity] }))
        notify('Order completed. Receipt is available in History.')
        return done
      }
      setS(p => ({ ...p, pickupOrders: p.pickupOrders.map(x => x.id === orderId ? { ...x, ...n } : x),
        activity: [{ id: `A${Date.now()}`, text: `Order ${orderId}: ${n.status}`, time: 'just now', link: `/app/orders?order=${orderId}` }, ...p.activity] }))
      return null
    },
    deleteHistoryOrder: orderId => {
      const o = s.orderHistory.find(x => x.id === orderId)
      if (!o) return
      if (o.waste.photoId) deleteBlob(o.waste.photoId).catch(() => undefined)
      setS(p => ({ ...p, orderHistory: p.orderHistory.filter(x => x.id !== orderId),
        activity: [{ id: `A${Date.now()}`, text: `History ${orderId} deleted by user`, time: 'just now', link: '/app/orders?tab=history' }, ...p.activity] }))
      notify('History record deleted')
    },
    markAllRead: () => setS(p => ({ ...p, notifs:p.notifs.map(n => ({ ...n, read:true })) })),
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
