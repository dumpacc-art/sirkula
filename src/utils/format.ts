/** Locale-aware formatting helpers. `lang` is the app language value from prefs ('English' | 'Bahasa Indonesia'). */
const loc = (lang: string) => (lang === 'Bahasa Indonesia' ? 'id-ID' : 'en-GB')

export const formatNumber = (n: number, lang = 'English', maxFraction = 1) =>
  new Intl.NumberFormat(loc(lang), { maximumFractionDigits: maxFraction }).format(n)

/** Amount in the given ISO 4217 currency. Rupiah has no minor unit in practice, so IDR shows 0 decimals. */
export const formatCurrency = (amount: number, currency = 'IDR', lang = 'English') =>
  new Intl.NumberFormat(loc(lang), { style: 'currency', currency, maximumFractionDigits: currency === 'IDR' ? 0 : 2 }).format(amount)

export const formatKg = (kg: number, lang = 'English') => `${formatNumber(kg, lang, 1)} kg`

export const formatKm = (km: number, lang = 'English') => `${formatNumber(km, lang, 1)} km`

/** Accepts 'YYYY-MM-DD' or any ISO string. Returns the input unchanged if it is not a valid date. */
export function formatDate(iso: string, lang = 'English'): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat(loc(lang), { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}
