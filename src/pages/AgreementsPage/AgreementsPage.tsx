import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, FileSignature, Hourglass, BadgeCheck, TriangleAlert, CalendarRange, Layers, Send, Undo2, Ban } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import FormalCheck from '../../components/ui/FormalCheck'
import Avatar from '../../components/ui/Avatar'
import './AgreementsPage.css'

type Action = 'approve' | 'revise' | 'reject' | 'resubmit'
const FILTERS = ['', 'pending', 'active', 'revision', 'rejected'] as const
const SEG = ['#0f6b47', '#c5f26b', '#2d9d78', '#7aa88f', '#b4cdbd', '#0b2a1f']

/** Agreements: review, approve and track shared-collection agreements. Prototype records only (not legal contracts). */
export default function AgreementsPage({ embedded = false }: { embedded?: boolean }) {
  const { agreements, agreementAction, setShare, notify } = useStore(); const { t } = useT()
  const [params] = useSearchParams()
  const [q, setQ] = useState(''), [st, setSt] = useState<string>(''), [note, setNote] = useState(''), [party, setParty] = useState('')
  const [id, setId] = useState(agreements.find(x => x.id === params.get('id'))?.id ?? agreements[0]?.id ?? '')
  const rows = useMemo(() => agreements.filter(a => (!q || (a.title + a.community).toLowerCase().includes(q.toLowerCase())) && (!st || a.status === st)), [agreements, q, st])
  const a = agreements.find(x => x.id === id)
  const approved = (x: typeof a) => x ? x.required.filter(r => x.approvedBy.some(b => b.party === r && b.version === x.version)) : []
  const count = (s: string) => s ? agreements.filter(x => x.status === s).length : agreements.length
  const act = (k: Action) => {
    if (!a) return
    if (k === 'approve' && !party) return notify('Choose a party to approve as')
    agreementAction(a.id, k, note, party); setNote(''); setParty('')
    notify('Agreement {k} recorded (prototype)', { k: t(k) })
  }
  const pick = (x: string) => {
    setId(x); setParty(''); setNote('')
    if (window.matchMedia('(max-width: 960px)').matches) requestAnimationFrame(() => document.getElementById('agr-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const total = a?.shares.reduce((s, x) => s + x.share, 0) ?? 0
  const done = approved(a)
  const kpis = [
    { Icon: FileSignature, label: 'All agreements', v: count('') },
    { Icon: BadgeCheck, label: 'Active', v: count('active') },
    { Icon: Hourglass, label: 'Awaiting approval', v: count('pending') },
    { Icon: TriangleAlert, label: 'Needs attention', v: count('revision') + count('rejected') },
  ]

  return (
    <div className={`agr${embedded ? ' agr--in' : ''}`}>
      {embedded ? (
        <p className="agr__note agr__note--in"><TriangleAlert size={16} aria-hidden="true" />{t('Prototype records only. They are not legally enforceable contracts.')}</p>
      ) : (
        <header className="agr__hero">
          <div>
            <span className="agr__eyebrow">{t('Agreements')}</span>
            <h1>{t('Shared agreements')}</h1>
            <p>{t('Review who has approved, how costs are split and what changed.')}</p>
          </div>
          <p className="agr__note"><TriangleAlert size={16} aria-hidden="true" />{t('Prototype records only. They are not legally enforceable contracts.')}</p>
        </header>
      )}

      <section className="agr__kpis" aria-label={t('Summary')}>
        {kpis.map(({ Icon, label, v }) => (
          <div key={label} className="agr__kpi"><span className="agr__kpiIcon"><Icon size={18} aria-hidden="true" /></span><div><b>{v}</b><small>{t(label)}</small></div></div>
        ))}
      </section>

      <div className="agr__tools">
        <label className="agr__search"><Search size={16} aria-hidden="true" />
          <input placeholder={t('Search agreements')} aria-label={t('Search agreements')} value={q} onChange={e => setQ(e.target.value)} /></label>
        <div className="agr__pills" role="group" aria-label={t('Status')}>
          {FILTERS.map(f => (
            <button key={f || 'all'} type="button" className={`agr__pill${st === f ? ' on' : ''}`} aria-pressed={st === f} onClick={() => setSt(f)}>
              {f ? t(f) : t('All')}<i>{count(f)}</i>
            </button>
          ))}
        </div>
      </div>

      <div className="agr__cols">
        <aside className="agr__list" aria-label={t('Agreements')}>
          {rows.length === 0 ? <p className="agr__empty">{t('No agreements match.')}</p> : rows.map(x => {
            const n = approved(x).length, pct = x.required.length ? n / x.required.length * 100 : 0
            return (
              <button key={x.id} type="button" className={`agr__item${x.id === id ? ' on' : ''}`} aria-pressed={x.id === id} onClick={() => pick(x.id)}>
                <span className="agr__itemTop"><StatusBadge status={x.status} /><span className="agr__ver">v{x.version}</span></span>
                <b>{t(x.title)}</b>
                <span className="agr__com"><Avatar name={x.community} size={20} square />{x.community}</span>
                <span className="agr__prog"><span className="agr__track"><i style={{ width: `${pct}%` }} /></span><em>{n}/{x.required.length} {t('approved')}</em></span>
              </button>
            )
          })}
        </aside>

        {a ? (
          <article className="agr__detail" id="agr-detail" key={a.id}>
            <header className="agr__dhead">
              <div className="agr__dtitle"><StatusBadge status={a.status} /><h2>{t(a.title)}</h2></div>
              <ul className="agr__meta">
                <li><Avatar name={a.community} size={22} square />{a.community}</li>
                <li><Layers size={15} aria-hidden="true" />{t('Version')} {a.version}</li>
                <li><CalendarRange size={15} aria-hidden="true" />{t('effective')} {a.effective}</li>
              </ul>
              {a.note && <p className="agr__anote">{a.note}</p>}
            </header>

            <section className="agr__sec">
              <div className="agr__secHead"><h3>{t('Approvals for v{v} ({d}/{n})', { v: a.version, d: done.length, n: a.required.length })}</h3>
                <span className="agr__track agr__track--lg"><i style={{ width: `${a.required.length ? done.length / a.required.length * 100 : 0}%` }} /></span></div>
              <ul className="agr__parties">
                {a.required.map(r => {
                  const ok = done.includes(r)
                  return (
                    <li key={r} className={ok ? 'ok' : ''}>
                      <FormalCheck checked={ok} label={ok ? t('Approved') : t('Awaiting approval')} />
                      <span className="agr__pname">{r}</span>
                      <span className="agr__pstate">{ok ? t('Approved v{v}', { v: a.version }) : t('Awaiting approval')}</span>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="agr__sec">
              <div className="agr__secHead"><h3>{t('Cost allocation (demo, not payments)')}</h3>
                <span className={`agr__total${total === 100 ? ' ok' : ' bad'}`}>{t('Total')} {total}%{total !== 100 && ` ${t('(should be 100%)')}`}</span></div>
              <div className="agr__split" role="img" aria-label={a.shares.map(s => `${s.party} ${s.share}%`).join(', ')}>
                {a.shares.map((s, i) => <span key={s.party} style={{ flexGrow: Math.max(s.share, 0), background: SEG[i % SEG.length] }} />)}
              </div>
              <ul className="agr__shares">
                {a.shares.map((s, i) => (
                  <li key={s.party}>
                    <i style={{ background: SEG[i % SEG.length] }} aria-hidden="true" />
                    <span>{s.party}</span>
                    <label className="agr__pct"><input type="number" min={0} max={100} aria-label={`${s.party} %`} value={s.share} onChange={e => setShare(a.id, s.party, +e.target.value)} /><b>%</b></label>
                  </li>
                ))}
              </ul>
            </section>

            <section className="agr__sec">
              <div className="agr__secHead"><h3>{t('History')}</h3></div>
              <ol className="agr__tl">
                {[...a.history].reverse().map((h, i) => <li key={i}><time>{h.date}</time><span>{t(h.text)}</span></li>)}
              </ol>
            </section>

            <footer className="agr__actions">
              {a.status === 'rejected' ? (
                <p className="agr__muted"><Ban size={15} aria-hidden="true" />{t('This agreement was rejected. No further actions are available.')}</p>
              ) : (
                <>
                  <label className="agr__noteL">{t('Review note')}
                    <textarea rows={2} placeholder={t('Add a short note for the record (optional)')} value={note} onChange={e => setNote(e.target.value)} /></label>
                  <div className="agr__btns">
                    {a.status === 'pending' && <>
                      <Select value={party} onChange={setParty} placeholder={t('Approve as…')} options={[{ value: '', label: t('Approve as…') }, ...a.required.filter(r => !done.includes(r)).map(r => ({ value: r, label: r }))]} />
                      <button type="button" className="agr__btn agr__btn--main" onClick={() => act('approve')}><Send size={15} aria-hidden="true" />{t('Approve')}</button>
                      <button type="button" className="agr__btn" onClick={() => act('revise')}><Undo2 size={15} aria-hidden="true" />{t('Request revision')}</button>
                      <button type="button" className="agr__btn agr__btn--danger" onClick={() => act('reject')}>{t('Reject')}</button>
                    </>}
                    {(a.status === 'revision' || a.status === 'active') && <button type="button" className="agr__btn agr__btn--main" onClick={() => act('resubmit')}>{t('Submit new version (resets approvals)')}</button>}
                  </div>
                </>
              )}
            </footer>
          </article>
        ) : <div className="agr__detail agr__detail--empty">{t('Select an agreement to see its details.')}</div>}
      </div>
    </div>
  )
}
