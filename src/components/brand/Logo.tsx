import { useId } from 'react'
import { MARK, WORD, TAG, GRADS, BOX, type LogoPath } from './brandPaths'
import './Logo.css'

export type LogoVariant = 'mark' | 'wordmark' | 'lockup' | 'full'
/** `color` untuk latar terang, `light` untuk latar gelap (sidebar, panel auth). */
export type LogoTone = 'color' | 'light'

type Box = readonly [number, number, number, number]
const PAD = 8
const union = (...b: Box[]): Box => [Math.min(...b.map(x => x[0])), Math.min(...b.map(x => x[1])), Math.max(...b.map(x => x[2])), Math.max(...b.map(x => x[3]))]
const view = (b: Box) => ({ vb: `${b[0] - PAD} ${b[1] - PAD} ${b[2] - b[0] + 2 * PAD} ${b[3] - b[1] + 2 * PAD}`, ratio: (b[2] - b[0] + 2 * PAD) / (b[3] - b[1] + 2 * PAD) })
const VIEW: Record<LogoVariant, { vb: string; ratio: number }> = {
  mark: view(BOX.mark), wordmark: view(BOX.word),
  lockup: view(union(BOX.mark, BOX.word)), full: view(union(BOX.mark, BOX.word, BOX.tag)),
}

// Versi latar gelap: huruf gelap jadi putih, hijau tua dicerahkan.
const rgb = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
const lum = (c: string) => { const [r, g, b] = rgb(c); return (.2126 * r + .7152 * g + .0722 * b) / 255 }
const mix = (c: string, o: string, a: number) => { const x = rgb(c), y = rgb(o); return '#' + x.map((v, i) => Math.round(v * (1 - a) + y[i] * a).toString(16).padStart(2, '0')).join('') }
const LIME = '#b6f06a'
const fillFor = (c: string, tone: LogoTone, word: boolean) => tone === 'color' ? c : word && lum(c) < .4 ? '#ffffff' : lum(c) < .35 ? mix(c, LIME, .6) : c
const stopFor = (c: string, tone: LogoTone) => tone === 'color' || lum(c) > .5 ? c : mix(c, LIME, .6)

function Paths({ list, id, tone, word = false }: { list: LogoPath[]; id: string; tone: LogoTone; word?: boolean }) {
  return <>{list.map((p, i) => <path key={i} d={p.d} fillRule="evenodd" fill={p.g !== undefined ? `url(#${id}${p.g})` : fillFor(p.f ?? '#000', tone, word)} />)}</>
}

/**
 * Logo SIRKULA: hasil trace langsung dari gambar logo asli ke vektor (SVG inline, tajam di ukuran berapa pun).
 *  - mark: lingkaran daur ulang + tunas, untuk ruang kecil.
 *  - wordmark: tulisan SIRKULA dengan daun di huruf U.
 *  - lockup: mark + wordmark sejajar (header, sidebar, auth).
 *  - full: lockup + tagline + lengkung hijau (hero, kartu, 404).
 * Ukuran diatur lewat `height` (atau `width`); proporsi dijaga otomatis.
 */
export default function Logo({ variant = 'lockup', tone = 'color', height, width, className = '', title = 'SIRKULA' }: {
  variant?: LogoVariant; tone?: LogoTone; height?: number | string; width?: number | string; className?: string; title?: string
}) {
  const id = 'lg' + useId().replace(/[^a-zA-Z0-9]/g, '') + '_'
  const v = VIEW[variant]
  const style = height === undefined && width === undefined ? undefined : { height, width: width ?? (typeof height === 'number' ? Math.round(height * v.ratio) : undefined) }
  const showMark = variant !== 'wordmark', showWord = variant !== 'mark', showTag = variant === 'full'
  return (
    <svg className={`logo logo--${variant} ${className}`.trim()} viewBox={v.vb} style={style} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <title>{title}</title>
      {showMark && <defs>{GRADS.map((g, i) => (
        <linearGradient key={i} id={`${id}${i}`} gradientUnits="userSpaceOnUse" x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>
          <stop offset="0" stopColor={stopFor(g.c1, tone)} /><stop offset="1" stopColor={stopFor(g.c2, tone)} />
        </linearGradient>))}</defs>}
      {showMark && <Paths list={MARK} id={id} tone={tone} />}
      {showWord && <Paths list={WORD} id={id} tone={tone} word />}
      {showTag && <Paths list={TAG} id={id} tone={tone} />}
    </svg>
  )
}

export const LogoMark = (p: Omit<Parameters<typeof Logo>[0], 'variant'>) => <Logo {...p} variant="mark" />
export const LogoWordmark = (p: Omit<Parameters<typeof Logo>[0], 'variant'>) => <Logo {...p} variant="wordmark" />
