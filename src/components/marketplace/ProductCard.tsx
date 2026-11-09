import { Link } from 'react-router-dom'
import { Leaf, Recycle, Handshake, ShoppingBasket } from 'lucide-react'
import { useT } from '../../i18n'
import { rupiah } from '../../lib/pricing'
import { MK_CATEGORIES, SOURCE_LABEL } from '../../config/marketplace'
import type { Product } from '../../types'

const ICON = { farm: Leaf, upcycle: Recycle, partner: Handshake } as const
export const emojiOf = (cat: string) => MK_CATEGORIES.find(c => c.key === cat)?.emoji ?? '📦'

export default function ProductCard({ p, onAdd }: { p: Product; onAdd: (id: string) => void }) {
  const { t } = useT()
  const src = p.source ?? 'upcycle', Icon = ICON[src]
  const out = p.stock === 0, low = p.stock > 0 && p.stock <= 5
  return (
    <article className={`mkc${out ? ' mkc--out' : ''}`}>
      <Link to={`/app/marketplace/${p.id}`} className="mkc__link" aria-label={t(p.name)}>
        <div className="mkc__img" style={{ background: `linear-gradient(145deg,hsl(${p.hue} 55% 90%),hsl(${p.hue} 50% 70%))` }}>
          <span className="mkc__emoji" aria-hidden="true">{emojiOf(p.category)}</span>
          <span className={`mkc__tag mkc__tag--${src}`}><Icon size={12} aria-hidden="true" />{t(SOURCE_LABEL[src])}</span>
          {out && <span className="mkc__sold">{t('Out of stock')}</span>}
        </div>
      </Link>
      <div className="mkc__body">
        <Link to={`/app/marketplace/${p.id}`} className="mkc__name">{t(p.name)}</Link>
        <p className="mkc__meta">{p.seller} · {p.region}</p>
        {src === 'farm' && <p className="mkc__circ"><Handshake size={12} aria-hidden="true" />{t('Circular result between partners')}</p>}
        <div className="mkc__foot">
          <div>
            <b className="mkc__price">{rupiah(p.price)}</b><span className="mkc__unit"> / {p.unit ?? 'pcs'}</span>
            {low && <small className="mkc__low">{t('Only {n} left', { n: p.stock })}</small>}
          </div>
          <button type="button" className="mkc__add" disabled={out} onClick={() => onAdd(p.id)} aria-label={`${t('Add to cart')}: ${t(p.name)}`}>
            <ShoppingBasket size={16} aria-hidden="true" />{t('Add')}
          </button>
        </div>
      </div>
    </article>
  )
}
