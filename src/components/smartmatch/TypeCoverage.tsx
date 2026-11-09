import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { useT } from '../../i18n'
import { Skeleton } from '../ui/Skeleton'
import { findSub, type Lang } from '../../config/wasteTaxonomy'
import { useStore } from '../../store/StoreContext'
import type { PartnerEvaluation } from '../../features/smart-match/rules'
import './TypeCoverage.css'

/**
 * Shows, for each waste type in the order, how many partners accept it and how many can serve this pickup point
 * (inside their coverage radius and with enough quota). Mixed orders also need ONE partner that accepts every type.
 */
export default function TypeCoverage({ types, evals, loading }: { types: string[]; evals: PartnerEvaluation[]; loading: boolean }) {
  const { t, lang } = useT(); const { partners } = useStore(); const L: Lang = lang === 'Bahasa Indonesia' ? 'id' : 'en'
  const rows = types.map(id => {
    const accepting = partners.filter(p => p.accepts.includes(id)).length
    const serving = evals.filter(e => e.partner.accepts.includes(id) && !e.issues.some(i => i.kind === 'area' || i.kind === 'quota')).length
    return { id, label: findSub(id)?.sub.label[L] ?? id, accepting, serving }
  })
  const uncovered = rows.filter(r => r.serving === 0)
  const fullMatch = evals.some(e => e.availability === 'available')
  const tone = uncovered.length ? 'bad' : fullMatch ? 'ok' : 'warn'

  return (
    <section className={`tc tc--${loading ? 'load' : tone}`} aria-labelledby="tc-title" aria-busy={loading}>
      <header className="tc__head">
        <h2 id="tc-title">{t('Coverage for your waste types')}</h2>
        {loading ? <Skeleton w={190} h={22} pill /> : (
          <span className={`tc__pill tc__pill--${tone}`} role="status">
            {tone === 'ok' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {tone === 'ok' ? t('A partner accepts every type') : tone === 'warn' ? t('No single partner accepts every type') : t('Some types have no partner nearby')}
          </span>
        )}
      </header>
      <ul className="tc__list">
        {loading ? rows.map(r => <li key={r.id}><Skeleton w="55%" h={12} /><Skeleton w={110} h={12} /></li>) : rows.map(r => (
          <li key={r.id} className={r.serving ? 'is-ok' : 'is-none'}>
            <span className="tc__name">{r.serving ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}{r.label}</span>
            <span className="tc__n">{t('{a} accept · {s} can serve this pickup', { a: r.accepting, s: r.serving })}</span>
          </li>
        ))}
      </ul>
      {!loading && tone === 'warn' && <p className="tc__note">{t('Every type has a partner, but not the same one. Split the order or remove a type to find a single partner.')}</p>}
      {!loading && tone === 'bad' && <p className="tc__note">{t('Move the pickup pin closer to a partner, or remove the types that cannot be served.')}</p>}
    </section>
  )
}
