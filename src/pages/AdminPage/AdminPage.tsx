import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import { baseParticipants } from '../../data/participants'
import './AdminPage.css'
export default function AdminPage() {
  const { user, evidence, batches, activity, processors, reviewEvidence, notify } = useStore(); const { t } = useT()
  if (user?.role !== 'admin') return <div className="ad"><h1>{t('Administration')}</h1><p className="ad__muted">{t('Restricted. Switch the demo role to admin in Settings. This is a prototype permission simulation, not secure authorization.')}</p></div>
  const queue = evidence.filter(e => e.status === 'awaiting review'), exc = batches.filter(b => b.status === 'exception')
  const users = [{ name:user.name, org:user.org, role:user.role }, { name:'Demo Processor Lead', org:'GreenLoop Recyclers', role:'processor' }, { name:'Demo Seller', org:'Loom & Co', role:'seller' }]
  const orgs = [...baseParticipants.map(p => p.name), ...processors.map(p => p.name)]
  return (
    <div className="ad">
      <header><h1>{t('Administration')}</h1><p className="ad__muted">{t('Prototype oversight view with demo records.')}</p></header>
      <section className="ad__k"><div><b>{users.length}</b><span>{t('Users')}</span></div><div><b>{orgs.length}</b><span>{t('Organizations')}</span></div><div><b>{queue.length}</b><span>{t('Verification queue')}</span></div><div><b>{exc.length}</b><span>{t('Open exceptions')}</span></div></section>
      <section><h3>{t('Verification queue')}</h3>{queue.length === 0 ? <p className="ad__muted">{t('Queue is empty.')}</p> : queue.map(e => <div key={e.id} className="ad__row"><span>{e.batchId} · {t(e.note)} · {e.by}</span>
        <span><button onClick={() => { reviewEvidence(e.id, true); notify('Evidence verified') }}>{t('Verify')}</button> <button className="alt" onClick={() => { reviewEvidence(e.id, false); notify('Evidence rejected') }}>{t('Reject')}</button></span></div>)}</section>
      <section><h3>{t('Operational exceptions')}</h3>{exc.length === 0 ? <p className="ad__muted">{t('None.')}</p> : exc.map(b => <div key={b.id} className="ad__row"><span>{b.id} · {t(b.name)} · {t(b.region)}</span><Link to="/app/tracking">{t('Inspect')}</Link></div>)}</section>
      <section className="ad__two"><div><h3>{t('Users')}</h3>{users.map(u => <p key={u.name}>{u.name} · {u.org} · {t(u.role)}</p>)}</div><div><h3>{t('Audit activity')}</h3>{activity.slice(0, 6).map(a => <p key={a.id}>{t(a.text)} <small>{t(a.time)}</small></p>)}</div></section>
    </div>
  )
}
