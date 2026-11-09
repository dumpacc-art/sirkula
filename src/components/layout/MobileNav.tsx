import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useT } from '../../i18n'
import { navItems } from './navItems'
import AdminWhatsApp from '../ui/AdminWhatsApp'
import './MobileNav.css'

/** Navigasi mobile: bar bawah (4 tujuan utama + tombol Pickup di tengah) dan lembar "Lainnya" untuk sisa menu. Hanya tampil di layar sempit. */
const LEFT = [['dashboard', 'Dashboard'], ['orders', 'Orders']] as const
const RIGHT = [['marketplace', 'Marketplace']] as const
const MAIN = ['dashboard', 'orders', 'pickup', 'marketplace']
const icon = (to: string) => navItems.find(i => i.to === to)!.Icon

export default function MobileNav() {
  const { t } = useT(); const { pathname } = useLocation(); const [open, setOpen] = useState(false); const drag = useDragControls()
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open])
  const more = navItems.filter(i => !MAIN.includes(i.to))
  const moreActive = more.some(i => pathname.startsWith(`/app/${i.to}`))
  const tab = ([to, label]: readonly [string, string]) => { const Icon = icon(to); return (
    <NavLink key={to} to={`/app/${to}`} className={({ isActive }) => `mnav__tab${isActive ? ' on' : ''}`}><Icon size={22} /><span>{t(label)}</span></NavLink>) }
  const PickupIcon = icon('pickup')
  return (
    <>
      <nav className="mnav" aria-label={t('Main navigation')}>
        {LEFT.map(tab)}
        <NavLink to="/app/pickup" className={({ isActive }) => `mnav__fab${isActive ? ' on' : ''}`}><i><PickupIcon size={26} /></i><span>{t('Pickup')}</span></NavLink>
        {RIGHT.map(tab)}
        <button type="button" className={`mnav__tab${moreActive || open ? ' on' : ''}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(o => !o)}><Menu size={22} /><span>{t('More')}</span></button>
      </nav>
      <AnimatePresence>
        {open && (<>
          <motion.div key="bg" className="mnav-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.div key="sheet" className="msheet" role="dialog" aria-modal="true" aria-label={t('More')}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y" dragControls={drag} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: .5 }}
            onDragEnd={(_, info) => { if (info.offset.y > 80 || info.velocity.y > 500) setOpen(false) }}>
            <div className="msheet__grab" onPointerDown={e => drag.start(e)}><i /></div>
            <div className="msheet__head"><h3>{t('More')}</h3><button type="button" className="msheet__x" onClick={() => setOpen(false)} aria-label={t('Close')}><X size={20} /></button></div>
            <div className="msheet__grid">
              {more.map(({ to, label, Icon }) => (
                <NavLink key={to} to={`/app/${to}`} className={({ isActive }) => `msheet__item${isActive ? ' on' : ''}`}><Icon size={22} /><span>{t(label)}</span></NavLink>
              ))}
              <AdminWhatsApp variant="tile" />
            </div>
          </motion.div>
        </>)}
      </AnimatePresence>
    </>
  )
}
