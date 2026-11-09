import type { AccountType, User } from '../types'

/** The only two account types offered to the public. There are no roles: every account can do everything. */
export const PUBLIC_ACCOUNT_TYPES: readonly AccountType[] = ['personal', 'company']

export const ACCOUNT_TYPES: Record<AccountType, { label: string; desc: string; features: string[] }> = {
  personal: {
    label: 'Personal',
    desc: 'For individuals who want to deposit waste, track collections, and access the community and marketplace.',
    features: ['Deposit waste and request pickups', 'Track collections and batch status', 'Access community and marketplace'],
  },
  company: {
    label: 'Company',
    desc: 'For businesses that need legal verification, branch management, and analytics reports.',
    features: ['Legal verification (NIB / NPWP)', 'Branch management', 'Analytics and reports'],
  },
}

export interface SessionInput { fullName: string; email: string; phone?: string; companyName?: string; legalId?: string; branchCount?: number }

/** Builds the session user saved in the store (persisted to localStorage). Companies start as pending verification. */
export function buildUser(type: AccountType, p: SessionInput): User {
  const isCompany = type === 'company'
  return {
    name: p.fullName,
    email: p.email,
    org: isCompany ? (p.companyName ?? '') : p.fullName,
    accountType: type,
    profile: {
      fullName: p.fullName,
      phone: p.phone,
      companyName: isCompany ? p.companyName : undefined,
      legalId: isCompany ? p.legalId : undefined,
      branchCount: isCompany ? p.branchCount : undefined,
      verification: isCompany ? 'pending' : 'not_required',
    },
  }
}
