import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck, Route, Recycle } from 'lucide-react'
import { useT } from '../../i18n'
import LangSwitch from '../ui/LangSwitch'
import CircularArt from '../art/CircularArt'
import Logo from '../brand/Logo'
import './auth.css'

const perks = [
  { Icon: Recycle, t: 'Smart matching', d: 'Connect material with the right processor.' },
  { Icon: Route, t: 'End-to-end traceability', d: 'Follow every batch from source to reuse.' },
  { Icon: ShieldCheck, t: 'Reviewed evidence', d: 'Nothing is called verified without review.' },
]

/** Shared split-screen frame for Login and Sign up. `mode` drives the segmented switch at the top of the form. */
export default function AuthLayout({ mode, title, subtitle, children, footer }: { mode: 'login' | 'signup'; title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  const { t } = useT()
  return (
    <div className="auth">
      <aside className="auth__art">
        <div className="auth__grid" aria-hidden="true" />
        <div className="auth__top"><Link to="/" className="auth__logo" aria-label="SIRKULA"><Logo variant="lockup" tone="light" height={48} /></Link></div>
        <div className="auth__hero">
          <motion.h2 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>{t('A circular economy network for every region')}</motion.h2>
          <p>{t('Request a pickup, follow it in real time, and see where your waste ends up.')}</p>
        </div>
        <div className="auth__art2"><CircularArt compact /></div>
        <ul className="auth__perks">{perks.map(({ Icon, t: k, d }) => <li key={k}><span><Icon size={16} /></span><div><b>{t(k)}</b><small>{t(d)}</small></div></li>)}</ul>
      </aside>
      <main className="auth__side">
        <div className="auth__bar"><Link to="/" className="auth__back"><ArrowLeft size={15} />{t('Back to home')}</Link><LangSwitch /></div>
        <motion.div className="auth__card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease: [.22, 1, .36, 1] }}>
          <Link to="/" className="auth__logo auth__logo--m" aria-label="SIRKULA"><Logo variant="lockup" height={40} /></Link>
          <div className="auth__tabs" role="tablist" aria-label={t('Account')}>
            <Link to="/login" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''}>{t('Sign in')}</Link>
            <Link to="/signup" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''}>{t('Sign up')}</Link>
          </div>
          <h1>{title}</h1><p className="auth__sub">{subtitle}</p>
          {children}
          <div className="auth__foot">{footer}</div>
        </motion.div>
        <p className="auth__note">{t('Prototype environment: authentication here is a demo flow, not real identity security.')}</p>
      </main>
    </div>
  )
}
