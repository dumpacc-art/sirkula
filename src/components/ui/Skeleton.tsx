import type { CSSProperties } from 'react'
import { useT } from '../../i18n'
import './Skeleton.css'

/** One placeholder shape. `live` runs the shimmer (an action is in progress); otherwise it stays still. */
export function Skeleton({ w = '100%', h = 14, circle = false, pill = false, live = true, style }: {
  w?: number | string; h?: number | string; circle?: boolean; pill?: boolean; live?: boolean; style?: CSSProperties
}) {
  return <span aria-hidden="true" className={`sk${circle ? ' sk--circle' : ''}${pill ? ' sk--pill' : ''}${live ? ' is-live' : ''}`}
    style={{ width: w, height: h, ...style }} />
}

/** Card-shaped placeholder: avatar + title, a few text lines, an optional stat grid and an action bar. */
export function SkeletonCard({ live = true, lines = 3, stats = false, action = true, hint, label }: {
  live?: boolean; lines?: number; stats?: boolean; action?: boolean; hint?: string; label?: string
}) {
  const { t } = useT()
  return (
    <div className="sk-card" role={live ? 'status' : undefined} aria-busy={live || undefined} aria-label={live ? (label ?? t('Loading…')) : undefined}>
      <div className="sk-card__row">
        <Skeleton w={40} h={40} live={live} style={{ borderRadius: 10, flexShrink: 0 }} />
        <div className="sk-card__col"><Skeleton w="62%" h={14} live={live} /><Skeleton w="38%" h={10} live={live} /></div>
        <Skeleton w={64} h={22} pill live={live} />
      </div>
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} w={i === lines - 1 ? '70%' : '100%'} h={11} live={live} />)}
      {stats && <div className="sk-card__grid"><Skeleton h={46} live={live} /><Skeleton h={46} live={live} /></div>}
      {action && <Skeleton h={38} live={live} />}
      {hint && <p className="sk-hint">{hint}</p>}
    </div>
  )
}

/** Table-shaped placeholder for lists that reload after a filter or search. */
export function SkeletonTable({ rows = 6, cols = 6, live = true }: { rows?: number; cols?: number; live?: boolean }) {
  const { t } = useT()
  const grid = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }
  return (
    <div className="sk-table" role="status" aria-busy={live} aria-label={t('Loading…')}>
      {Array.from({ length: rows + 1 }, (_, r) => (
        <div key={r} className="sk-table__row" style={grid}>
          {Array.from({ length: cols }, (_, c) => <Skeleton key={c} h={r === 0 ? 10 : 13} w={r === 0 ? '55%' : c === 0 ? '60%' : '85%'} live={live} />)}
        </div>
      ))}
    </div>
  )
}

export { PageSkeleton, type PageSkeletonKind } from './PageSkeletons'
