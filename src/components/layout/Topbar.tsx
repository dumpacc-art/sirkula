import { Bell } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import { navItems } from './navItems'
import Logo from '../brand/Logo'
import './Topbar.css'
export default function Topbar() {
  const { unread, user } = useStore(); const nav = useNavigate(); const { t } = useT(); const { pathname } = useLocation()
  const section = pathname.split('/')[2] ?? ''
  const current = navItems.find(i => i.to === section)
  const initial = (user?.name ?? '?').trim().charAt(0).toUpperCase()
  return (
    <header className="tb">
      <Link to="/app/dashboard" className="tb__logo" aria-label="SIRKULA"><Logo variant="lockup" height={30} /></Link>
      {current && <span className="tb__crumb"><current.Icon size={16} aria-hidden="true" />{t(current.label)}</span>}
      <span className="tb__tag">{t('PROTOTYPE · DEMO DATA')}</span>
      <span className="tb__r">
        <button className="tb__bell" aria-label={t('Notifications')} onClick={() => nav('/app/notifications')}><Bell size={18} />{unread > 0 && <i className="tb__badge">{unread}</i>}</button>
        <span className="tb__user"><span className="tb__avatar" aria-hidden="true">{initial}</span><b>{user?.name}</b></span>
      </span>
    </header>
  )
}
