import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Truck, Package, Sparkles, GitBranch, Users, FileSignature, Store, ShoppingBag, Map, BarChart3, FileText, Bell, Settings, Shield, PanelLeft, Crown } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import './Sidebar.css'
const items = [
  { to:'dashboard', label:'Dashboard', Icon:LayoutDashboard }, { to:'pickup', label:'Pickup', Icon:Truck },
  { to:'materials', label:'Materials', Icon:Package },
  { to:'matching', label:'SmartMatch', Icon:Sparkles }, { to:'tracking', label:'Flow Tracking', Icon:GitBranch },
  { to:'communities', label:'Communities', Icon:Users }, { to:'agreements', label:'Agreements', Icon:FileSignature },
  { to:'marketplace', label:'Marketplace', Icon:Store }, { to:'orders', label:'Orders', Icon:ShoppingBag },
  { to:'map', label:'Ecosystem Map', Icon:Map }, { to:'analytics', label:'Analytics', Icon:BarChart3 },
  { to:'reports', label:'Reports', Icon:FileText }, { to:'notifications', label:'Notifications', Icon:Bell },
  { to:'premium', label:'Premium', Icon:Crown },
  { to:'settings', label:'Settings', Icon:Settings }, { to:'admin', label:'Admin', Icon:Shield },
]
export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user } = useStore(); const { t } = useT()
  return (
    <motion.aside className="sb" animate={{ width: collapsed ? 72 : 244 }} transition={{ duration: .3, ease: [.22,1,.36,1] }}>
      <div className="sb__head">
        {!collapsed && <span className="sb__logo">SIRKULA</span>}
        <button className="sb__toggle" onClick={onToggle} aria-label={t('Toggle sidebar')}><PanelLeft size={18} /></button>
      </div>
      <nav className="sb__nav">
        {items.filter(i => i.to !== 'admin' || user?.role === 'admin').map(({ to, label, Icon }) => (
          <NavLink key={to} to={`/app/${to}`} className="sb__link" title={t(label)}>
            {({ isActive }) => (<>
              {isActive && <motion.span layoutId="sb-active" className="sb__active" />}
              <Icon size={18} />{!collapsed && <span>{t(label)}</span>}
            </>)}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  )
}
