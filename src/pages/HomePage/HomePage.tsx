import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Menu, X, ArrowRight, Radar, Route as RouteIcon, Users, Store, Map as MapIcon, BarChart3, Home, Truck, Factory, HeartHandshake, ShoppingBag, ChevronDown, PlayCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { demoProducts } from '../../data/demoData'
import { useT } from '../../i18n'
import { useStore } from '../../store/StoreContext'
import LangSwitch from '../../components/ui/LangSwitch'
import CircularArt from '../../components/art/CircularArt'
import StageVisual from './StageVisual'
// recharts (berat) dipisah ke chunk sendiri, diunduh setelah halaman pertama tampil sehingga tidak menahan first paint.
const ImpactCharts = lazy(() => import('./ImpactCharts'))
import { demoUser } from '../../lib/accounts'
import { emojiOf } from '../../components/marketplace/ProductCard'
import { rupiah } from '../../lib/pricing'
import './HomePage.css'

const stages = [
  { n: 'Material source', d: 'Generators register batches with category, quantity, and pickup location.', who: 'Generators, communities', rec: 'Batch ID, composition notes, location, availability' },
  { n: 'SmartMatch', d: 'Processors that cannot accept the material or lack capacity are excluded. The rest are ranked.', who: 'Generators, processors', rec: 'Criteria weights, score, reasons, accepted match' },
  { n: 'Collection', d: 'Pickup is scheduled and custody passes to a transport provider.', who: 'Transport providers', rec: 'Pickup weight, timestamp, handover record' },
  { n: 'Processing', d: 'The processor weighs incoming material and records processing steps.', who: 'Processors', rec: 'Receiving weight, input, output, discrepancies' },
  { n: 'Utilization', d: 'Evidence of reuse is submitted, then reviewed before anything is called verified.', who: 'Processors, reviewers, sellers', rec: 'Evidence entries, review result, linked products' },
]
const features = [
  { Icon: Radar, t: 'SmartMatch', d: 'Rule-based matching with hard constraints and explained rankings.', to: '/app/pickup' },
  { Icon: RouteIcon, t: 'Circular Flow Tracking', d: 'A batch timeline with weights, evidence, and review.', to: '/app/orders' },
  { Icon: Users, t: 'Community Collaboration', d: 'Initiatives, discussion, and versioned agreements.', to: '/app/partners?tab=communities' },
  { Icon: Store, t: 'Circular Marketplace', d: 'Products with recorded origin and live stock.', to: '/app/marketplace' },
  { Icon: MapIcon, t: 'Nearest Partners', d: 'Find nearby partners and propose a cooperation.', to: '/app/partners' },
  { Icon: BarChart3, t: 'Impact Analytics', d: 'Stage-aware metrics that never double count.', to: '/app/analytics' },
]
const audiences = [
  { Icon: Home, t: 'Households and businesses', d: 'Request a pickup and follow it.' },
  { Icon: Truck, t: 'Transport providers', d: 'Take jobs and record handovers.' },
  { Icon: Factory, t: 'Processors', d: 'Receive matched material and log results.' },
  { Icon: HeartHandshake, t: 'Communities', d: 'Run initiatives with shared agreements.' },
  { Icon: ShoppingBag, t: 'Sellers and buyers', d: 'Trade products with a recorded origin.' },
]
const faqs = [
  ['Do I need to choose an account type?', 'No. Create one account with your name, email and phone. Everything in the app is open to you.'],
  ['Is this real data?', 'No. SIRKULA is a prototype. All figures are demonstration data and your account stays in this browser.'],
  ['How is my waste tracked?', 'Each pickup becomes a batch with an ID. You can follow its status from pickup to processing and reuse.'],
  ['What does "verified" mean here?', 'A step is only called verified after a reviewer accepts the evidence. Until then it shows as pending.'],
]

function Count({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null), seen = useInView(ref, { once: true }), reduce = useReducedMotion(), [v, setV] = useState(0)
  useEffect(() => {
    if (!seen) return; if (reduce) { setV(to); return }
    const t0 = performance.now(); let raf = 0
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / 1200); setV(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [seen, to, reduce])
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>
}
const rise = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: .55, ease: [.22, 1, .36, 1] as const } }

