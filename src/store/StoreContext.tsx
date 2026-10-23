import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Batch, Notif, Activity, Role, User, Processor, Match, Evidence, Initiative, Agreement, Product, CartLine, Order, OrderStatus, Prefs, Pickup } from '../types'
import { translate } from '../i18n/translate'
import { demoBatches, demoNotifs, demoActivity, demoProcessors, demoEvidence, demoInitiatives, demoAgreements, demoProducts, demoOrders } from '../data/demoData'
interface S { user:User|null; batches:Batch[]; notifs:Notif[]; activity:Activity[]; processors:Processor[]; matches:Match[]; evidence:Evidence[]; initiatives:Initiative[]; agreements:Agreement[]; products:Product[]; cart:CartLine[]; orders:Order[]; prefs:Prefs; pickups:Pickup[] }
interface Ctx extends S {
  toast:string|null; unread:number
  login:(u:User)=>void; logout:()=>void; setRole:(r:Role)=>void
  addBatch:(b:Omit<Batch,'id'|'date'|'status'>)=>void; markRead:(id:string)=>void; updateUser:(u:Partial<User>)=>void; setPrefs:(p:Partial<Prefs>)=>void; addToCart:(id:string, qty:number)=>void; removeFromCart:(id:string)=>void; placeOrder:()=>void; setOrderStatus:(id:string, st:OrderStatus)=>void; addProduct:(p:Omit<Product,'id'|'desc'|'traceable'|'hue'|'region'>)=>void; addInitiative:(i:Omit<Initiative,'id'|'status'|'comments'>)=>void; addComment:(id:string, text:string)=>void; agreementAction:(id:string, act:'approve'|'revise'|'reject'|'resubmit', note:string, party?:string)=>void; setShare:(id:string, party:string, share:number)=>void; addEvidence:(batchId:string, note:string)=>void; reviewEvidence:(id:string, ok:boolean)=>void; acceptMatch:(batchId:string, procId:string, score:number)=>boolean; rejectMatch:(batchId:string, procId:string)=>void; markAllRead:()=>void; requestPickup:(p:Pick<Pickup,'qty'|'address'|'lat'|'lng'|'source'>)=>void; notify:(m:string, vars?:Record<string,string|number>)=>void
}
const KEY = 'sirkula-proto-v1'
const init: S = { user:null, batches:demoBatches, notifs:demoNotifs, activity:demoActivity, processors:demoProcessors, matches:[], evidence:demoEvidence, initiatives:demoInitiatives, agreements:demoAgreements, products:demoProducts, cart:[], orders:demoOrders, prefs:{ language:'English', currency:'USD', units:'kg', emailAlerts:true }, pickups:[] }
const C = createContext<Ctx>(null as unknown as Ctx)
export const useStore = () => useContext(C)
export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<S>(() => { try { return { ...init, ...JSON.parse(localStorage.getItem(KEY) || '') } as S } catch { return init } })
  const [toast, setToast] = useState<string|null>(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage unavailable */ } }, [s])
  const notify = (m:string, vars?:Record<string,string|number>) => { setToast(translate(s.prefs.language, m, vars)); setTimeout(() => setToast(null), 3000) }
  useEffect(() => { document.documentElement.lang = s.prefs.language === 'Bahasa Indonesia' ? 'id' : 'en' }, [s.prefs.language])
  const value: Ctx = {
    ...s, toast, unread: s.notifs.filter(n => !n.read).length, notify,
    login: user => setS(p => ({ ...p, user })),
    logout: () => setS(p => ({ ...p, user:null })),
    setRole: role => setS(p => p.user ? { ...p, user:{ ...p.user, role } } : p),
    addBatch: b => setS(p => {
      const id = `BT-${1001 + p.batches.length}`
      return { ...p, batches:[{ ...b, id, status:'registered', date:new Date().toISOString().slice(0,10) }, ...p.batches],
        activity:[{ id:`A${Date.now()}`, text:`Batch ${id} registered`, time:'just now', link:'/app/materials' }, ...p.activity] }
    }),
    acceptMatch: (batchId, procId, score) => {
      const b = s.batches.find(x => x.id === batchId), pr = s.processors.find(x => x.id === procId)
      if (!b || !pr || pr.capacity < b.qty) { notify('Cannot accept: capacity insufficient'); return false }
      const m: Match = { id:`M-${Date.now()}`, batchId, processorId:procId, processorName:pr.name, qty:b.qty, score, status:'accepted', date:new Date().toISOString().slice(0,10) }
      setS(p => ({ ...p, matches:[m, ...p.matches],
        processors:p.processors.map(x => x.id === procId ? { ...x, capacity:x.capacity - b.qty } : x),
        batches:p.batches.map(x => x.id === batchId ? { ...x, status:'matched' } : x),
        activity:[{ id:`A${Date.now()}`, text:`Match accepted: ${batchId} → ${pr.name}`, time:'just now', link:'/app/matching' }, ...p.activity] }))
      notify('Match accepted. {name} capacity reserved (demo).', { name:pr.name }); return true
    },
    rejectMatch: (batchId, procId) => {
      const pr = s.processors.find(x => x.id === procId); if (!pr) return
      setS(p => ({ ...p, matches:[{ id:`M-${Date.now()}`, batchId, processorId:procId, processorName:pr.name, qty:0, score:0, status:'rejected', date:new Date().toISOString().slice(0,10) }, ...p.matches] }))
      notify('Candidate rejected')
    },
    addEvidence: (batchId, note) => setS(p => ({ ...p,
      evidence:[{ id:`E${Date.now()}`, batchId, stage:'evidence_submitted', note, status:'awaiting review', by:p.user?.org ?? 'Demo Organization', date:new Date().toISOString().slice(0,10) }, ...p.evidence],
      batches:p.batches.map(b => b.id === batchId ? { ...b, status:'evidence_submitted', evidence:'pending' } : b) })),
    reviewEvidence: (id, ok) => setS(p => { const e = p.evidence.find(x => x.id === id); if (!e) return p
      return { ...p, evidence:p.evidence.map(x => x.id === id ? { ...x, status:ok ? 'accepted' : 'rejected' } : x),
        batches:p.batches.map(b => b.id === e.batchId ? { ...b, status:ok ? 'verified' : 'processing', evidence:ok ? 'accepted' : 'none' } : b),
        activity:[{ id:`A${Date.now()}`, text:`Evidence ${ok ? 'accepted' : 'rejected'} for ${e.batchId}`, time:'just now', link:'/app/tracking' }, ...p.activity] } }),
    addInitiative: i => setS(p => ({ ...p, initiatives:[{ ...i, id:`IN-${p.initiatives.length + 1}`, status:'proposed', comments:[] }, ...p.initiatives] })),
    addComment: (id, text) => setS(p => ({ ...p, initiatives:p.initiatives.map(x => x.id === id ? { ...x, comments:[...x.comments, { by:p.user?.name ?? 'Demo User', text, date:new Date().toISOString().slice(0,10) }] } : x) })),
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
      return { ...p, agreements:p.agreements.map(x => x.id === id ? u : x), activity:[{ id:`A${Date.now()}`, text:`${a.title}: ${act}`, time:'just now', link:'/app/agreements' }, ...p.activity] } }),
    addToCart: (id, qty) => { const pr = s.products.find(x => x.id === id); if (!pr) return
      const have = s.cart.find(c => c.productId === id)?.qty ?? 0
      if (qty < 1 || have + qty > pr.stock) { notify('Only {stock} in stock ({have} already in cart)', { stock:pr.stock, have }); return }
      setS(p => ({ ...p, cart:p.cart.some(c => c.productId === id) ? p.cart.map(c => c.productId === id ? { ...c, qty:c.qty + qty } : c) : [...p.cart, { productId:id, qty }] })); notify('Added to cart') },
    removeFromCart: id => setS(p => ({ ...p, cart:p.cart.filter(c => c.productId !== id) })),
    placeOrder: () => {
      if (!s.cart.length) return
      for (const c of s.cart) { const pr = s.products.find(x => x.id === c.productId); if (!pr || pr.stock < c.qty) { notify('{name} no longer has enough stock', { name:pr?.name ?? 'Item' }); return } }
      setS(p => { const lines = p.cart.map(c => { const pr = p.products.find(x => x.id === c.productId)!; return { productId:pr.id, name:pr.name, qty:c.qty, price:pr.price } })
        const o: Order = { id:`O-${1001 + p.orders.length}`, buyer:p.user?.org ?? 'Demo Organization', lines, total:lines.reduce((a, l) => a + l.qty * l.price, 0), date:new Date().toISOString().slice(0,10), status:'pending' }
        return { ...p, orders:[o, ...p.orders], cart:[], products:p.products.map(x => { const c = p.cart.find(k => k.productId === x.id); return c ? { ...x, stock:x.stock - c.qty } : x }),
          activity:[{ id:`A${Date.now()}`, text:`Order ${o.id} created (prototype)`, time:'just now', link:'/app/orders' }, ...p.activity] } })
      notify('Prototype order created. No payment taken.') },
    setOrderStatus: (id, st) => setS(p => { const o = p.orders.find(x => x.id === id); if (!o) return p
      const restock = st === 'cancelled' && o.status !== 'cancelled'
      return { ...p, orders:p.orders.map(x => x.id === id ? { ...x, status:st } : x), products:restock ? p.products.map(x => { const l = o.lines.find(k => k.productId === x.id); return l ? { ...x, stock:x.stock + l.qty } : x }) : p.products } }),
    addProduct: pr => setS(p => ({ ...p, products:[{ ...pr, id:`P-${p.products.length + 1}`, desc:'Seller-added listing (prototype).', traceable:false, region:'—', hue:Math.floor(Math.random() * 360) }, ...p.products] })),
    updateUser: u => setS(p => p.user ? { ...p, user:{ ...p.user, ...u } } : p),
    setPrefs: x => setS(p => ({ ...p, prefs:{ ...p.prefs, ...x } })),
    markRead: id => setS(p => ({ ...p, notifs:p.notifs.map(n => n.id === id ? { ...n, read:true } : n) })),
    requestPickup: x => setS(p => ({ ...p,
      pickups:[{ ...x, id:`PK-${2001 + p.pickups.length}`, requester:p.user?.org ?? 'Demo Organization', date:new Date().toISOString().slice(0,10), status:'requested' }, ...p.pickups],
      activity:[{ id:`A${Date.now()}`, text:`Food waste pickup requested: ${x.qty} kg`, time:'just now', link:'/app/dashboard' }, ...p.activity] })),
    markAllRead: () => setS(p => ({ ...p, notifs:p.notifs.map(n => ({ ...n, read:true })) })),
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
