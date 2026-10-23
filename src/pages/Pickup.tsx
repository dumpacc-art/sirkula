import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, BarChart3, LocateFixed, Search, MapPin, Navigation, AlertTriangle, Loader2, Mountain, Crown } from 'lucide-react'
import Select from '../components/ui/Select'
import { REGIONS, MAX_COVERAGE_KM, FIXED_FEE, calcPrice, nearestHub, nearestHubAny, rupiah, type Pt, type Hub } from '../lib/pricing'
import { geocode, locate, reverse, roadRoute, type Place, type RouteRes } from '../lib/geo'
import { MAPS_KEY, loadGoogleMaps, type G } from '../lib/googleMaps'
import { usePremium } from '../lib/premium'
import PremiumModal from '../components/PremiumModal'
import './Pickup.css'

const nf = (n: number, d = 1) => n.toLocaleString('id-ID', { maximumFractionDigits: d })

export default function Pickup() {
  const { premium } = usePremium(); const nav = useNavigate()
  const [regionId, setRegionId] = useState('bali'); const [w, setW] = useState('10')
  const [addr, setAddr] = useState(''); const [loc, setLoc] = useState<Place | null>(null)
  const [busy, setBusy] = useState<'' | 'addr' | 'gps'>(''); const [err, setErr] = useState('')
  const [route, setRoute] = useState<RouteRes | null>(null); const [routing, setRouting] = useState(false)
  const [gate, setGate] = useState(false)

  const region = REGIONS.find(r => r.id === regionId)!
  const near = useMemo(() => (loc ? nearestHub(loc, region) : null), [loc, region])
  const inRange = !!near && near.straightKm <= MAX_COVERAGE_KM

  // jarak dihitung sistem: setiap lokasi / wilayah berubah -> hitung ulang rute ke hub terdekat
  useEffect(() => {
    setRoute(null)
    if (!loc || !near || !inRange) return
    let dead = false; setRouting(true)
    roadRoute(loc, near.hub, region.roadFactor).then(r => { if (!dead) { setRoute(r); setRouting(false) } })
    return () => { dead = true }
  }, [loc, near, inRange, region])

  const apply = (p: Place) => {
    setLoc(p); setErr('')
    const any = nearestHubAny(p)
    if (any.straightKm <= MAX_COVERAGE_KM) setRegionId(any.region.id)   // wilayah otomatis ikut lokasi
  }
  const search = async () => {
    setBusy('addr'); setErr('')
    try { apply(await geocode(addr)) } catch (e: any) { setErr(e.message || 'Gagal mencari alamat.') }
    setBusy('')
  }
  const useMyLocation = async () => {
    setBusy('gps'); setErr('')
    try { const p = await locate(); const label = await reverse(p); setAddr(label); apply({ lat: p.lat, lng: p.lng, label }) } catch (e: any) { setErr(e.message || 'Gagal membaca lokasi.') }
    setBusy('')
  }

  const wNum = w.trim() === '' || isNaN(+w) ? null : +w
  const jKm = route ? Math.round(route.km * 10) / 10 : null
  const r = calcPrice({ region, distanceKm: jKm, weightKg: wNum, premium })
  const hint = !loc ? 'Masukkan alamat penjemputan atau gunakan lokasi Anda. Jarak dihitung otomatis oleh sistem.'
    : !inRange ? `Lokasi Anda ±${nf(near!.straightKm, 0)} km dari hub ${region.name} terdekat. Di luar jangkauan layanan (maks. ${MAX_COVERAGE_KM} km).`
    : routing ? 'Menghitung jarak rute…' : ''

  return (
    <div className="pk">
      <header className="pk__head">
        <span className="pk__icon"><Truck size={22} /></span>
        <div><h1>Pengangkutan Sampah</h1><p>Biaya penjemputan dihitung dari jarak jalan lokasi Anda ke hub pengolahan SIRKULA terdekat.</p></div>
      </header>

      <div className="pk__grid">
        <section className="pk__card">
          <h3>Detail penjemputan</h3>

          <div className="pk__field">
            <label htmlFor="pk-addr">Alamat penjemputan</label>
            <div className="pk__search">
              <MapPin size={16} className="pk__lead" />
              <input id="pk-addr" value={addr} placeholder="mis. Jl. Sunset Road, Kuta, Bali" onChange={e => setAddr(e.target.value)} onKeyDown={e => e.key === 'Enter' && addr.trim() && search()} />
              <button className="pk__btn" onClick={search} disabled={busy !== '' || addr.trim().length < 3}>{busy === 'addr' ? <Loader2 size={16} className="pk__spin" /> : <Search size={16} />} Cari</button>
            </div>
            <button className="pk__ghost" onClick={useMyLocation} disabled={busy !== ''}>{busy === 'gps' ? <Loader2 size={16} className="pk__spin" /> : <LocateFixed size={16} />} Gunakan lokasi saya sekarang</button>
            {err && <div className="pk__err" role="alert"><AlertTriangle size={15} />{err}</div>}
            {loc && !err && <div className="pk__ok"><Navigation size={15} /><span>{loc.label}</span></div>}
          </div>

          <div className="pk__field">
            <label>Wilayah layanan</label>
            <Select label="Wilayah layanan" value={regionId} onChange={setRegionId} options={REGIONS.map(x => ({ value: x.id, label: x.name }))} className="pk__select" />
            <small className="pk__terrain"><Mountain size={13} />{region.terrain}</small>
          </div>

          <div className="pk__field">
            <label htmlFor="pk-w">Berat sampah</label>
            <div className="pk__unit"><input id="pk-w" type="number" min="0" step="any" inputMode="decimal" value={w} onChange={e => setW(e.target.value)} aria-invalid={wNum === null || wNum <= 0} /><span>kg</span></div>
          </div>

          <div className={`pk__plan${premium ? ' on' : ''}`}>{premium ? <><Crown size={15} />Akun Premium: biaya tetap Rp0</> : `Akun Free: biaya tetap ${rupiah(FIXED_FEE)}`}</div>
          <button className="pk__ghost" onClick={() => (premium ? nav('/app/analytics') : setGate(true))}><BarChart3 size={16} /> Riwayat & analisis lengkap</button>
        </section>

        <div className="pk__col">
          <section className="pk__card">
            <h3>Rincian biaya</h3>
            {!r.available || hint ? (
              <p className="pk__empty">{hint || (r.available ? '' : r.reason)}</p>
            ) : (
              <dl className="pk__rows">
                <dt>Biaya tetap</dt><dd>{rupiah(r.fixed)}</dd>
                <dt>Transportasi <em>{nf(jKm!)} km × {rupiah(r.transportRate)}</em></dt><dd>{rupiah(r.transport)}</dd>
                <dt>Penanganan <em>{nf(wNum!, 2)} kg × {rupiah(r.handlingRate)}</em></dt><dd>{rupiah(r.handling)}</dd>
                {premium && <><dt className="pk__disc">Diskon Premium (biaya tetap)</dt><dd className="pk__disc">−{rupiah(r.premiumDiscount)}</dd></>}
                <dt className="pk__total">Total</dt><dd className="pk__total">{rupiah(r.total)}</dd>
              </dl>
            )}
            {!premium && <button className="pk__link" onClick={() => nav('/app/premium')}>Hemat {rupiah(FIXED_FEE)} per pesanan dengan Premium →</button>}
          </section>

          {near && inRange && (
            <section className="pk__card">
              <h3>Rute ke hub</h3>
              <div className="pk__hub"><b>{near.hub.name}</b>
                {route && <span className={`pk__tag ${route.source}`}>{route.source === 'google' ? 'Jarak jalan · Google Maps' : 'Estimasi garis lurus × faktor jalan'}</span>}</div>
              <div className="pk__stats">
                <div><small>Jarak rute</small><b>{route ? `${nf(route.km)} km` : '…'}</b></div>
                <div><small>Garis lurus</small><b>{nf(near.straightKm)} km</b></div>
              </div>
              {MAPS_KEY ? <RouteMap from={loc!} hub={near.hub} path={route?.path} /> : <p className="pk__note">Peta tampil otomatis jika <code>VITE_GOOGLE_MAPS_API_KEY</code> terisi. Tanpa key, jarak memakai estimasi garis lurus × {region.roadFactor}.</p>}
              <p className="pk__note">Hub adalah pusat pengolahan fiktif untuk demo.</p>
            </section>
          )}
        </div>
      </div>

      <section className="pk__card">
        <h3>Tarif per wilayah</h3>
        <div className="pk__tablewrap"><table className="pk__table"><thead><tr><th>Wilayah</th><th>Transport / km</th><th>Penanganan / kg</th><th>Kondisi</th></tr></thead>
          <tbody>{REGIONS.map(x => <tr key={x.id} className={x.id === regionId ? 'on' : ''} onClick={() => setRegionId(x.id)}><td>{x.name}</td><td>{rupiah(x.transportRate)}</td><td>{rupiah(x.handlingRate)}</td><td>{x.terrain}</td></tr>)}</tbody></table></div>
        <p className="pk__note">Tarif dan hub bersifat demo, disesuaikan dengan medan dan infrastruktur tiap wilayah.</p>
      </section>

      <PremiumModal open={gate} feature="Riwayat & analisis lengkap" onClose={() => setGate(false)} />
    </div>
  )
}

