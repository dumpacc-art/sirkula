import { useState, type FormEvent } from 'react'
import { LocateFixed, Loader2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import './PickupModal.css'
type Geo = { lat: number; lng: number }
export default function PickupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { requestPickup, notify } = useStore(); const { t } = useT()
  const [qty, setQty] = useState(''), [addr, setAddr] = useState(''), [geo, setGeo] = useState<Geo | null>(null)
  const [busy, setBusy] = useState(false), [err, setErr] = useState<Record<string, string>>({})
  const close = () => { setQty(''); setAddr(''); setGeo(null); setErr({}); setBusy(false); onClose() }
  const locate = () => {
    if (!navigator.geolocation) { setErr(e => ({ ...e, loc: 'Location is not supported by this browser. Please type the address.' })); return }
    setBusy(true); setErr(e => ({ ...e, loc: '' }))
    navigator.geolocation.getCurrentPosition(
      pos => { setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setBusy(false) },
      () => { setBusy(false); setErr(e => ({ ...e, loc: 'Could not get your location. Allow location access or type the address.' })) },
      { enableHighAccuracy: true, timeout: 10000 })
  }
  const submit = (e: FormEvent) => {
    e.preventDefault(); const x: Record<string, string> = {}
    if (!(Number(qty) > 0)) x.qty = 'Weight must be greater than 0'
    if (!geo && !addr.trim()) x.loc = 'Detect your location or type an address'
    setErr(x); if (Object.keys(x).length) return
    requestPickup({ qty: Number(qty), address: addr.trim(), lat: geo?.lat, lng: geo?.lng, source: geo ? 'gps' : 'manual' })
    notify('Pickup request sent'); close()
  }
  return (
    <Modal open={open} title={t('Request food waste pickup')} onClose={close}>
      <form className="pk" onSubmit={submit} noValidate>
        <label>{t('Food waste weight (kg)')}
          <input type="number" min="0" step="any" value={qty} onChange={e => setQty(e.target.value)} placeholder={t('e.g. 25')} />
          {err.qty && <em>{t(err.qty)}</em>}
        </label>
        <div className="pk__loc">
          <span className="pk__lbl">{t('Pickup location')}</span>
          <button type="button" className="pk__geo" onClick={locate} disabled={busy}>
            {busy ? <Loader2 size={16} className="pk__spin" /> : <LocateFixed size={16} />}
            {t(busy ? 'Detecting location…' : 'Use my current location')}
          </button>
          {geo && <small className="pk__ok">{t('Location detected')}: {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)} ·
            <button type="button" onClick={() => setGeo(null)}>{t('Clear')}</button></small>}
          <label className="pk__or">{t(geo ? 'Address details (optional)' : 'Or type the address manually')}
            <input value={addr} onChange={e => setAddr(e.target.value)} placeholder={t('Street, area, city')} />
          </label>
          {err.loc && <em>{t(err.loc)}</em>}
        </div>
        <button type="submit" className="pk__submit">{t('Request food waste pickup')}</button>
      </form>
    </Modal>
  )
}
