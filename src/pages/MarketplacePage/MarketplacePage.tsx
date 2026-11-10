import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, ShoppingBasket, Handshake, Leaf, Store, ClipboardList, ShoppingBag } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import ProductCard from '../../components/marketplace/ProductCard'
import CartDrawer from '../../components/marketplace/CartDrawer'
import OrdersPanel from '../../components/marketplace/OrdersPanel'
import SellerPanel from '../../components/marketplace/SellerPanel'
import { MK_CATEGORIES, FARM_NOTE, FARM_NOTE_TITLE, SOURCE_LABEL } from '../../config/marketplace'
import type { ProductSource } from '../../types'
import './MarketplacePage.css'

type SrcFilter = '' | ProductSource
const SRC_OPTS: SrcFilter[] = ['', 'farm', 'upcycle', 'partner']

/**
 * Marketplace: satu halaman untuk belanja, pesanan, dan toko saya (mitra penjual).
 * Link langsung: /app/marketplace#orders  /app/marketplace#sell
 */
export default function MarketplacePage() {
  const { products, orders, cart, addToCart } = useStore(); const { t } = useT(); const { hash } = useLocation()
  const [active, setActive] = useState<'shop' | 'orders' | 'sell'>('shop')
  const [q, setQ] = useState(''), [cat, setCat] = useState(''), [src, setSrc] = useState<SrcFilter>(''), [inStock, setInStock] = useState(false), [sort, setSort] = useState('new'), [open, setOpen] = useState(false)
  const shop = useRef<HTMLDivElement>(null), ord = useRef<HTMLElement>(null), sell = useRef<HTMLElement>(null)
  const go = (r: React.RefObject<HTMLElement | HTMLDivElement | null>) => r.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  useEffect(() => { if (hash === '#orders') setTimeout(() => go(ord), 80); else if (hash === '#sell') setTimeout(() => go(sell), 80) }, [hash])

  // Sorot tombol bar yang sesuai dengan bagian yang sedang terlihat.
  useEffect(() => {
    const els: [typeof active, Element | null][] = [['shop', shop.current], ['orders', ord.current], ['sell', sell.current]]
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { const k = els.find(x => x[1] === e.target)?.[0]; if (k) setActive(k) } }) }, { rootMargin: '-35% 0px -55% 0px' })
    els.forEach(([, el]) => el && io.observe(el)); return () => io.disconnect()
  }, [])

  const catCount = useMemo(() => { const m: Record<string, number> = {}; products.forEach(p => { m[p.category] = (m[p.category] ?? 0) + 1 }); return m }, [products])
  const rows = useMemo(() => products
    .filter(p => (!q || (p.name + ' ' + p.seller).toLowerCase().includes(q.toLowerCase())) && (!cat || p.category === cat) && (!src || (p.source ?? 'upcycle') === src) && (!inStock || p.stock > 0))
    .sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0), [products, q, cat, src, inStock, sort])
  const cartQty = cart.reduce((a, c) => a + c.qty, 0)
  const farmCount = products.filter(p => p.source === 'farm').length
  const chooseSrc = (s: SrcFilter) => { setSrc(s); go(shop) }

  return (
    <div className="mk">
      <header className="mk__head">
        <div><span className="mk__eyebrow">{t('Marketplace')}</span><h1>{t('Circular marketplace')}</h1>
          <p>{t('Fresh produce from partner farmers and products made from recovered material. Prices in rupiah (demo, no payments).')}</p></div>
        <button type="button" className="mk-btn mk__cartbtn" onClick={() => setOpen(true)} aria-label={`${t('Cart')} (${cartQty})`}><ShoppingBasket size={18} aria-hidden="true" />{t('Cart')}{cartQty > 0 && <i>{cartQty}</i>}</button>
      </header>

      <nav className="mk__jump" aria-label={t('Marketplace')}>
        <button type="button" className={active === 'shop' ? 'on' : ''} onClick={() => go(shop)}><ShoppingBag size={16} aria-hidden="true" />{t('Shop')}</button>
        <button type="button" className={active === 'orders' ? 'on' : ''} onClick={() => go(ord)}><ClipboardList size={16} aria-hidden="true" />{t('Orders')}<i>{orders.length}</i></button>
        <button type="button" className={active === 'sell' ? 'on' : ''} onClick={() => go(sell)}><Store size={16} aria-hidden="true" />{t('Sell on SIRKULA')}</button>
      </nav>

      <section className="mk__farm" aria-label={t(FARM_NOTE_TITLE)}>
        <div className="mk__farmIco"><Leaf size={26} aria-hidden="true" /></div>
        <div className="mk__farmTxt"><h2>{t('Fresh from partner farmers')}</h2><p><b>{t(FARM_NOTE_TITLE)}.</b> {t(FARM_NOTE)}</p></div>
        <button type="button" className="mk-btn mk-btn--light" onClick={() => chooseSrc('farm')}><Handshake size={16} aria-hidden="true" />{t('See {n} farm products', { n: farmCount })}</button>
      </section>

      <div ref={shop} className="mk__shop">
        <div className="mk__cats" role="group" aria-label={t('Categories')}>
          <button type="button" className={!cat ? 'on' : ''} aria-pressed={!cat} onClick={() => setCat('')}><span aria-hidden="true">✨</span>{t('All')}<i>{products.length}</i></button>
          {MK_CATEGORIES.filter(c => catCount[c.key]).map(c => <button key={c.key} type="button" className={cat === c.key ? 'on' : ''} aria-pressed={cat === c.key} onClick={() => setCat(cat === c.key ? '' : c.key)}><span aria-hidden="true">{c.emoji}</span>{t(c.label)}<i>{catCount[c.key]}</i></button>)}
        </div>
        <div className="mk__bar">
          <label className="mk__search"><Search size={16} aria-hidden="true" /><input placeholder={t('Search products or sellers')} value={q} onChange={e => setQ(e.target.value)} aria-label={t('Search products or sellers')} /></label>
          <div className="mk__seg" role="group" aria-label={t('Product source')}>{SRC_OPTS.map(s => <button key={s || 'all'} type="button" className={src === s ? 'on' : ''} aria-pressed={src === s} onClick={() => setSrc(s)}>{s ? t(SOURCE_LABEL[s]) : t('All')}</button>)}</div>
          <label className="mk__chk"><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />{t('In stock')}</label>
          <Select value={sort} onChange={setSort} options={[{ value: 'new', label: t('Newest') }, { value: 'low', label: t('Price: low to high') }, { value: 'high', label: t('Price: high to low') }]} />
        </div>
        <p className="mk__count" aria-live="polite">{t('{n} products', { n: rows.length })}</p>
        {rows.length === 0 ? <p className="mk__muted mk__empty">{t('No products match these filters.')}</p> : <div className="mk__grid">{rows.map(p => <ProductCard key={p.id} p={p} onAdd={id => addToCart(id, 1)} />)}</div>}
      </div>

      <section ref={ord} className="mk__sec" aria-labelledby="mk-orders"><h2 id="mk-orders"><ClipboardList size={20} aria-hidden="true" />{t('Orders')}</h2><p className="mk__muted">{t('All prototype orders')}. {t('No real payments or shipments.')}</p><OrdersPanel /></section>
      <section ref={sell} className="mk__sec" aria-labelledby="mk-sell"><h2 id="mk-sell"><Store size={20} aria-hidden="true" />{t('Sell on SIRKULA')}</h2><SellerPanel /></section>

      <CartDrawer open={open} onClose={() => setOpen(false)} onOrdered={() => setTimeout(() => go(ord), 120)} />
    </div>
  )
}
