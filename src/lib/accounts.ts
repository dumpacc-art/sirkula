/**
 * Prototype account store (localStorage). NOT real security: a backend must own accounts and passwords.
 * Sign up saves an account here; Login checks it. The password is hashed only so it is not kept as plain text.
 */
import type { User } from '../types'
import { buildUser } from '../config/accountTypes'

const KEY = 'sirkula-accounts-v1'
export interface Account { email: string; fullName: string; phone: string; pwHash: string; createdAt: string }

const read = (): Account[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') as Account[] } catch { return [] } }
const write = (a: Account[]) => { try { localStorage.setItem(KEY, JSON.stringify(a)) } catch { /* storage unavailable */ } }
const norm = (e: string) => e.trim().toLowerCase()

/** Small deterministic hash (prototype only). */
export const hashPw = (pw: string): string => { let h = 5381; const s = `sirkula::${pw}`; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36) }

export const emailTaken = (email: string) => read().some(a => a.email === norm(email))

export function signUp(p: { fullName: string; email: string; phone: string; pw: string }): { ok: true; user: User } | { ok: false; error: 'email_taken' } {
  if (emailTaken(p.email)) return { ok: false, error: 'email_taken' }
  const acc: Account = { email: norm(p.email), fullName: p.fullName.trim(), phone: p.phone.trim(), pwHash: hashPw(p.pw), createdAt: new Date().toISOString() }
  write([...read(), acc])
  return { ok: true, user: toUser(acc) }
}

export function signIn(email: string, pw: string): { ok: true; user: User } | { ok: false; error: 'no_account' | 'wrong_password' } {
  const acc = read().find(a => a.email === norm(email))
  if (!acc) return { ok: false, error: 'no_account' }
  if (acc.pwHash !== hashPw(pw)) return { ok: false, error: 'wrong_password' }
  return { ok: true, user: toUser(acc) }
}

export const demoUser = (): User => buildUser('personal', { fullName: 'Pengguna Demo', email: 'demo@sirkula.example' })
const toUser = (a: Account): User => buildUser('personal', { fullName: a.fullName, email: a.email, phone: a.phone })
