import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Handshake, MapPinned, Building2, FileSignature, Users, ArrowRight, Send, Hourglass, BadgeCheck } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import Avatar from '../../components/ui/Avatar'
import PickupPartnerSection from '../../components/partner/PickupPartnerSection'
import AgreementsPage from '../AgreementsPage/AgreementsPage'
import CommunityPage from '../CommunityPage/CommunityPage'
import { Nearby, Network, type Proposable } from '../EcosystemMapPage/EcosystemMapPage'
import { baseParticipants } from '../../data/participants'
import { communities } from '../../data/demoData'
import { cooperationPrograms, SIRKULA_PARTY, type CooperationProgram } from '../../config/cooperation'
import './PartnersPage.css'

const TABS = [
  { key: 'nearby', label: 'Nearest partners', Icon: MapPinned },
  { key: 'programs', label: 'Apply to SIRKULA', Icon: Building2 },
  { key: 'agreements', label: 'Agreements', Icon: FileSignature },
  { key: 'communities', label: 'Communities', Icon: Users },
] as const
type Tab = typeof TABS[number]['key']
interface Target { partner: string; title: string; hint?: string; kind: 'partner' | 'program'; share: number; program?: CooperationProgram }

/** Cari Mitra: satu halaman untuk menemukan mitra terdekat, mengajukan kerja sama (ke mitra atau ke SIRKULA), memantau perjanjian dan komunitas. */
export default function PartnersPage() {
  const { agreements, initiatives, user, proposeCooperation, notify } = useStore(); const { t, lang } = useT()
  const [params, setParams] = useSearchParams(); const nav = useNavigate()
  const raw = params.get('tab') as Tab | null
  const tab: Tab = TABS.some(x => x.key === raw) ? raw! : 'nearby'
  const [view, setView] = useState<'places' | 'network'>('places')
  const [target, setTarget] = useState<Target | null>(null)
  const [title, setTitle] = useState(''), [qty, setQty] = useState(''), [note, setNote] = useState(''), [err, setErr] = useState('')

  const go = (k: Tab) => { const q = new URLSearchParams(); if (k !== 'nearby') q.set('tab', k); setParams(q, { replace: true }) }
  const me = user?.org || user?.name || ''
  const mine = agreements.filter(a => a.kind)
  const open = (x: Target) => { setTarget(x); setTitle(x.title); setQty(''); setNote(''); setErr('') }
  const proposeTo = (p: Proposable) => open({ partner: p.name, title: `${t('Cooperation with')} ${p.name}`, hint: p.address, kind: 'partner', share: 50 })
  const proposeProgram = (p: CooperationProgram) => open({ partner: SIRKULA_PARTY, title: `${t(p.title)} · ${me || t('My organisation')}`, kind: 'program', share: p.share, program: p })
  const submit = (e: FormEvent) => {
    e.preventDefault(); if (!target) return
    if (!title.trim()) return setErr('Title is required')
    const n = Number(qty); if (qty && !(n > 0)) return setErr('Estimated volume must be above 0')
    const id = proposeCooperation({ title: title.trim(), partner: target.partner, note: note.trim(), kind: target.kind, qty: qty ? n : undefined, share: target.share })
    setTarget(null); notify('Cooperation proposal sent (prototype)'); nav(`/app/partners?tab=agreements&id=${id}`)
  }

  const pending = agreements.filter(a => a.status === 'pending').length, active = agreements.filter(a => a.status === 'active').length
  const stats = [
    { Icon: MapPinned, v: baseParticipants.length + communities.length, l: 'Partners in the network' },
    { Icon: BadgeCheck, v: active, l: 'Active agreements' },
    { Icon: Hourglass, v: pending, l: 'Awaiting approval' },
    { Icon: Users, v: initiatives.length, l: 'Initiatives' },
  ]

  return (
    <div className="pt">
      <header className="pt__hero">
        <div className="pt__heroTxt">
          <span className="pt__eyebrow"><Handshake size={14} aria-hidden="true" />{t('Find Partners')}</span>
          <h1>{t('Find the nearest partner and start working together')}</h1>
          <p>{t('See partners around you, send a cooperation proposal, or apply to a SIRKULA programme. Every proposal becomes an agreement you can follow here.')}</p>
        </div>
        <dl className="pt__stats">{stats.map(({ Icon, v, l }) => <div key={l}><dt><Icon size={15} aria-hidden="true" />{t(l)}</dt><dd>{v}</dd></div>)}</dl>
      </header>

      <div className="pt__tabs" role="tablist" aria-label={t('Find Partners')}>
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'on' : ''} onClick={() => go(key)}>
            <Icon size={16} aria-hidden="true" />{t(label)}{key === 'agreements' && <i>{agreements.length}</i>}
          </button>
        ))}
      </div>

      {tab === 'nearby' && (
        <section className="pt__sec">
          <div className="pt__sub" role="group" aria-label={t('Partner source')}>
            <button type="button" aria-pressed={view === 'places'} className={view === 'places' ? 'on' : ''} onClick={() => setView('places')}>{t('Nearby facilities')}</button>
            <button type="button" aria-pressed={view === 'network'} className={view === 'network' ? 'on' : ''} onClick={() => setView('network')}>{t('Platform network (demo)')}</button>
          </div>
          <p className="pt__lead">{view === 'places'
            ? t('Real places from Google Maps around the selected area, filtered to recycling and waste businesses. The platform network tab shows fictional demo participants.')
            : t('Fictional demo participants of the SIRKULA network. Pick one to see its materials and propose a cooperation.')}</p>
          <div className="em em--in">{view === 'places' ? <Nearby key={lang} onPropose={proposeTo} /> : <Network onPropose={proposeTo} />}</div>
        </section>
      )}

      {tab === 'programs' && (
        <section className="pt__sec">
          <PickupPartnerSection />
          <p className="pt__lead">{t('Other ways to work with SIRKULA. We prefill the terms; you can still change them while the agreement is being reviewed.')}</p>
          <div className="pt__grid">
            {cooperationPrograms.map(p => (
              <article key={p.id} className="pt__prog">
                <span className="pt__progIcon"><p.Icon size={22} aria-hidden="true" /></span>
                <h3>{t(p.title)}</h3>
                <p>{t(p.desc)}</p>
                <small><b>{t('For')}:</b> {t(p.who)}</small>
                <ul>{p.terms.map(x => <li key={x}>{t(x)}</li>)}</ul>
                <footer><span>{t('Your share')} <b>{p.share}%</b></span>
                  <button type="button" className="pt__btn" onClick={() => proposeProgram(p)}>{t('Apply')}<ArrowRight size={15} aria-hidden="true" /></button></footer>
              </article>
            ))}
          </div>
          <div className="pt__mine">
            <div className="pt__mineHead"><h2>{t('My proposals')}</h2>{mine.length > 0 && <button type="button" className="pt__link" onClick={() => go('agreements')}>{t('Open agreements')}<ArrowRight size={14} aria-hidden="true" /></button>}</div>
            {mine.length === 0 ? <p className="pt__empty">{t('No proposals yet. Apply to a programme above or propose to a partner on the map.')}</p> : (
              <ul>{mine.map(a => (
                <li key={a.id}><button type="button" onClick={() => nav(`/app/partners?tab=agreements&id=${a.id}`)}>
                  <Avatar name={a.community} size={34} square /><span><b>{a.title}</b><small>{a.community} · v{a.version}</small></span><StatusBadge status={a.status} /></button></li>))}</ul>
            )}
          </div>
        </section>
      )}

      {tab === 'agreements' && <AgreementsPage embedded />}
      {tab === 'communities' && <CommunityPage embedded />}

      <Modal open={!!target} title={target?.kind === 'program' ? t('Apply to SIRKULA') : t('Propose cooperation')} onClose={() => setTarget(null)}>
        {target && (
          <form className="pt__form" onSubmit={submit} noValidate>
            <div className="pt__to"><Avatar name={target.partner} size={40} square /><span><small>{t('Proposal to')}</small><b>{target.partner}</b>{target.hint && <em>{target.hint}</em>}</span></div>
            {target.program && <p className="pt__terms">{target.program.terms.map(x => t(x)).join(' · ')}</p>}
            <label>{t('Title')}<input value={title} aria-invalid={!!err} onChange={e => { setTitle(e.target.value); setErr('') }} /></label>
            <label>{t('Estimated volume per month (kg, optional)')}<input type="number" min={0} inputMode="decimal" value={qty} onChange={e => { setQty(e.target.value); setErr('') }} /></label>
            <label>{t('What do you offer or need?')}<textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder={t('e.g. Weekly pickup of sorted plastic from 30 shops')} /></label>
            <p className="pt__split">{t('Starting cost split')}: <b>{me || t('You')} {target.share}%</b> · <b>{target.partner} {100 - target.share}%</b></p>
            {err && <p className="pt__err" role="alert">{t(err)}</p>}
            <div className="pt__act"><button type="button" className="pt__ghost" onClick={() => setTarget(null)}>{t('Cancel')}</button><button type="submit" className="pt__btn"><Send size={15} aria-hidden="true" />{t('Send proposal')}</button></div>
          </form>
        )}
      </Modal>
    </div>
  )
}
