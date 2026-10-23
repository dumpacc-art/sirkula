import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import './NotificationsPage.css'
export default function NotificationsPage() {
  const { notifs, markRead, markAllRead } = useStore(); const { t } = useT(); const nav = useNavigate(); const [cat, setCat] = useState(''), [rd, setRd] = useState('')
  const rows = notifs.filter(n => (!cat || n.category === cat) && (!rd || (rd === 'unread' ? !n.read : n.read)))
  return (
    <div className="nt">
      <header><div><h1>{t('Notifications')}</h1><p>{notifs.filter(n => !n.read).length} {t('unread')}</p></div><button onClick={markAllRead}>{t('Mark all as read')}</button></header>
      <div className="nt__f"><Select value={cat} onChange={setCat} options={[{ value:'', label:t('All categories') }, ...[...new Set(notifs.map(n => n.category))].map(c => ({ value:c, label:t(c) }))]} />
        <Select value={rd} onChange={setRd} options={[{ value:'', label:t('Read and unread') }, { value:'unread', label:t('Unread') }, { value:'read', label:t('Read') }]} /></div>
      {rows.length === 0 ? <div className="nt__empty">{t('Nothing here. You are all caught up.')}</div> : rows.map(n => (
        <article key={n.id} className={`nt__item${n.read ? '' : ' unread'}`}><div><b>{t(n.title)}</b><p>{t(n.body)}</p><small>{t(n.category)} · {t(n.time)}</small></div>
          <div className="nt__act">{!n.read && <button className="alt" onClick={() => markRead(n.id)}>{t('Mark read')}</button>}<button onClick={() => { markRead(n.id); nav(n.link) }}>{t('Open')}</button></div></article>))}
    </div>
  )
}
