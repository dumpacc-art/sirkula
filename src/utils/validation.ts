/**
 * Reusable validators. Each returns an English source string (translated at render with t()) or undefined when valid.
 * The strings match keys in src/i18n/id.ts.
 */
export type Result = string | undefined

export const validateRequired = (v: string, message = 'This field is required'): Result => (v.trim() ? undefined : message)

export function validateEmail(v: string): Result {
  if (!v) return 'Email is required'
  return /^\S+@\S+\.\S+$/.test(v) ? undefined : 'Enter a valid email'
}

export function validatePassword(v: string, min = 6): Result {
  if (!v) return 'Password is required'
  return v.length >= min ? undefined : `At least ${min} characters`
}

/** Indonesian phone numbers: 08xx..., +628xx... or 628xx..., 9-13 digits after the leading 8. Spaces and dashes are ignored. */
export function validateIndonesianPhone(v: string): Result {
  const d = v.replace(/[\s-]/g, '')
  return /^(\+62|62|0)8\d{8,12}$/.test(d) ? undefined : 'Enter a valid Indonesian phone number'
}

export function validatePositiveNumber(v: string | number, message = 'Enter a number greater than 0'): Result {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) && n > 0 ? undefined : message
}