export default function HomePage() {
  const { t } = useT(), { login, notify } = useStore(), nav = useNavigate()
  const [scrolled, setScrolled] = useState(false), [menu, setMenu] = useState(false), [sel, setSel] = useState(0), [open, setOpen] = useState<number | null>(0)
  useEffect(() => { const f = () => setScrolled(window.scrollY > 16); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f) }, [])
  const demo = () => { login(demoUser()); notify('Signed in (prototype session)'); nav('/app/dashboard') }
  const links = [['#how', 'How it works'], ['#features', 'Platform'], ['#impact', 'Impact'], ['#faq', 'FAQ']] as const

  return (
    <div className="lp">
      <header className={`lp__nav${scrolled ? ' s' : ''}`}>
        <nav className="lp__navIn" aria-label="Main">
          <Link to="/" className="lp__logo" aria-label="SIRKULA"><img className="lp__logoImg" src={`${import.meta.env.BASE_URL}brand/logo-full.svg`} alt="SIRKULA" height={52} /></Link>
          <div className="lp__links">{links.map(([h, l]) => <a key={h} href={h}>{t(l)}</a>)}<Link to="/app/marketplace">{t('Marketplace')}</Link></div>
          <div className="lp__acts"><LangSwitch /><Link to="/login" className="lp__ghost">{t('Sign in')}</Link><Link to="/signup" className="lp__btn">{t('Sign up')}</Link></div>
          <button className="lp__burger" onClick={() => setMenu(m => !m)} aria-label="Menu" aria-expanded={menu}>{menu ? <X size={22} /> : <Menu size={22} />}</button>
        </nav>
        <AnimatePresence>{menu && <motion.div className="lp__mobile" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)}>
          {links.map(([h, l]) => <a key={h} href={h}>{t(l)}</a>)}<Link to="/app/marketplace">{t('Marketplace')}</Link>
          <div className="lp__mobileRow"><LangSwitch /><Link to="/login" className="lp__ghost">{t('Sign in')}</Link><Link to="/signup" className="lp__btn">{t('Sign up')}</Link></div>
        </motion.div>}</AnimatePresence>
      </header>

      <section className="lp__hero">
        <div className="lp__heroBg" aria-hidden="true" />
        <div className="lp__heroIn">
          <div className="lp__heroText">
            <motion.span className="lp__pill" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><i />{t('Prototype · demo data')}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .6 }}>{t('A circular economy network for every region')}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16, duration: .6 }}>{t('Request a pickup, follow it in real time, and see where your waste ends up.')}</motion.p>
            <motion.div className="lp__cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24, duration: .6 }}>
              <Link to="/signup" className="lp__btn lp__btn--lg">{t('Get started free')}<ArrowRight size={18} /></Link>
              <button type="button" className="lp__ghost lp__ghost--lg" onClick={demo}><PlayCircle size={18} />{t('Try the demo')}</button>
            </motion.div>
            <ul className="lp__trust"><li><ShieldCheck size={16} />{t('Reviewed evidence')}</li><li><Sparkles size={16} />{t('No role to pick')}</li><li><RouteIcon size={16} />{t('End-to-end traceability')}</li></ul>
          </div>
          <motion.div className="lp__heroArt" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .2, duration: .8, ease: [.22, 1, .36, 1] }}><CircularArt tone="light" /></motion.div>
        </div>
      </section>

      <section className="lp__aud" aria-label={t('Who uses SIRKULA')}>
        <div className="lp__wrap">
          <p className="lp__audT">{t('Built for everyone in the material loop')}</p>
          <div className="lp__audGrid">{audiences.map(({ Icon, t: k, d }) => <div key={k}><span><Icon size={20} /></span><b>{t(k)}</b><small>{t(d)}</small></div>)}</div>
        </div>
      </section>

      <section id="how" className="lp__sec">
        <div className="lp__wrap">
          <motion.div className="lp__head" {...rise}><h2>{t('How SIRKULA works')}</h2><p>{t('Select a stage to see who is involved and what is recorded.')}</p></motion.div>
          <div className="lp__how">
            <div className="lp__steps" role="tablist" aria-label={t('Stages')}>
              {stages.map((s, i) => (
                <button key={s.n} role="tab" id={`stg-${i}`} aria-selected={sel === i} aria-controls="stg-panel" className={sel === i ? 'on' : ''} onClick={() => setSel(i)}
                  onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setSel((i + 1) % stages.length); document.getElementById(`stg-${(i + 1) % stages.length}`)?.focus() } if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); const p = (i + stages.length - 1) % stages.length; setSel(p); document.getElementById(`stg-${p}`)?.focus() } }}>
                  <span className="lp__stepNo">{i + 1}</span><div><b>{t(s.n)}</b><small>{t(s.d)}</small></div>
                </button>
              ))}
            </div>
            <div className="lp__panel" id="stg-panel" role="tabpanel" aria-labelledby={`stg-${sel}`}>
              <AnimatePresence mode="wait"><motion.div key={sel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
                <StageVisual i={sel} />
                <dl className="lp__meta"><div><dt>{t('Actors')}</dt><dd>{t(stages[sel].who)}</dd></div><div><dt>{t('Recorded')}</dt><dd>{t(stages[sel].rec)}</dd></div></dl>
              </motion.div></AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="lp__sec lp__sec--tint">
        <div className="lp__wrap">
          <motion.div className="lp__head" {...rise}><h2>{t('Six systems, one platform')}</h2><p>{t('Everything you need to move material from source to reuse.')}</p></motion.div>
          <ul className="lp__rows">{features.map(({ Icon, t: ti, d, to }, i) => (
            <motion.li key={ti} {...rise} transition={{ ...rise.transition, delay: i * .05 }}>
              <Link to={to} className="lp__row">
                <span className="lp__rowNo" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="lp__fico"><Icon size={22} /></span>
                <span className="lp__rowText"><h3>{t(ti)}</h3><p>{t(d)}</p></span>
                <span className="lp__rowGo" aria-label={t('Open')}><ArrowRight size={20} /></span>
              </Link>
            </motion.li>))}
          </ul>
        </div>
      </section>

      <section id="impact" className="lp__sec lp__sec--dark">
        <div className="lp__wrap">
          <motion.div className="lp__head" {...rise}><h2>{t('Impact at a glance')}</h2><p>{t('DEMONSTRATION DATA. These figures are not real SIRKULA performance.')}</p></motion.div>
          <div className="lp__kpis">
            <div><b><Count to={4800} /></b><span>{t('kg registered (demo)')}</span></div>
            <div><b><Count to={3200} /></b><span>{t('kg processed (demo)')}</span></div>
            <div><b><Count to={86} suffix="%" /></b><span>{t('evidence complete (demo)')}</span></div>
          </div>
          <Suspense fallback={<div className="lp__charts" style={{ minHeight: 260 }} />}><ImpactCharts /></Suspense>
        </div>
      </section>

      <section className="lp__sec">
        <div className="lp__wrap">
          <motion.div className="lp__head lp__head--row" {...rise}><div><h2>{t('Circular marketplace')}</h2><p>{t('Products with a recorded origin, ready to browse.')}</p></div><Link to="/app/marketplace" className="lp__ghost">{t('See all products')}<ArrowRight size={16} /></Link></motion.div>
          <div className="lp__prod">{['P-1', 'F-1', 'P-4', 'F-10'].map(id => demoProducts.find(x => x.id === id)!).filter(Boolean).map(p => (
            <Link key={p.id} to={`/app/marketplace/${p.id}`}>
              <div className="lp__prodImg" style={{ background: `linear-gradient(135deg,hsl(${p.hue} 45% 86%),hsl(${p.hue} 45% 58%))` }}><span aria-hidden="true">{emojiOf(p.category)}</span></div>
              <h4>{t(p.name)}</h4><p>{p.seller} · {rupiah(p.price)}</p><small className={p.traceable ? 'ok' : ''}>{t(p.traceable ? 'Origin record available' : 'No origin record')}</small>
            </Link>))}
          </div>
        </div>
      </section>

      <section id="faq" className="lp__sec lp__sec--tint">
        <div className="lp__wrap lp__wrap--narrow">
          <motion.div className="lp__head" {...rise}><h2>{t('Questions, answered')}</h2></motion.div>
          <div className="lp__faq">{faqs.map(([q, a], i) => (
            <div key={q} className={open === i ? 'on' : ''}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}><span>{t(q)}</span><ChevronDown size={20} /></button>
              <AnimatePresence initial={false}>{open === i && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }}>{t(a)}</motion.p>}</AnimatePresence>
            </div>))}
          </div>
        </div>
      </section>

      <section className="lp__final">
        <div className="lp__wrap">
          <motion.div className="lp__finalCard" {...rise}>
            <div><h2>{t('Ready to see where your waste goes?')}</h2><p>{t('Create an account in under a minute, or explore with the demo.')}</p></div>
            <div className="lp__cta"><Link to="/signup" className="lp__btn lp__btn--lime lp__btn--lg">{t('Create account')}<ArrowRight size={18} /></Link><button type="button" className="lp__ghost lp__ghost--dark lp__ghost--lg" onClick={demo}>{t('Try the demo')}</button></div>
          </motion.div>
        </div>
      </section>

      <footer className="lp__foot">
        <div className="lp__wrap lp__footIn">
          <Link to="/" className="lp__logo" aria-label="SIRKULA"><img className="lp__logoImg" src={`${import.meta.env.BASE_URL}brand/logo-full.svg`} alt="SIRKULA" height={60} /></Link>
          <span>{t('SIRKULA · Prototype with demo data')}</span>
          <div><a href="#how">{t('How it works')}</a><Link to="/app/marketplace">{t('Marketplace')}</Link><Link to="/login">{t('Sign in')}</Link><Link to="/signup">{t('Sign up')}</Link></div>
        </div>
      </footer>
    </div>
  )
}
