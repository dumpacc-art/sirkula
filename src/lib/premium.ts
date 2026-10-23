import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'

export type PlanId = 'free' | 'trial' | 'monthly' | 'yearly'
export interface Sub { plan: PlanId; status: 'none' | 'active' | 'canceled' | 'expired'; startDate: string | null; endDate: string | null; autoRenew: boolean; trialUsed: boolean }
export const PLANS = {
  trial:   { name: 'Free Trial',      price: 0,       renew: false },
  monthly: { name: 'Premium Bulanan', price: 149000,  renew: true },
  yearly:  { name: 'Premium Tahunan', price: 1400000, renew: true },
} as const
export const YEARLY_PER_MONTH = Math.round(1400000 / 12) // 116.667
export const MARKETPLACE = { free: { listing: 10000, txPct: 5 }, premium: { listing: 2500, txPct: 1.25 } }
export const marketplaceFees = (premium: boolean) => (premium ? MARKETPLACE.premium : MARKETPLACE.free)

const EVT = 'sirkula-premium'
const key = (uid: string) => `sirkula:sub:${uid}`
const EMPTY: Sub = { plan: 'free', status: 'none', startDate: null, endDate: null, autoRenew: false, trialUsed: false }
const save = (uid: string, s: Sub) => { try { localStorage.setItem(key(uid), JSON.stringify(s)) } catch {} window.dispatchEvent(new Event(EVT)) }

/** Baca status; jika sudah lewat endDate, otomatis kembali ke Free. */
export function getSub(uid: string, now = new Date()): Sub {
  let s = EMPTY
  try { s = { ...EMPTY, ...JSON.parse(localStorage.getItem(key(uid)) || '{}') } } catch {}
  if (s.plan !== 'free' && s.endDate && new Date(s.endDate) <= now) {
    s = { ...s, plan: 'free', status: 'expired', autoRenew: false }
    save(uid, s)
  }
  return s
}
const addTo = (d: Date, plan: Exclude<PlanId, 'free'>) => {
  const e = new Date(d)
  if (plan === 'trial') e.setDate(e.getDate() + 3)
  else if (plan === 'monthly') e.setMonth(e.getMonth() + 1)
  else e.setFullYear(e.getFullYear() + 1)
  return e
}
export const canUseTrial = (s: Sub) => !s.trialUsed
/** Dipanggil HANYA dari tombol konfirmasi simulasi pembayaran DEMO. */
export function activate(uid: string, plan: Exclude<PlanId, 'free'>, now = new Date()): Sub {
  const cur = getSub(uid, now)
  if (plan === 'trial' && cur.trialUsed) throw new Error('Trial hanya dapat digunakan sekali per akun.')
  const s: Sub = { plan, status: 'active', startDate: now.toISOString(), endDate: addTo(now, plan).toISOString(), autoRenew: PLANS[plan].renew, trialUsed: cur.trialUsed || plan === 'trial' }
  save(uid, s); return s
}
/** Hentikan perpanjangan; benefit tetap aktif sampai endDate. */
export function cancel(uid: string) { const s = getSub(uid); if (s.plan !== 'free') save(uid, { ...s, status: 'canceled', autoRenew: false }) }
export const isPremium = (s: Sub) => s.plan !== 'free' && s.status !== 'expired' && !!s.endDate && new Date(s.endDate) > new Date()
export const daysLeft = (s: Sub) => (s.endDate ? Math.max(0, Math.ceil((+new Date(s.endDate) - Date.now()) / 864e5)) : 0)

// Sesuaikan dua fungsi ini dengan bentuk `user` di StoreContext kamu.
export function useAccountId(): string { const { user } = useStore(); return String((user as any)?.id ?? (user as any)?.email ?? 'guest') }
export const useAccountType = (): 'personal' | 'company' => { const { user } = useStore(); return (user as any)?.accountType === 'company' ? 'company' : 'personal' }

/** Satu sumber status untuk seluruh website (pickup, marketplace, dll). */
export function usePremium() {
  const uid = useAccountId(); const [tick, setTick] = useState(0)
  useEffect(() => {
    const f = () => setTick(t => t + 1); const i = setInterval(f, 60000)
    window.addEventListener(EVT, f); window.addEventListener('storage', f)
    return () => { clearInterval(i); window.removeEventListener(EVT, f); window.removeEventListener('storage', f) }
  }, [])
  const sub = useMemo(() => getSub(uid), [uid, tick])
  const premium = isPremium(sub)
  return { uid, sub, premium, fees: marketplaceFees(premium) }
}
