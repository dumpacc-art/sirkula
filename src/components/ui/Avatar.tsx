import './Avatar.css'

const hueOf = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h }
const initials = (s: string) => s.replace(/^(PT|CV)\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

/** Round initials badge with a stable colour per name. Decorative: the name is always shown next to it. */
export default function Avatar({ name, size = 36, square = false }: { name: string; size?: number; square?: boolean }) {
  const h = hueOf(name)
  return (
    <span className={`av${square ? ' av--sq' : ''}`} aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * .38, background: `hsl(${h} 42% 90%)`, color: `hsl(${h} 55% 22%)` }}>{initials(name)}</span>
  )
}
