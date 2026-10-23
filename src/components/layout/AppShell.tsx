import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './AppShell.css'
export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  return (
    <div className="shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="shell__main">
        <Topbar />
        <AnimatePresence mode="wait">
          <motion.main key={pathname} className="shell__content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .22 }}>
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
