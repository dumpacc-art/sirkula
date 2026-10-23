import { Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import LangSwitch from '../ui/LangSwitch'
import './Topbar.css'
export default function Topbar() {
  const { unread, logout, user } = useStore(); const nav = useNavigate(); const { t } = useT()
  return (
    <header className="tb">
      <span className="tb__tag">{t('PROTOTYPE · DEMO DATA')}</span>
      <span className="tb__r">
        <LangSwitch />
        <button className="tb__bell" aria-label={t('Notifications')} onClick={() => nav('/app/notifications')}><Bell size={18} />{unread > 0 && <i className="tb__badge">{unread}</i>}</button>
        <span className="tb__user"><b>{user?.name}</b></span>
        <button className="tb__out" onClick={() => { logout(); nav('/login') }}><LogOut size={15} />{t('Sign out')}</button>
      </span>
    </header>
  )
}
