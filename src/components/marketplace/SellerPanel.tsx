import { useState } from 'react'
import { Store, Plus, Pencil, Trash2, Sprout, Recycle, Handshake } from 'lucide-react'
import { useStore, userIdOf } from '../../store/StoreContext'
import { useT } from '../../i18n'
import { rupiah } from '../../lib/pricing'
import { MK_CATEGORIES, UNITS, formatThousands, parseThousands } from '../../config/marketplace'
import Select from '../ui/Select'
import Modal from '../ui/Modal'
import SuccessCard from '../ui/SuccessCard'
import PriceInput from './PriceInput'
import { emojiOf } from './ProductCard'
import type { Product, SellerProfile } from '../../types'

const KINDS: { key: SellerProfile['kind']; label: string; hint: string; Icon: typeof Sprout }[] = [
  { key: 'petani', label: 'Farmer', hint: 'Vegetables, fruit, staples', Icon: Sprout },
  { key: 'olahan', label: 'Recycler / maker', hint: 'Products made from recovered material', Icon: Recycle },
  { key: 'umkm', label: 'Other partner', hint: 'Any circular product', Icon: Handshake },
]
const REGIONS = ['Bali', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'DKI Jakarta', 'Sumatera', 'Kalimantan', 'Sulawesi', 'Nusa Tenggara']
const SRC = { petani: 'farm', olahan: 'upcycle', umkm: 'partner' } as const

