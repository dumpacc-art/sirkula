import { useEffect, useRef, useState } from 'react'
import { LocateFixed, MapPin, Search, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import MapPicker, { type MapFocus } from '../map/MapPicker'
import { geocode, locate, reverseDetailed, LocationError, type Resolved } from '../../lib/geo'
import type { Pt } from '../../lib/pricing'
import type { PickupLocation } from '../../types'
import './PickupLocationStep.css'

type GpsState = 'idle' | 'loading' | 'ok' | 'denied' | 'error'
type AddrState = 'idle' | 'loading' | 'ok' | 'approx' | 'noroad' | 'failed'

/** Onboarding step 1. Progress is saved to the store (localStorage) after every change, so a reload keeps it. */
export default function PickupLocationStep({ onDone }: { onDone: () => void }) {
  const { onboarding, updateOnboarding } = useStore(); const { t } = useT()
  const saved: Partial<PickupLocation> = onboarding.draft ?? onboarding.pickup ?? {}
  const [pos, setPos] = useState<Pt | null>(saved.lat != null && saved.lng != null ? { lat: saved.lat, lng: saved.lng } : null)
  const [source, setSource] = useState<PickupLocation['source']>(saved.source ?? 'manual')
  const [accuracy, setAccuracy] = useState<number | undefined>(saved.accuracy)
  const [focus, setFocus] = useState<MapFocus | null>(null)
  const [addressText, setAddressText] = useState(saved.addressText ?? '')
  const [building, setBuilding] = useState(saved.building ?? '')
  const [floor, setFloor] = useState(saved.floor ?? '')
  const [landmark, setLandmark] = useState(saved.landmark ?? '')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false); const [searchErr, setSearchErr] = useState('')
  const [gps, setGps] = useState<GpsState>('idle'); const [gpsMsg, setGpsMsg] = useState('')
  const [err, setErr] = useState<{ pos?: string; addressText?: string }>({})
  // Address filled automatically (search, map or GPS). It is only replaced while the user has not typed their own text.
  const autoAddr = useRef(saved.addressText ?? '')
  const addrRef = useRef(addressText); addrRef.current = addressText
  const seq = useRef(0)
  const revSeq = useRef(0)
  const [addrState, setAddrState] = useState<AddrState>('idle'); const [detected, setDetected] = useState<Resolved | null>(null)

  useEffect(() => {
    updateOnboarding({ draft: { lat: pos?.lat, lng: pos?.lng, addressText, building, floor, landmark, source, accuracy } })
  }, [pos, addressText, building, floor, landmark, source, accuracy])

  const place = (p: Pt, src: PickupLocation['source'], label?: string, acc?: number) => {
    setPos(p); setSource(src); setAccuracy(acc); setErr(e => ({ ...e, pos: undefined }))
    seq.current += 1; setFocus({ ...p, n: seq.current })
    if (label) fillAddress(label)
  }
  const fillAddress = (label: string) => {
    if (!addrRef.current.trim() || addrRef.current === autoAddr.current) { setAddressText(label); addrRef.current = label }
    autoAddr.current = label
  }
  /** Looks up the real street name for a point. Only the newest lookup may update the form. */
  const resolveAddress = async (p: Pt) => {
    const id = ++revSeq.current
    setAddrState('loading'); setDetected(null)
    const r = await reverseDetailed(p)
    if (id !== revSeq.current) return
    if (!r) { setAddrState('failed'); return }
    setDetected(r)
    setAddrState(!r.parts.road ? 'noroad' : r.approx ? 'approx' : 'ok')
    fillAddress(r.label)
  }

  const onMapPick = (p: Pt) => { place(p, 'map'); resolveAddress(p) }

  const search = async () => {
    if (query.trim().length < 3) { setSearchErr('Enter at least 3 characters'); return }
    setSearching(true); setSearchErr('')
    try { const r = await geocode(query); const p = { lat: r.lat, lng: r.lng }; place(p, 'search', r.label); resolveAddress(p) }
    catch (e: any) { setSearchErr(e.message || 'Gagal mencari alamat.') }
    finally { setSearching(false) }
  }

  const useGps = async () => {
    setGps('loading'); setGpsMsg('')
    try {
      const p = await locate()
      place({ lat: p.lat, lng: p.lng }, 'gps', undefined, p.accuracy)
      setGps('ok')
      resolveAddress({ lat: p.lat, lng: p.lng })
    } catch (e: any) {
      setGps(e instanceof LocationError && e.code === 'denied' ? 'denied' : 'error')
      setGpsMsg(e.message || '')
    }
  }

  const next = () => {
    const x: typeof err = {}
    if (!pos) x.pos = 'Mark a location on the map, search an address, or use your current location'
    if (addressText.trim().length < 5) x.addressText = 'Fill in the full address (at least 5 characters)'
    setErr(x)
    if (!pos || Object.keys(x).length) return
    updateOnboarding({
      pickup: { lat: pos.lat, lng: pos.lng, addressText: addressText.trim(), building: building.trim(), floor: floor.trim(), landmark: landmark.trim(), source, accuracy, savedAt: new Date().toISOString() },
      draft: null,
    })
    onDone()
  }

  return (
    <section className="pls" aria-labelledby="pls-title">
      <header className="pls__head">
        <h2 id="pls-title">{t('Pickup location')}</h2>
        <p>{t('Where should we collect your waste?')}</p>
      </header>

      <div className="pls__search">
        <span className="pls__inwrap"><Search size={16} aria-hidden="true" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('Search address or landmark')} aria-label={t('Search address')}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); search() } }} /></span>
        <Button variant="secondary" loading={searching} onClick={search}>{t('Search')}</Button>
      </div>
      {searchErr && <p className="pls__err" role="alert">{t(searchErr)}</p>}

      <MapPicker value={pos} focus={focus} onChange={onMapPick} />
      <p className="pls__hint" aria-live="polite">
        {pos ? `${t('Coordinates')}: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : t('Click the map or drag the pin to set the exact spot.')}
      </p>

      <div className="pls__gps">
        <Button variant="ghost" icon={<LocateFixed size={16} />} loading={gps === 'loading'} onClick={useGps}>
          {gps === 'loading' ? t('Detecting your location…') : t('Use current location')}
        </Button>
        {gps === 'ok' && <span className="pls__ok" role="status">{t('Location detected')}{accuracy ? ` · ${t('Accuracy ±{m} m', { m: Math.round(accuracy) })}` : ''}</span>}
        {gps === 'denied' && <div className="pls__state pls__state--denied" role="alert">
          <b>{t('Location access denied')}</b><p>{t('Allow location access for this site in your browser settings, then try again. You can also search or pin the address manually.')}</p>
        </div>}
        {gps === 'error' && <div className="pls__state pls__state--error" role="alert">
          <b>{t('Could not read your location')}</b><p>{t(gpsMsg)}</p>
        </div>}
      </div>

      <div className="pls__fields">
        <label className="pls__full">{t('Full address')}
          {addrState === 'loading' && (!addressText.trim() || addressText === autoAddr.current)
            ? <span className="pls__sk" role="status" aria-busy="true" aria-label={t('Detecting the street name…')}><Skeleton h={12} /><Skeleton h={12} w="72%" /><Skeleton h={10} w="45%" /></span>
            : <textarea rows={2} value={addressText} onChange={e => setAddressText(e.target.value)} aria-invalid={!!err.addressText} />}
          {err.addressText && <em>{t(err.addressText)}</em>}
        </label>
        {addrState !== 'idle' && addrState !== 'loading' && (
          <div className={`pls__road pls__road--${addrState === 'ok' ? 'ok' : 'warn'} pls__full`} role="status">
            {addrState === 'ok' && <><MapPin size={15} /><span>{t('Street detected')}: <b>{detected?.parts.road}</b></span></>}
            {addrState === 'approx' && <><MapPin size={15} /><span>{t('Nearest street')}: <b>{detected?.parts.road}</b>{detected?.roadDistanceM != null && ` · ±${detected.roadDistanceM} m`}. {t('Drag the pin onto the road for an exact match.')}</span></>}
            {addrState === 'noroad' && <><AlertTriangle size={15} /><span>{t('No street name found at this point. Move the pin onto a road or type the street name yourself.')}</span></>}
            {addrState === 'failed' && <><AlertTriangle size={15} /><span>{t('Could not look up the street name. Type the address yourself.')}</span></>}
          </div>
        )}
        {gps === 'ok' && accuracy != null && accuracy > 50 && (
          <div className="pls__road pls__road--warn pls__full" role="status"><AlertTriangle size={15} /><span>{t('GPS accuracy is low (±{m} m). Check the pin and street name, then adjust if needed.', { m: Math.round(accuracy) })}</span></div>
        )}
        <label>{t('Building name')}<input value={building} onChange={e => setBuilding(e.target.value)} /></label>
        <label>{t('Floor')}<input value={floor} onChange={e => setFloor(e.target.value)} placeholder="3" /></label>
        <label className="pls__full">{t('Landmark instructions')}
          <textarea rows={2} value={landmark} onChange={e => setLandmark(e.target.value)} placeholder={t('Ex: Across from the blue gate, behind the mosque')} />
        </label>
      </div>

      {err.pos && <p className="pls__err" role="alert">{t(err.pos)}</p>}
      <div className="pls__actions"><Button size="lg" onClick={next}>{t('Continue')}</Button></div>
    </section>
  )
}
