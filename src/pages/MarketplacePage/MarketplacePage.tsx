import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import RangeInput from '../../components/ui/RangeInput'
import './MarketplacePage.css'
export default function MarketplacePage() {
  const { products, cart, user, addToCart, removeFromCart, placeOrder, addProduct, notify } = useStore(); const { t } = useT()
  const [q, setQ] = useState(''), [cat, setCat] = useState(''), [seller, setSeller] = useState(''), [max, setMax] = useState(100), [inStock, setInStock] = useState(false), [trace, setTrace] = useState(false), [sort, setSort] = useState('new')
  const [np, setNp] = useState({ name:'', price:'', stock:'' })
  const cats = [...new Set(products.map(p => p.category))], sellers = [...new Set(products.map(p => p.seller))]
  const rows = useMemo(() => products.filter(p => (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (!cat || p.category === cat) && (!seller || p.seller === seller) && p.price <= max && (!inStock || p.stock > 0) && (!trace || p.traceable))
    .sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0), [products, q, cat, seller, max, inStock, trace, sort])
  const lines = cart.map(c => ({ ...c, p: products.find(p => p.id === c.productId)! })).filter(l => l.p)
  const sub = lines.reduce((a, l) => a + l.qty * l.p.price, 0)
  const add = () => { const price = Number(np.price), stock = Number(np.stock); if (!np.name.trim() || !(price > 0) || !(stock >= 0) || np.stock === '') return notify('Name, price above 0, and stock are required')
    addProduct({ name:np.name.trim(), price, stock, seller:user?.org ?? 'Demo Organization', category:'Other' }); setNp({ name:'', price:'', stock:'' }); notify('Listing added') }
  return (
    <div className="mk">
      <header><h1>{t('Circular marketplace')}</h1><p>{t('Sample products, prices in USD (demo). Images are colour placeholders. No payments are processed.')}</p></header>
      <div className="mk__f"><input placeholder={t('Search products')} value={q} onChange={e => setQ(e.target.value)} />
        <Select value={cat} onChange={setCat} options={[{ value:'', label:t('All categories') }, ...cats.map(c => ({ value:c, label:t(c) }))]} />
        <Select value={seller} onChange={setSeller} options={[{ value:'', label:t('All sellers') }, ...sellers]} />
        <label className="mk__rng">{t('Max')} ${max}<RangeInput min={5} max={100} value={max} onChange={setMax} label={t('Max price')} /></label>
        <label><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} /> {t('In stock')}</label><label><input type="checkbox" checked={trace} onChange={e => setTrace(e.target.checked)} /> {t('Has origin record')}</label>
        <Select value={sort} onChange={setSort} options={[{ value:'new', label:t('Newest') }, { value:'low', label:t('Price: low to high') }, { value:'high', label:t('Price: high to low') }]} /></div>
      <div className="mk__cols">
        {rows.length === 0 ? <p className="mk__muted">{t('No products match these filters.')}</p> : <div className="mk__grid">{rows.map(p => <article key={p.id} className="mk__card">
          <Link to={`/app/marketplace/${p.id}`}><div className="mk__img" style={{ background:`linear-gradient(135deg,hsl(${p.hue} 40% 82%),hsl(${p.hue} 45% 55%))` }}>{p.name[0]}</div><h3>{t(p.name)}</h3></Link>
          <p className="mk__muted">{p.seller} · {t(p.category)}</p><p><b>${p.price}</b> · {p.stock === 0 ? t('Out of stock') : p.stock <= 5 ? t('Only {n} left', { n:p.stock }) : t('In stock')}</p>
          <small>{t(p.traceable ? 'Origin record available' : 'No origin record')}</small><button disabled={p.stock === 0} onClick={() => addToCart(p.id, 1)}>{t('Add to cart')}</button></article>)}</div>}
        <aside className="mk__cart"><h3>{t('Cart')}</h3>{lines.length === 0 ? <p className="mk__muted">{t('Empty.')}</p> : lines.map(l => <p key={l.productId} className="mk__line">{l.qty} × {t(l.p.name)}<button className="x" onClick={() => removeFromCart(l.productId)}>×</button></p>)}
          <p><b>{t('Subtotal')} ${sub}</b></p><small className="mk__muted">{t('Shipping and tax not included. Creates a prototype order only.')}</small><button disabled={!lines.length} onClick={placeOrder}>{t('Place prototype order')}</button>
          {user?.role === 'seller' && <div className="mk__sell"><h4>{t('Add listing')}</h4><input placeholder={t('Name')} value={np.name} onChange={e => setNp({ ...np, name:e.target.value })} /><input placeholder={t('Price')} type="number" value={np.price} onChange={e => setNp({ ...np, price:e.target.value })} /><input placeholder={t('Stock')} type="number" value={np.stock} onChange={e => setNp({ ...np, stock:e.target.value })} /><button onClick={add}>{t('Add')}</button></div>}</aside>
      </div>
    </div>
  )
}
