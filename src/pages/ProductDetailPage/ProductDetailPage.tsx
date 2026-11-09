import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import { rupiah } from '../../lib/pricing'
import { FARM_NOTE, FARM_NOTE_TITLE, SOURCE_LABEL } from '../../config/marketplace'
import { emojiOf } from '../../components/marketplace/ProductCard'
import './ProductDetailPage.css'
export default function ProductDetailPage() {
  const { productId } = useParams(), { products, addToCart } = useStore(), { t } = useT(); const [qty, setQty] = useState(1), [shade, setShade] = useState(0)
  const p = products.find(x => x.id === productId)
  if (!p) return <div className="pd"><h1>{t('Product not found')}</h1><Link to="/app/marketplace">{t('Back to marketplace')}</Link></div>
  const rel = products.filter(x => x.category === p.category && x.id !== p.id)
  return (
    <div className="pd">
      <Link to="/app/marketplace">← {t('Marketplace')}</Link>
      <div className="pd__main">
        <div><div className="pd__img" style={{ background:`linear-gradient(135deg,hsl(${p.hue + shade * 25} 40% 82%),hsl(${p.hue + shade * 25} 45% 55%))` }}><span aria-hidden="true">{emojiOf(p.category)}</span></div>
          <div className="pd__th">{[0, 1, 2].map(i => <button key={i} onClick={() => setShade(i)} className={i === shade ? 'on' : ''} style={{ background:`hsl(${p.hue + i * 25} 45% 60%)` }} aria-label={`${t('View')} ${i + 1}`} />)}</div></div>
        <div className="pd__info"><h1>{t(p.name)}</h1><p className="pd__muted">{p.seller} · {t(p.category)} · {t(p.region)}</p><p className="pd__price">{rupiah(p.price)}<small> / {p.unit ?? 'pcs'}</small></p><p><span className="pd__src">{t(SOURCE_LABEL[p.source ?? 'upcycle'])}</span></p><p>{t(p.desc)}</p>
          <p className={p.stock <= 5 ? 'pd__warn' : 'pd__muted'}>{p.stock === 0 ? t('Out of stock') : t('{n} in stock', { n:p.stock })}</p>
          <div className="pd__buy"><input type="number" min={1} max={Math.max(1, p.stock)} value={qty} onChange={e => setQty(Math.max(1, Math.min(p.stock || 1, +e.target.value)))} aria-label={t('Quantity')} /><button disabled={p.stock === 0} onClick={() => addToCart(p.id, qty)}>{t('Add to cart')}</button></div>
          {p.source === 'farm' && <div className="pd__farm"><h3>{t(FARM_NOTE_TITLE)}</h3><p>{t(FARM_NOTE)}</p></div>}
          <div className="pd__origin"><h3>{t('Material origin')}</h3>{p.origin ? <><p>{t(p.origin)}</p>{p.batchId && <p className="pd__muted">{t('Linked batch:')} <Link to="/app/orders">{p.batchId}</Link>. {t('A recorded origin is not the same as independent verification.')}</p>}</> : <p>{t('No origin information has been recorded for this product.')}</p>}</div></div>
      </div>
      {rel.length > 0 && <section><h3>{t('Related products')}</h3><div className="pd__rel">{rel.map(r => <Link key={r.id} to={`/app/marketplace/${r.id}`}>{t(r.name)} · {rupiah(r.price)}</Link>)}</div></section>}
    </div>
  )
}
