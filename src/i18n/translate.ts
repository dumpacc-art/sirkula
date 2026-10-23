import { id } from './id'

export type Lang = 'English' | 'Bahasa Indonesia'

const esc = (s: string) => s.replace(/[.*+?^$()|[\]\\]/g, '\\$&')
// Template entries such as "Batch {id} registered" become regexes so stored dynamic text also translates.
const has = (k: string) => Object.prototype.hasOwnProperty.call(id, k)
const patterns = Object.entries(id).filter(([k]) => k.includes('{')).sort((a, b) => b[0].length - a[0].length).map(([k, v]) => {
  const names: string[] = []
  const src = esc(k).replace(/\{(\w+)\}/g, (_, n) => { names.push(n); return '(.+?)' })
  return { re: new RegExp(`^${src}$`), names, v }
})

/** Translate an English source string. Falls back to the original text when no translation exists. */
export function translate(lang: string, text: string, vars?: Record<string, string | number>): string {
  let out = text
  if (lang === 'Bahasa Indonesia') {
    if (has(text)) out = id[text]
    else for (const p of patterns) {
      const m = text.match(p.re)
      if (m) { out = p.v.replace(/\{(\w+)\}/g, (_, n) => { const i = p.names.indexOf(n); return i >= 0 ? translate(lang, m[i + 1]) : '' }); break }
    }
  }
  if (vars) for (const k in vars) out = out.split(`{${k}}`).join(String(vars[k]))
  return out
}