/** Peta rute: lokasi penjemputan -> hub. Garis penuh = rute jalan Google, garis tipis = garis lurus (cadangan). */
function RouteMap({ from, hub, path }: { from: Pt; hub: Hub; path?: Pt[] }) {
  const el = useRef<HTMLDivElement>(null), map = useRef<G>(null), layers = useRef<G[]>([])
  const [ready, setReady] = useState(false), [fail, setFail] = useState(false)
  useEffect(() => {
    let dead = false
    loadGoogleMaps('id').then(async g => {
      if (dead || !el.current) return
      const { Map } = await g.maps.importLibrary('maps')
      map.current = new Map(el.current, { center: from, zoom: 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, clickableIcons: false })
      setReady(true)
    }).catch(() => !dead && setFail(true))
    return () => { dead = true }
    // eslint-disable-next-line
  }, [])
  useEffect(() => {
    const g = window.google; if (!ready || !g || !map.current) return
    layers.current.forEach(l => l.setMap(null)); layers.current = []
    const dot = (p: Pt, fill: string, title: string) => new g.maps.Marker({ map: map.current, position: p, title, icon: { path: g.maps.SymbolPath.CIRCLE, scale: 8, fillColor: fill, fillOpacity: 1, strokeColor: '#123b2a', strokeWeight: 3 } })
    const line = new g.maps.Polyline({ map: map.current, path: path?.length ? path : [from, hub], strokeColor: '#1b5239', strokeOpacity: path?.length ? .9 : .5, strokeWeight: path?.length ? 5 : 3 })
    layers.current = [dot(from, '#ffffff', 'Lokasi penjemputan'), dot(hub, '#c5f26b', hub.name), line]
    const b = new g.maps.LatLngBounds(); b.extend(from); b.extend(hub); path?.forEach(p => b.extend(p)); map.current.fitBounds(b, 40)
  }, [ready, from, hub, path])
  if (fail) return <p className="pk__note">Peta gagal dimuat. Perhitungan jarak tetap berjalan.</p>
  return <div ref={el} className="pk__map" aria-label="Peta rute ke hub" />
}
