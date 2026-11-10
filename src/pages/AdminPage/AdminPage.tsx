import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Activity, AlertTriangle, BadgeCheck, Building2, ClipboardCheck, FileSignature, LayoutDashboard, ListChecks, Package, Search, ShieldCheck, ShoppingBag, Truck, Users } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import { baseParticipants } from '../../data/participants'
import { stages } from '../../features/traceability/lifecycle'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import './AdminPage.css'

const TABS = [
  { key: 'overview', label: 'Overview', Icon: LayoutDashboard }, { key: 'verification', label: 'Verification', Icon: ClipboardCheck },
  { key: 'exceptions', label: 'Exceptions', Icon: AlertTriangle }, { key: 'directory', label: 'Directory', Icon: Users }, { key: 'audit', label: 'Audit log', Icon: ListChecks },
] as const
type Tab = typeof TABS[number]['key']
type EvFilter = 'awaiting review' | 'accepted' | 'rejected' | 'all'

/** Konsol admin (prototipe): ringkasan, antrean verifikasi, pengecualian operasional, direktori pengguna dan organisasi, dan log audit. Semua data demo. */
export default function AdminPage() {
  const { user, evidence, batches, activity, processors, pickupPartners, agreements, orders, products, reviewEvidence, notify } = useStore(); const { t } = useT()
  const [sp, setSp] = useSearchParams(); const raw = sp.get('tab') as Tab | null; const tab: Tab = TABS.some(x => x.key === raw) ? raw! : 'overview'
  const [evf, setEvf] = useState<EvFilter>('awaiting review'), [q, setQ] = useState('')

  const queue = evidence.filter(e => e.status === 'awaiting review'), exc = batches.filter(b => b.status === 'exception')
  const users = [...(user ? [{ name: user.name, org: user.org, you: true }] : []), { name: 'Budi Santoso', org: 'PT Daur Hijau Dewata', you: false }, { name: 'Siti Rahayu', org: 'CV Batik Laras', you: false }]
  const orgs = useMemo(() => [
    ...baseParticipants.map(p => ({ id: p.id, name: p.name, kind: p.type, region: p.region, note: p.materials.join(', '), active: p.status === 'active' })),
    ...processors.map(p => ({ id: p.id, name: p.name, kind: 'processor', region: p.region, note: `${p.accepts.join(', ')} · ${p.capacity.toLocaleString('id-ID')} kg`, active: true })),
    ...pickupPartners.map(p => ({ id: p.id, name: p.companyName, kind: 'pickup partner', region: p.city, note: `${p.quotaKg.toLocaleString('id-ID')} kg / ${t('month')}`, active: p.active })),
  ], [processors, pickupPartners, t])
  const openAgr = agreements.filter(a => a.status === 'pending' || a.status === 'revision').length
  const openOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length
  const evRows = evidence.filter(e => evf === 'all' || e.status === evf)
  const orgRows = orgs.filter(o => !q || (o.name + o.region + o.kind).toLowerCase().includes(q.toLowerCase()))
  const byStage = stages.map(s => ({ key: s.key, label: s.label, n: batches.filter(b => b.status === s.key).length })).filter(x => x.n > 0)
  const go = (k: Tab) => setSp(k === 'overview' ? {} : { tab: k }, { replace: true })
  const verify = (id: string, ok: boolean) => { reviewEvidence(id, ok); notify(ok ? 'Evidence verified' : 'Evidence rejected') }

  const kpis = [
    { Icon: Users, v: users.length, l: 'Users' }, { Icon: Building2, v: orgs.length, l: 'Organizations' }, { Icon: ClipboardCheck, v: queue.length, l: 'Verification queue', warn: queue.length > 0 },
    { Icon: AlertTriangle, v: exc.length, l: 'Open exceptions', warn: exc.length > 0 }, { Icon: Truck, v: pickupPartners.filter(p => p.active).length, l: 'Active pickup partners' },
    { Icon: FileSignature, v: openAgr, l: 'Agreements awaiting approval', warn: openAgr > 0 }, { Icon: ShoppingBag, v: openOrders, l: 'Open marketplace orders' }, { Icon: Package, v: products.length, l: 'Products listed' },
  ]
  const EvCard = ({ e }: { e: typeof evidence[number] }) => (
    <li className="adm__item"><span className="adm__ico"><BadgeCheck size={20} aria-hidden="true" /></span>
      <div className="adm__txt"><b>{e.batchId} · {t(e.note)}</b><small>{e.by} · {e.date}</small></div>
      {e.status === 'awaiting review'
        ? <div className="adm__acts"><button type="button" className="adm__btn" onClick={() => verify(e.id, true)}>{t('Verify')}</button><button type="button" className="adm__btn adm__btn--ghost" onClick={() => verify(e.id, false)}>{t('Reject')}</button></div>
        : <StatusBadge status={e.status} />}
    </li>)

  return (
    <div className="adm">
      <header className="adm__hero">
        <span className="adm__heroIco"><ShieldCheck size={28} aria-hidden="true" /></span>
        <div><span className="adm__eyebrow">{t('Admin')}</span><h1>{t('Administration')}</h1><p>{t('Prototype oversight view with demo records.')}</p></div>
        <div className="adm__pulse"><b>{queue.length + exc.length}</b><span>{t('items need attention')}</span></div>
      </header>

      <nav className="adm__tabs" role="tablist" aria-label={t('Administration')}>
        {TABS.map(({ key, label, Icon }) => <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'on' : ''} onClick={() => go(key)}><Icon size={16} aria-hidden="true" />{t(label)}{key === 'verification' && queue.length > 0 && <i>{queue.length}</i>}{key === 'exceptions' && exc.length > 0 && <i>{exc.length}</i>}</button>)}
      </nav>

      {tab === 'overview' && <>
        <section className="adm__kpis" aria-label={t('Overview')}>{kpis.map(({ Icon, v, l, warn }) => <div key={l} className={`adm__kpi${warn ? ' warn' : ''}`}><span><Icon size={18} aria-hidden="true" /></span><b>{v}</b><small>{t(l)}</small></div>)}</section>
        <div className="adm__cols">
          <section className="adm__panel"><h2>{t('Needs attention')}</h2>
            {queue.length + exc.length === 0 ? <EmptyState tone="success" title={t('All clear')} description={t('Nothing is waiting for review.')} /> : <ul className="adm__list">
              {queue.slice(0, 3).map(e => <EvCard key={e.id} e={e} />)}
              {exc.slice(0, 3).map(b => <li key={b.id} className="adm__item"><span className="adm__ico adm__ico--bad"><AlertTriangle size={20} aria-hidden="true" /></span><div className="adm__txt"><b>{b.id} · {t(b.name)}</b><small>{t(b.region)} · {b.qty.toLocaleString('id-ID')} kg</small></div><Link className="adm__btn adm__btn--ghost" to="/app/orders">{t('Inspect')}</Link></li>)}
            </ul>}
          </section>
          <section className="adm__panel"><h2>{t('Batches by stage')}</h2>
            <ul className="adm__bars">{byStage.map(s => <li key={s.key}><span>{t(s.label)}</span><div><i style={{ width: `${(s.n / Math.max(...byStage.map(x => x.n))) * 100}%` }} /></div><b>{s.n}</b></li>)}</ul>
          </section>
        </div>
        <section className="adm__panel"><h2>{t('Recent activity')}</h2><ul className="adm__feed">{activity.slice(0, 5).map(a => <li key={a.id}><Activity size={15} aria-hidden="true" /><span>{t(a.text)}</span><small>{t(a.time)}</small></li>)}</ul></section>
      </>}

      {tab === 'verification' && <section className="adm__panel"><div className="adm__bar"><h2>{t('Verification queue')}</h2>
        <div className="adm__chips" role="group" aria-label={t('Status')}>{(['awaiting review', 'accepted', 'rejected', 'all'] as EvFilter[]).map(f => <button key={f} type="button" aria-pressed={evf === f} className={evf === f ? 'on' : ''} onClick={() => setEvf(f)}>{t(f === 'all' ? 'All' : f)}</button>)}</div></div>
        {evRows.length === 0 ? <EmptyState tone="success" title={evf === 'awaiting review' ? t('Queue is empty.') : t('Nothing here yet.')} /> : <ul className="adm__list">{evRows.map(e => <EvCard key={e.id} e={e} />)}</ul>}</section>}

      {tab === 'exceptions' && <section className="adm__panel"><h2>{t('Operational exceptions')}</h2>
        {exc.length === 0 ? <EmptyState tone="success" title={t('None.')} /> : <ul className="adm__list">{exc.map(b => <li key={b.id} className="adm__item"><span className="adm__ico adm__ico--bad"><AlertTriangle size={20} aria-hidden="true" /></span>
          <div className="adm__txt"><b>{b.id} · {t(b.name)}</b><small>{b.source} · {t(b.region)} · {b.qty.toLocaleString('id-ID')} kg · {b.date}</small></div><StatusBadge status={b.status} /><Link className="adm__btn adm__btn--ghost" to="/app/orders">{t('Inspect')}</Link></li>)}</ul>}</section>}

      {tab === 'directory' && <div className="adm__cols adm__cols--dir">
        <section className="adm__panel"><h2>{t('Users')}</h2><ul className="adm__list">{users.map(u => <li key={u.name} className="adm__item"><span className="adm__avatar">{u.name.slice(0, 1)}</span><div className="adm__txt"><b>{u.name}{u.you && <em>{t('You')}</em>}</b><small>{u.org}</small></div></li>)}</ul></section>
        <section className="adm__panel"><div className="adm__bar"><h2>{t('Organizations')}</h2><label className="adm__search"><Search size={15} aria-hidden="true" /><input value={q} onChange={e => setQ(e.target.value)} placeholder={t('Search organizations')} aria-label={t('Search organizations')} /></label></div>
          {orgRows.length === 0 ? <EmptyState title={t('No organizations match.')} /> : <ul className="adm__list">{orgRows.map(o => <li key={o.id} className="adm__item"><span className="adm__ico"><Building2 size={20} aria-hidden="true" /></span><div className="adm__txt"><b>{o.name}</b><small>{t(o.kind)} · {t(o.region)} · {o.note}</small></div><StatusBadge status={o.active ? 'active' : 'inactive'} /></li>)}</ul>}</section>
      </div>}

      {tab === 'audit' && <section className="adm__panel"><h2>{t('Audit activity')}</h2><ul className="adm__feed adm__feed--lg">{activity.map(a => <li key={a.id}><Activity size={15} aria-hidden="true" /><span>{t(a.text)}</span><small>{t(a.time)}</small>{a.link && <Link to={a.link}>{t('Open')}</Link>}</li>)}</ul></section>}
    </div>
  )
}
