import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useT } from '../../i18n'
import { navItems, NAV_GROUPS } from './navItems'
import AdminWhatsApp from '../ui/AdminWhatsApp'
import Logo from '../brand/Logo'
import './Sidebar.css'
export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { t } = useT()
  const Swap = collapsed ? PanelLeftOpen : PanelLeftClose
  const label = t(collapsed ? 'Expand sidebar' : 'Collapse sidebar')
  return (
    <motion.aside className={`sb${collapsed ? ' sb--collapsed' : ''}`} animate={{ width: collapsed ? 76 : 256 }} transition={{ duration: .3, ease: [.22,1,.36,1] }}>
      <div className="sb__head">
        {/* Tidak disentuh: logo. Di-hover/fokus: berganti jadi ikon sidebar (buka saat collapse, tutup saat expand). */}
        <button type="button" className="sb__brand" onClick={onToggle} aria-label={label} title={label}>
          <Logo variant="mark" tone="light" height={30} className="sb__mark" title="" />
          <Swap className="sb__swap" size={20} aria-hidden="true" />
        </button>
        {!collapsed && <Logo variant="wordmark" tone="light" height={15} className="sb__logo" />}
      </div>
      <nav className="sb__nav" aria-label={t('Main navigation')}>
        {NAV_GROUPS.map(g => (
          <Fragment key={g.key}>
            {collapsed ? <hr className="sb__rule" /> : <span className="sb__group">{t(g.label)}</span>}
            {navItems.filter(i => i.group === g.key).map(({ to, label, Icon }) => (
              <NavLink key={to} to={`/app/${to}`} className="sb__link" title={t(label)}>
                {({ isActive }) => (<>
                  {isActive && <motion.span layoutId="sb-active" className="sb__active" />}
                  <Icon size={18} />{!collapsed && <span>{t(label)}</span>}
                </>)}
              </NavLink>
            ))}
          </Fragment>
        ))}
      </nav>
      <div className="sb__foot"><AdminWhatsApp variant="rail" collapsed={collapsed} /></div>
    </motion.aside>
  )
}
