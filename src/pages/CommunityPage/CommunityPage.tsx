import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Search, X, MapPin, Users, Lightbulb, FileSignature, MessageSquare, Scale, Leaf, Send, ArrowUpRight, Sprout } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import { communities } from '../../data/demoData'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import Avatar from '../../components/ui/Avatar'
import type { Initiative } from '../../types'
import './CommunityPage.css'

const COLUMNS = [
  { key: 'proposed', title: 'Proposed', hint: 'Waiting for the first review' },
  { key: 'active', title: 'Active', hint: 'Running now' },
  { key: 'revision', title: 'Needs revision', hint: 'Returned with comments' },
] as const
const MATERIALS = ['Organic', 'Plastic', 'Glass', 'Textile', 'Paper', 'Metal', 'E-waste']

/** Communities: who is taking part, what they propose, and the discussion around each initiative. */
export default function CommunityPage({ embedded = false }: { embedded?: boolean }) {
  const { initiatives, agreements, addInitiative, addComment, notify } = useStore(); const { t } = useT()
  const [filter, setFilter] = useState(''), [q, setQ] = useState('')
  const [newOpen, setNewOpen] = useState(false), [sel, setSel] = useState<string | null>(null), [draft, setDraft] = useState('')
  const [form, setForm] = useState({ title: '', community: communities[0].name, objective: '', category: 'Plastic', qty: '' })
  const [err, setErr] = useState<{ title?: string; qty?: string }>({})

  const cur = initiatives.find(i => i.id === sel)
  const members = communities.reduce((s, c) => s + c.members, 0)
  const activeAgreements = agreements.filter(a => a.status === 'active').length
  const shown = useMemo(() => initiatives.filter(i =>
    (!filter || i.community === filter) &&
    (!q || (i.title + ' ' + i.objective + ' ' + i.category + ' ' + i.community).toLowerCase().includes(q.toLowerCase()))), [initiatives, filter, q])

  useEffect(() => {
    if (!cur) return
    const f = (e: KeyboardEvent) => e.key === 'Escape' && setSel(null)
    window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f)
  }, [cur])

  const openNew = () => { setErr({}); setForm(f => ({ ...f, community: filter || f.community })); setNewOpen(true) }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const qty = Number(form.qty), next: typeof err = {}
    if (!form.title.trim()) next.title = 'Title is required'
    if (!(qty > 0)) next.qty = 'Proposed quantity must be above 0'
    setErr(next); if (next.title || next.qty) return
    addInitiative({ title: form.title.trim(), community: form.community, objective: form.objective.trim(), category: form.category.trim() || 'Other', qty })
    setNewOpen(false); setForm({ title: '', community: form.community, objective: '', category: 'Plastic', qty: '' }); notify('Initiative added to the board')
  }
  const post = () => { if (!cur || !draft.trim()) return; addComment(cur.id, draft.trim()); setDraft('') }

  const card = (i: Initiative) => (
    <article key={i.id} className="cmn__card" tabIndex={0} role="button" aria-label={t(i.title)} onClick={() => { setSel(i.id); setDraft('') }}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel(i.id), setDraft(''))}>
      <header><span className="cmn__tag"><Leaf size={12} aria-hidden="true" />{t(i.category)}</span>
        <span className="cmn__cnt"><MessageSquare size={13} aria-hidden="true" />{i.comments.length}</span></header>
      <h4>{t(i.title)}</h4>
      {i.objective && <p>{t(i.objective)}</p>}
      <footer><span className="cmn__by"><Avatar name={i.community} size={22} square />{i.community}</span>
        <b><Scale size={13} aria-hidden="true" />{i.qty.toLocaleString('id-ID')} kg</b></footer>
    </article>
  )

  return (
    <div className={`cmn${embedded ? ' cmn--in' : ''}`}>
      {/* hero */}
      {!embedded && (
      <header className="cmn__hero">
        <div className="cmn__heroTxt">
          <span className="cmn__eyebrow"><Sprout size={14} aria-hidden="true" />{t('Communities')}</span>
          <h1>{t('Neighbours who recycle together')}</h1>
          <p>{t('Demonstration communities from different provinces. Each community defines its own approval rules; nothing here is a legal or cultural default.')}</p>
          <button type="button" className="cmn__cta" onClick={openNew}><Plus size={17} aria-hidden="true" />{t('New initiative')}</button>
        </div>
        <dl className="cmn__stats">
          <div><dt><Users size={15} aria-hidden="true" />{t('members')}</dt><dd>{members.toLocaleString('id-ID')}</dd></div>
          <div><dt><MapPin size={15} aria-hidden="true" />{t('Communities')}</dt><dd>{communities.length}</dd></div>
          <div><dt><Lightbulb size={15} aria-hidden="true" />{t('Initiatives')}</dt><dd>{initiatives.length}</dd></div>
          <div><dt><FileSignature size={15} aria-hidden="true" />{t('Active agreements')}</dt><dd>{activeAgreements}</dd></div>
        </dl>
      </header>
      )}

      {embedded && (
        <header className="cmn__bar">
          <div><h2>{t('Neighbours who recycle together')}</h2>
            <p>{members.toLocaleString('id-ID')} {t('members')} · {communities.length} {t('Communities')} · {initiatives.length} {t('Initiatives')} · {activeAgreements} {t('Active agreements')}</p></div>
          <button type="button" className="cmn__cta cmn__cta--dark" onClick={openNew}><Plus size={17} aria-hidden="true" />{t('New initiative')}</button>
        </header>
      )}

      {/* directory */}
      <section aria-label={t('Communities')}>
        <div className="cmn__secHead"><h2>{t('Community directory')}</h2>
          {filter && <button type="button" className="cmn__clear" onClick={() => setFilter('')}><X size={14} aria-hidden="true" />{t('Show all communities')}</button>}</div>
        <div className="cmn__dir">
          {communities.map(m => {
            const n = initiatives.filter(i => i.community === m.name).length, a = agreements.filter(x => x.community === m.name && x.status === 'active').length
            return (
              <button key={m.name} type="button" className={`cmn__com${filter === m.name ? ' on' : ''}`} aria-pressed={filter === m.name} onClick={() => setFilter(f => f === m.name ? '' : m.name)}>
                <Avatar name={m.name} size={48} square />
                <span className="cmn__comTxt"><b>{m.name}</b><small><MapPin size={12} aria-hidden="true" />{t(m.region)} · {m.members} {t('members')}</small></span>
                <span className="cmn__comNums"><span><b>{n}</b>{t('Initiatives')}</span><span><b>{a}</b>{t('Active agreements')}</span></span>
              </button>
            )
          })}
        </div>
      </section>

      {/* board */}
      <section aria-label={t('Initiative board')}>
        <div className="cmn__secHead">
          <h2>{t('Initiative board')}</h2>
          <label className="cmn__search"><Search size={16} aria-hidden="true" />
            <input placeholder={t('Search initiatives')} aria-label={t('Search initiatives')} value={q} onChange={e => setQ(e.target.value)} /></label>
        </div>
        {shown.length === 0 ? (
          <div className="cmn__none"><Lightbulb size={22} aria-hidden="true" /><b>{t('No initiatives found')}</b><p>{t('Try another community or search, or start a new initiative.')}</p>
            <button type="button" className="cmn__ghost" onClick={openNew}><Plus size={15} aria-hidden="true" />{t('New initiative')}</button></div>
        ) : (
          <div className="cmn__board">
            {COLUMNS.map(c => {
              const list = shown.filter(i => i.status === c.key)
              return (
                <div key={c.key} className={`cmn__col cmn__col--${c.key}`}>
                  <header><span><i aria-hidden="true" /><b>{t(c.title)}</b></span><em>{list.length}</em></header>
                  <small>{t(c.hint)}</small>
                  <div className="cmn__stack">
                    {list.length === 0 ? <p className="cmn__ph">{t('Nothing here yet')}</p> : list.map(card)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* new initiative */}
      <Modal open={newOpen} title={t('New initiative')} onClose={() => setNewOpen(false)}>
        <form className="cmn__form" onSubmit={submit} noValidate>
          <label>{t('Title')}<input value={form.title} aria-invalid={!!err.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={t('e.g. Shared plastic collection route')} />
            {err.title && <em>{t(err.title)}</em>}</label>
          <label>{t('Community')}<Select value={form.community} onChange={v => setForm({ ...form, community: v })} options={communities.map(m => m.name)} /></label>
          <div className="cmn__row">
            <label>{t('Target material')}<input list="cmn-materials" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></label>
            <label>{t('Proposed quantity (kg)')}<input type="number" min={0} inputMode="decimal" value={form.qty} aria-invalid={!!err.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
              {err.qty && <em>{t(err.qty)}</em>}</label>
          </div>
          <datalist id="cmn-materials">{MATERIALS.map(m => <option key={m} value={m} />)}</datalist>
          <label>{t('Objective')}<textarea rows={3} value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} placeholder={t('What should this initiative achieve?')} /></label>
          <div className="cmn__formAct"><button type="button" className="cmn__ghost" onClick={() => setNewOpen(false)}>{t('Cancel')}</button><button type="submit" className="cmn__cta cmn__cta--dark">{t('Create')}</button></div>
        </form>
      </Modal>

      {/* initiative drawer */}
      <AnimatePresence>
        {cur && (
          <motion.div className="cmn__veil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)}>
            <motion.aside className="cmn__drawer" role="dialog" aria-modal="true" aria-label={t(cur.title)}
              initial={{ x: 48, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 32, opacity: 0 }} transition={{ duration: .25, ease: [.22, 1, .36, 1] }} onClick={e => e.stopPropagation()}>
              <header className="cmn__dHead">
                <div><StatusBadge status={cur.status} /><h3>{t(cur.title)}</h3>
                  <span className="cmn__by"><Avatar name={cur.community} size={22} square />{cur.community}</span></div>
                <button type="button" onClick={() => setSel(null)} aria-label={t('Close')}><X size={18} /></button>
              </header>
              <div className="cmn__dBody">
                <dl className="cmn__facts">
                  <div><dt>{t('Target material')}</dt><dd>{t(cur.category)}</dd></div>
                  <div><dt>{t('Proposed quantity (kg)')}</dt><dd>{cur.qty.toLocaleString('id-ID')}</dd></div>
                  <div><dt>{t('Discussion')}</dt><dd>{cur.comments.length}</dd></div>
                </dl>
                <section><h4>{t('Objective')}</h4><p className="cmn__obj">{cur.objective ? t(cur.objective) : t('No objective written.')}</p></section>
                {agreements.some(a => a.community === cur.community) && (
                  <section><h4>{t('Related agreements')}</h4>
                    <ul className="cmn__links">{agreements.filter(a => a.community === cur.community).map(a => (
                      <li key={a.id}><Link to={`/app/partners?tab=agreements&id=${a.id}`}><span>{t(a.title)}</span><StatusBadge status={a.status} /><ArrowUpRight size={15} aria-hidden="true" /></Link></li>))}</ul></section>
                )}
                <section><h4>{t('Discussion')}</h4>
                  {cur.comments.length === 0 ? <p className="cmn__muted">{t('No comments yet.')}</p> : (
                    <ul className="cmn__thread">{cur.comments.map((x, k) => (
                      <li key={k}><Avatar name={x.by} size={34} /><div><p><b>{x.by}</b><time>{x.date}</time></p><div className="cmn__bubble">{t(x.text)}</div></div></li>))}</ul>
                  )}
                </section>
              </div>
              <footer className="cmn__composer">
                <textarea rows={2} placeholder={t('Add a comment or suggest a change')} aria-label={t('Add a comment or suggest a change')} value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) post() }} />
                <button type="button" className="cmn__cta cmn__cta--dark" disabled={!draft.trim()} onClick={post}><Send size={15} aria-hidden="true" />{t('Post comment')}</button>
              </footer>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
