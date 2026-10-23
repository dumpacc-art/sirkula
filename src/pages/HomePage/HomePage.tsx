import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, AreaChart, Area } from 'recharts'
import { demoProducts, flowSeries } from '../../data/demoData'
import { useT } from '../../i18n'
import LangSwitch from '../../components/ui/LangSwitch'
import { HERO_VIDEO_MP4, HERO_VIDEO_WEBM, HERO_POSTER } from '../../config/media'
import './HomePage.css'
const stages = [
  { n:'Material source', d:'Generators register batches with category, quantity, and pickup location.', who:'Generators, communities', rec:'Batch ID, composition notes, location, availability' },
  { n:'SmartMatch', d:'Processors that cannot accept the material or lack capacity are excluded. The rest are ranked.', who:'Generators, processors', rec:'Criteria weights, score, reasons, accepted match' },
  { n:'Collection', d:'Pickup is scheduled and custody passes to a transport provider.', who:'Transport providers', rec:'Pickup weight, timestamp, handover record' },
  { n:'Processing', d:'The processor weighs incoming material and records processing steps.', who:'Processors', rec:'Receiving weight, input, output, discrepancies' },
  { n:'Utilization', d:'Evidence of reuse is submitted, then reviewed before anything is called verified.', who:'Processors, reviewers, sellers', rec:'Evidence entries, review result, linked products' },
]
const features = [
  ['SmartMatch', 'Rule-based matching with hard constraints and explained rankings.', '/app/matching'], ['Circular Flow Tracking', 'A batch timeline with weights, evidence, and review.', '/app/tracking'],
  ['Community Collaboration', 'Initiatives, discussion, and versioned agreements.', '/app/communities'], ['Circular Marketplace', 'Products with recorded origin and live stock.', '/app/marketplace'],
  ['Ecosystem Map', 'Participants, capacity, and recorded connections.', '/app/map'], ['Impact Analytics', 'Stage-aware metrics that never double count.', '/app/analytics'],
] as const
function Flow({ sel, onSel, small }: { sel: number; onSel?: (i: number) => void; small?: boolean }) {
  const { t } = useT()
  const pts = stages.map((_, i) => { const a = (i * 72 - 90) * Math.PI / 180; return [200 + 140 * Math.cos(a), 200 + 140 * Math.sin(a)] })
  return (
    <svg viewBox="0 0 400 400" className={`flow${small ? ' small' : ''}`} role="img" aria-label={t('Circular flow of material through five stages')}>
      <circle cx="200" cy="200" r="140" className="ring" /><circle cx="200" cy="200" r="140" className="ring run" />
      {pts.map(([x, y], i) => (
        <g key={i} className={i === sel ? 'node on' : 'node'} onClick={() => onSel?.(i)} tabIndex={onSel ? 0 : -1} onKeyDown={e => e.key === 'Enter' && onSel?.(i)}>
          <circle cx={x} cy={y} r={i === sel ? 22 : 16} /><text x={x} y={y + 4} textAnchor="middle">{i + 1}</text>
          {!small && <text x={x} y={y + (i === 0 ? -30 : 38)} textAnchor="middle" className="lbl">{t(stages[i].n)}</text>}
        </g>))}
    </svg>
  )
}
function Count({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null), seen = useInView(ref, { once:true }), reduce = useReducedMotion(), [v, setV] = useState(0)
  useEffect(() => { if (!seen) return; if (reduce) { setV(to); return } const t0 = performance.now(); let raf = 0
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / 1200); setV(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf) }, [seen, to, reduce])
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>
}
const rise = { initial:{ opacity:0, y:24 }, whileInView:{ opacity:1, y:0 }, viewport:{ once:true, margin:'-60px' }, transition:{ duration:.6, ease:[.22,1,.36,1] as const } }
export default function HomePage() {
  const { t } = useT(), [vidOk, setVidOk] = useState(true), [scrolled, setScrolled] = useState(false), [menu, setMenu] = useState(false), [sel, setSel] = useState(0), reduce = useReducedMotion()
  const { scrollY } = useScroll(), y = useTransform(scrollY, [0, 500], [0, reduce ? 0 : 60])
  useEffect(() => { const f = () => setScrolled(window.scrollY > 24); f(); window.addEventListener('scroll', f, { passive:true }); return () => window.removeEventListener('scroll', f) }, [])
  const words = t('A circular economy network for every region').split(' ')
  return (
    <div className="hp">
      <nav className={`hp__nav${scrolled ? ' s' : ''}`}><Link to="/" className="hp__logo">SIRKULA</Link>
        <div className="hp__links"><a href="#how">{t('How it works')}</a><a href="#features">{t('Platform')}</a><a href="#impact">{t('Impact')}</a><Link to="/app/marketplace">{t('Marketplace')}</Link><LangSwitch /><Link to="/login">{t('Sign in')}</Link><Link to="/register" className="cta">{t('Get started')}</Link></div>
        <button className="hp__burger" onClick={() => setMenu(m => !m)} aria-label="Menu" aria-expanded={menu}>☰</button></nav>
      <AnimatePresence>{menu && <motion.div className="hp__mobile" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} onClick={() => setMenu(false)}>
        <a href="#how">{t('How it works')}</a><a href="#features">{t('Platform')}</a><a href="#impact">{t('Impact')}</a><Link to="/app/marketplace">{t('Marketplace')}</Link><Link to="/login">{t('Sign in')}</Link><Link to="/register">{t('Get started')}</Link><LangSwitch /></motion.div>}</AnimatePresence>
      <header className="hp__hero">{vidOk && <video className="hp__video" autoPlay muted loop playsInline preload="auto" poster={HERO_POSTER} onError={() => setVidOk(false)} aria-hidden="true"><source src={HERO_VIDEO_WEBM} type="video/webm" onError={() => undefined} /><source src={HERO_VIDEO_MP4} type="video/mp4" onError={() => setVidOk(false)} /></video>}<div className="hp__shade" />
        <div className="hp__heroText"><p className="eyebrow">{t('Prototype · demo data')}</p>
        <h1>{words.map((w, i) => <motion.span key={i} initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 + i * .07, duration:.6 }}>{w}&nbsp;</motion.span>)}</h1>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.8 }}>{t("SIRKULA connects generators, processors, transport, communities, sellers, and buyers, and keeps every step of a material's journey traceable.")}</motion.p>
        <motion.div className="hp__btns" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }}><Link to="/login" className="cta">{t('Explore the platform')}</Link><a href="#how" className="ghost">{t('How it works')}</a></motion.div></div>
        <motion.div className="hp__heroArt" style={{ y }}><Flow sel={-1} small /></motion.div></header>
      <section className="hp__sec dark"><motion.h2 {...rise}>{t('Material flows are fragmented')}</motion.h2>
        <div className="hp__probs">{['Fragmented material supply', 'Limited processor visibility', 'Hard-to-prove traceability', 'Disconnected communities', 'Incomplete impact reporting'].map((p, i) => <motion.p key={p} {...rise} transition={{ ...rise.transition, delay:i * .08 }}><span>0{i + 1}</span>{t(p)}</motion.p>)}</div></section>
      <section id="how" className="hp__sec"><motion.h2 {...rise}>{t('How SIRKULA works')}</motion.h2><motion.p className="lead" {...rise}>{t('Select a stage to see who is involved and what is recorded.')}</motion.p>
        <div className="hp__flow"><Flow sel={sel} onSel={setSel} /><AnimatePresence mode="wait"><motion.div key={sel} className="hp__stage" initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }} transition={{ duration:.2 }}>
          <h3>{sel + 1}. {t(stages[sel].n)}</h3><p>{t(stages[sel].d)}</p><p><b>{t('Actors')}:</b> {t(stages[sel].who)}</p><p><b>{t('Recorded')}:</b> {t(stages[sel].rec)}</p></motion.div></AnimatePresence></div></section>
      <section id="features" className="hp__sec tint"><motion.h2 {...rise}>{t('Six systems, one platform')}</motion.h2>
        <div className="hp__feat">{features.map(([ti, d, to], i) => <motion.div key={ti} {...rise} transition={{ ...rise.transition, delay:(i % 3) * .08 }}><Link to={to}><h3>{t(ti)}</h3><p>{t(d)}</p><span>{t('Open')} →</span></Link></motion.div>)}</div></section>
      <section id="impact" className="hp__sec"><motion.h2 {...rise}>{t('Impact at a glance')}</motion.h2><p className="lead">{t('DEMONSTRATION DATA. These figures are not real SIRKULA performance.')}</p>
        <div className="hp__kpis"><div><b><Count to={4800} /></b><span>{t('kg registered (demo)')}</span></div><div><b><Count to={3200} /></b><span>{t('kg processed (demo)')}</span></div><div><b><Count to={86} suffix="%" /></b><span>{t('evidence complete (demo)')}</span></div></div>
        <div className="hp__charts"><motion.div {...rise}><h4>{t('Collected vs processed (demo)')}</h4><ResponsiveContainer width="100%" height={200}><AreaChart data={flowSeries}><XAxis dataKey="m" /><Tooltip /><Area dataKey="collected" stroke="#123b2a" fill="#b9c9b4" /><Area dataKey="processed" stroke="#7fe0b0" fill="#c5f26b" /></AreaChart></ResponsiveContainer></motion.div>
          <motion.div {...rise}><h4>{t('Processed per month (demo)')}</h4><ResponsiveContainer width="100%" height={200}><BarChart data={flowSeries}><XAxis dataKey="m" /><Tooltip /><Bar dataKey="processed" fill="#1b5239" /></BarChart></ResponsiveContainer></motion.div></div></section>
      <section className="hp__sec tint"><motion.h2 {...rise}>{t('Circular marketplace')}</motion.h2>
        <div className="hp__prod">{demoProducts.slice(0, 4).map(p => <Link key={p.id} to={`/app/marketplace/${p.id}`}><div style={{ background:`linear-gradient(135deg,hsl(${p.hue} 40% 82%),hsl(${p.hue} 45% 55%))` }}>{p.name[0]}</div><h4>{t(p.name)}</h4><p>{p.seller} · ${p.price}</p><small>{t(p.traceable ? 'Origin record available' : 'No origin record')}</small></Link>)}</div></section>
      <section className="hp__sec dark center"><motion.h2 {...rise}>{t('Explore the prototype')}</motion.h2><p className="lead">{t('Sign in with demo access and try matching, tracking, and orders.')}</p><Link to="/login" className="cta">{t('Enter demo')}</Link></section>
      <footer className="hp__foot"><span>{t('SIRKULA · Prototype with demo data')}</span><div><a href="#how">{t('How it works')}</a><Link to="/app/marketplace">{t('Marketplace')}</Link><Link to="/login">{t('Sign in')}</Link><Link to="/register">{t('Register')}</Link></div></footer>
    </div>
  )
}