/** Daftar jadi mitra penjual + kelola produk sendiri (nama, harga, stok, dll). */
export default function SellerPanel() {
  const { user, sellers, products, orders, registerSeller, addProduct, updateProduct, deleteProduct, notify } = useStore(); const { t } = useT()
  const me = user ? sellers.find(s => s.ownerId === userIdOf(user.email)) : undefined
  const mine = me ? products.filter(p => p.mine && p.sellerId === me.ownerId) : []
  const [reg, setReg] = useState(false), [rf, setRf] = useState({ shopName: user?.org ?? '', kind: 'petani' as SellerProfile['kind'], region: 'Bali', about: '' })
  const [edit, setEdit] = useState<Product | 'new' | null>(null), [welcome, setWelcome] = useState<string | null>(null)
  const welcomeEl = welcome && <SuccessCard title="Welcome, selling partner!" message="Your shop is open. Add your first product, set the price and stock, and shoppers will see it in the marketplace." actionLabel="Add my first product" facts={[['Shop', welcome]]} onDone={() => { setWelcome(null); openForm('new') }} />
  const empty = { name: '', category: 'Vegetables', unit: 'kg', price: '', stock: '', desc: '' }
  const [f, setF] = useState(empty)
  const incoming = me ? orders.filter(o => o.lines.some(l => mine.some(p => p.id === l.productId))) : []

  const openForm = (p: Product | 'new') => { setEdit(p); setF(p === 'new' ? { ...empty, category: me?.kind === 'petani' ? 'Vegetables' : 'Home', unit: me?.kind === 'petani' ? 'kg' : 'pcs' } : { name: p.name, category: p.category, unit: p.unit ?? 'pcs', price: formatThousands(p.price), stock: String(p.stock), desc: p.desc }) }
  const submitReg = () => { if (rf.shopName.trim().length < 3) return notify('Shop name needs at least 3 characters'); registerSeller({ shopName: rf.shopName.trim(), region: rf.region, about: rf.about.trim(), kind: rf.kind }); setReg(false); setWelcome(rf.shopName.trim()) }
  const save = () => {
    const price = parseThousands(f.price), stock = parseThousands(f.stock)
    if (!f.name.trim() || price < 100 || f.stock === '') return notify('Name, price (at least Rp100) and stock are required')
    if (edit && edit !== 'new') { updateProduct(edit.id, { name: f.name.trim(), category: f.category, unit: f.unit, price, stock, desc: f.desc.trim() || edit.desc }); notify('Listing updated') }
    else if (addProduct({ name: f.name.trim(), category: f.category, unit: f.unit, price, stock, desc: f.desc.trim(), source: SRC[me?.kind ?? 'umkm'] })) notify('Listing added')
    setEdit(null)
  }

  if (!me) return (<>{welcomeEl}
    <div className="mks mks--cta">
      <div className="mks__ico"><Store size={28} aria-hidden="true" /></div>
      <div className="mks__txt">
        <h3>{t('Become a selling partner')}</h3>
        <p>{t('Farmers, recyclers and makers can list products here. You set the name, price and stock. Takes about a minute.')}</p>
      </div>
      <button type="button" className="mk-btn" onClick={() => setReg(true)}>{t('Register as partner')}</button>
      <Modal open={reg} title={t('Register as selling partner')} onClose={() => setReg(false)}>
        <div className="mkf">
          <label>{t('Shop name')}<input value={rf.shopName} onChange={e => setRf({ ...rf, shopName: e.target.value })} placeholder={t('e.g. Tani Subak Baturiti')} /></label>
          <fieldset className="mkf__kinds"><legend>{t('What do you sell?')}</legend>
            {KINDS.map(({ key, label, hint, Icon }) => <button key={key} type="button" className={rf.kind === key ? 'on' : ''} aria-pressed={rf.kind === key} onClick={() => setRf({ ...rf, kind: key })}><Icon size={18} aria-hidden="true" /><b>{t(label)}</b><small>{t(hint)}</small></button>)}
          </fieldset>
          <label>{t('Region')}<Select value={rf.region} onChange={v => setRf({ ...rf, region: v })} options={REGIONS} /></label>
          <label>{t('About your shop (optional)')}<textarea rows={3} value={rf.about} onChange={e => setRf({ ...rf, about: e.target.value })} /></label>
          <button type="button" className="mk-btn" onClick={submitReg}>{t('Register')}</button>
        </div>
      </Modal>
    </div></>
  )

  return (
    <>{welcomeEl}<div className="mks">
      <div className="mks__head">
        <div><h3>{me.shopName}</h3><p className="mk__muted">{t(KINDS.find(k => k.key === me.kind)!.label)} · {me.region}</p></div>
        <button type="button" className="mk-btn" onClick={() => openForm('new')}><Plus size={16} aria-hidden="true" />{t('Sell a product')}</button>
      </div>
      <div className="mks__stats"><div><b>{mine.length}</b><span>{t('Listings')}</span></div><div><b>{mine.reduce((a, p) => a + p.stock, 0)}</b><span>{t('Units in stock')}</span></div><div><b>{incoming.length}</b><span>{t('Orders for you')}</span></div></div>
      {mine.length === 0 ? <p className="mk__muted">{t('No listings yet. Tap "Sell a product" to add your first one.')}</p> : (
        <ul className="mks__list">{mine.map(p => (
          <li key={p.id}>
            <span className="mks__em" aria-hidden="true">{emojiOf(p.category)}</span>
            <div className="mks__nm"><b>{t(p.name)}</b><small>{t(p.category)} · {p.stock} {p.unit ?? 'pcs'}</small></div>
            <b className="mks__pr">{rupiah(p.price)}<small> / {p.unit ?? 'pcs'}</small></b>
            <button type="button" className="mk-ico" onClick={() => openForm(p)} aria-label={`${t('Edit')} ${p.name}`}><Pencil size={15} /></button>
            <button type="button" className="mk-ico mk-ico--del" onClick={() => { if (window.confirm(t('Delete "{n}"?', { n: p.name }))) { deleteProduct(p.id); notify('Listing deleted') } }} aria-label={`${t('Delete')} ${p.name}`}><Trash2 size={15} /></button>
          </li>))}</ul>)}
      <Modal open={edit !== null} title={edit === 'new' ? t('Sell a product') : t('Edit listing')} onClose={() => setEdit(null)}>
        <div className="mkf">
          <label>{t('Product name')}<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder={me.kind === 'petani' ? t('e.g. Bayam hijau organik') : t('e.g. Denim laptop sleeve')} /></label>
          <div className="mkf__row">
            <label>{t('Category')}<Select value={f.category} onChange={v => setF({ ...f, category: v })} options={MK_CATEGORIES.map(c => ({ value: c.key, label: `${c.emoji} ${t(c.label)}` }))} /></label>
            <label>{t('Unit')}<Select value={f.unit} onChange={v => setF({ ...f, unit: v })} options={UNITS} /></label>
          </div>
          <div className="mkf__row">
            <label>{t('Price')}<PriceInput prefix="Rp" value={f.price} placeholder="12.000" onChange={v => setF({ ...f, price: v })} label={t('Price')} /></label>
            <label>{t('Stock')}<PriceInput value={f.stock} placeholder="100" onChange={v => setF({ ...f, stock: v })} label={t('Stock')} /></label>
          </div>
          {f.price && <small className="mk__muted">{t('Buyers will see')}: <b>{rupiah(parseThousands(f.price))}</b> / {f.unit}</small>}
          <label>{t('Description')}<textarea rows={3} value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} /></label>
          <button type="button" className="mk-btn" onClick={save}>{edit === 'new' ? t('Publish listing') : t('Save changes')}</button>
        </div>
      </Modal>
    </div></>
  )
}
