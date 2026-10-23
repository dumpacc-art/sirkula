import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LocateFixed, Search, ExternalLink, Navigation, Star, MapPin, KeyRound, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import RangeInput from '../../components/ui/RangeInput'
import { baseParticipants, type Participant } from '../../data/participants'
import { MAPS_KEY, loadGoogleMaps, km, type G } from '../../lib/googleMaps'
import { facilities, materialQuery, materialHint, relevant, blockedTypes, type Facility } from '../../features/nearby/nearbyConfig'
import './EcosystemMapPage.css'

interface Pt { lat: number; lng: number }
interface Found { id: string; name: string; address: string; lat: number; lng: number; km: number; rating?: number; reviews?: number; open?: boolean; url?: string; types: string[]; phone?: string }
const BALI: Pt = { lat:-8.65, lng:115.2167 }
const mats = ['Plastic','Paper','Organic','Glass','Metal','Textile','Electronics']
const colors: Record<string, string> = { generator:'#123b2a', processor:'#c5f26b', transport:'#7a807b', seller:'#7fe0b0', buyer:'#b9c9b4', community:'#1b5239', 'collection point':'#d9a21b' }
const pin = (fill: string, stroke = '#123b2a') => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38"><path d="M15 1C7.8 1 2 6.8 2 14c0 9.6 13 23 13 23s13-13.4 13-23C28 6.8 22.2 1 15 1z" fill="${fill}" stroke="${stroke}" stroke-width="2"/><circle cx="15" cy="14" r="5" fill="${stroke}"/></svg>`)}`

export default function EcosystemMapPage() {
  const { t, lang } = useT()
  const [tab, setTab] = useState<'nearby' | 'network'>('nearby')
  return (
    <div className="em">
      <header><h1>{t('Ecosystem map')}</h1><p>{t('Real places from Google Maps around the selected area, filtered to recycling and waste businesses. The platform network tab shows fictional demo participants.')}</p></header>
      <div className="em__tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'nearby'} className={tab === 'nearby' ? 'on' : ''} onClick={() => setTab('nearby')}>{t('Nearby facilities')}</button>
        <button role="tab" aria-selected={tab === 'network'} className={tab === 'network' ? 'on' : ''} onClick={() => setTab('network')}>{t('Platform network (demo)')}</button>
      </div>
      {tab === 'nearby' ? <Nearby key={lang} /> : <Network />}
    </div>
  )
}

/* ------------------------------------------------------------------ real nearby places */
function Nearby() {
  const { t, lang } = useT()
  const mapEl = useRef<HTMLDivElement>(null), map = useRef<G>(null), markers = useRef<G[]>([]), info = useRef<G>(null), circle = useRef<G>(null), g = useRef<G>(null)
  const [center, setCenter] = useState<Pt>(BALI), [label, setLabel] = useState('Bali'), [area, setArea] = useState('')
  const [fac, setFac] = useState<Facility>('all'), [mat, setMat] = useState(''), [radius, setRadius] = useState(10), [strict, setStrict] = useState(true), [openOnly, setOpenOnly] = useState(false)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [ready, setReady] = useState(false), [found, setFound] = useState<Found[]>([]), [sel, setSel] = useState(''), [searched, setSearched] = useState(false)
  const code = lang === 'Bahasa Indonesia' ? 'id' : 'en'

  // load Google Maps + create the map once
  useEffect(() => {
    if (!MAPS_KEY) return
    let dead = false
    loadGoogleMaps(code).then(async google => {
      if (dead || !mapEl.current) return
      g.current = google; const { Map } = await google.maps.importLibrary('maps')
      map.current = new Map(mapEl.current, { center, zoom: 12, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, clickableIcons: false,
        styles: [{ featureType:'poi.business', stylers:[{ visibility:'off' }] }] })
      info.current = new google.maps.InfoWindow(); setReady(true)
    }).catch(e => !dead && setError(String(e.message || e)))
    return () => { dead = true }
    // eslint-disable-next-line
  }, [])

  const run = useCallback(async () => {
    const google = g.current; if (!google || !map.current) return
    setBusy(true); setError(''); setSel('')
    try {
      const { Place } = await google.maps.importLibrary('places')
      const cfg = facilities.find(f => f.key === fac)!
      const queries = mat ? [materialQuery[mat], ...(fac === 'all' ? [] : cfg.queries.slice(0, 1))] : cfg.queries
      const lists = await Promise.all(queries.map(q => Place.searchByText({
        textQuery: q, locationBias: { center, radius: radius * 1000 }, maxResultCount: 20, language: code, region: 'ID',
        fields: ['id', 'displayName', 'formattedAddress', 'location', 'rating', 'userRatingCount', 'businessStatus', 'types', 'googleMapsURI', 'regularOpeningHours', 'nationalPhoneNumber', 'utcOffsetMinutes'],
      }).then((r: G) => r.places as G[]).catch((e: Error) => { throw e })))
      const seen = new Map<string, Found>()
      for (const p of lists.flat()) {
        if (!p?.location || seen.has(p.id)) continue
        const pt = { lat: p.location.lat(), lng: p.location.lng() }, d = km(center, pt), name: string = p.displayName ?? '', types: string[] = p.types ?? []
        if (d > radius) continue                                                        // 1) inside the chosen radius
        if (p.businessStatus && p.businessStatus !== 'OPERATIONAL') continue            // 2) still operating
        if (types.some(x => blockedTypes.includes(x))) continue                         // 3) not a cafe/hotel/shop that merely has "eco" in its name
        const hay = `${name} ${types.join(' ')}`
        if (strict && !relevant.test(hay)) continue                                     // 4) looks like a waste / recycling business
        if (strict && mat && !materialHint[mat].test(hay) && !/recycl|daur ulang|bank sampah|sampah|waste|scrap|rongsok|pengepul/i.test(hay)) continue
        let open: boolean | undefined; try { open = (await p.isOpen()) ?? undefined } catch { open = undefined }
        if (openOnly && open === false) continue
        seen.set(p.id, { id: p.id, name, address: p.formattedAddress ?? '', ...pt, km: d, rating: p.rating ?? undefined, reviews: p.userRatingCount ?? undefined, open, url: p.googleMapsURI, types, phone: p.nationalPhoneNumber ?? undefined })
      }
      setFound([...seen.values()].sort((a, b) => a.km - b.km)); setSearched(true)
    } catch (e) { setError((e as Error).message || 'Search failed'); setFound([]) }
    finally { setBusy(false) }
  }, [center, fac, mat, radius, strict, openOnly, code])

  // re-search when filters change (debounced)
  useEffect(() => { if (!ready) return; const id = setTimeout(run, 450); return () => clearTimeout(id) }, [ready, run])

  // draw markers + radius circle
  useEffect(() => {
    const google = g.current; if (!ready || !google) return
    markers.current.forEach(m => m.setMap(null)); markers.current = []
    circle.current?.setMap(null)
    circle.current = new google.maps.Circle({ map: map.current, center, radius: radius * 1000, strokeColor: '#1b5239', strokeOpacity: .5, strokeWeight: 1.5, fillColor: '#c5f26b', fillOpacity: .08, clickable: false })
    const bounds = new google.maps.LatLngBounds(); bounds.extend(center)
    found.forEach(f => {
      const m = new google.maps.Marker({ map: map.current, position: { lat: f.lat, lng: f.lng }, title: f.name, icon: { url: pin('#c5f26b'), scaledSize: new google.maps.Size(30, 38) } })
      m.addListener('click', () => setSel(f.id)); (m as G).__id = f.id; markers.current.push(m); bounds.extend({ lat: f.lat, lng: f.lng })
    })
    const me = new google.maps.Marker({ map: map.current, position: center, title: label, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: '#123b2a', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } }); markers.current.push(me)
    map.current.fitBounds(found.length ? bounds : circle.current.getBounds(), 56)
  }, [found, ready, center, radius, label])

  // selection highlights marker and opens info
  useEffect(() => {
    const google = g.current; if (!ready || !google) return
    markers.current.forEach(m => { const f = (m as G).__id; if (f) m.setIcon({ url: pin(f === sel ? '#123b2a' : '#c5f26b', f === sel ? '#c5f26b' : '#123b2a'), scaledSize: new google.maps.Size(30, 38) }); if (f && f === sel) m.setZIndex(999) })
    const f = found.find(x => x.id === sel), m = markers.current.find(x => (x as G).__id === sel)
    if (f && m) { info.current.setContent(`<div style="font:13px Inter,sans-serif;max-width:220px"><b>${esc(f.name)}</b><br/>${esc(f.address)}</div>`); info.current.open({ map: map.current, anchor: m }); const el = document.getElementById(`pl-${f.id}`); el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }
  }, [sel, found, ready])

  const locate = () => {
    if (!navigator.geolocation) return setError(t('Geolocation is not supported by this browser.'))
    navigator.geolocation.getCurrentPosition(p => { setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }); setLabel(t('My location')); setArea('') }, () => setError(t('Location permission was denied. Search for an area instead.')), { timeout: 8000 })
  }
  const goArea = async () => {
    const google = g.current; if (!google || !area.trim()) return
    try { const { Place } = await google.maps.importLibrary('places'); const r = await Place.searchByText({ textQuery: area, fields: ['location', 'displayName'], maxResultCount: 1, language: code })
      const p = r.places?.[0]; if (!p) return setError(t('Area not found.')); setError(''); setCenter({ lat: p.location.lat(), lng: p.location.lng() }); setLabel(p.displayName ?? area) }
    catch (e) { setError((e as Error).message) }
  }

  if (!MAPS_KEY) return <NoKey center={center} fac={fac} setFac={setFac} />
  const facOpts = facilities.map(f => ({ value: f.key, label: t(f.label) }))
  return (
    <>
      <div className="em__f">
        <span className="em__search"><Search size={16} /><input placeholder={t('Search an area (e.g. Sanur, Ubud, Denpasar)')} value={area} onChange={e => setArea(e.target.value)} onKeyDown={e => e.key === 'Enter' && goArea()} /></span>
        <button className="em__btn" onClick={goArea}>{t('Go')}</button>
        <button className="em__btn alt" onClick={locate}><LocateFixed size={15} />{t('Use my location')}</button>
      </div>
      <div className="em__f">
        <Select value={fac} onChange={v => setFac(v as Facility)} options={facOpts} label={t('Facility type')} />
        <Select value={mat} onChange={setMat} options={[{ value: '', label: t('All materials') }, ...mats.map(m => ({ value: m, label: t(m) }))]} label={t('Material')} />
        <label className="em__rng">{t('Radius')}: <b>{radius} km</b><RangeInput min={1} max={30} value={radius} onChange={setRadius} label={t('Radius')} /></label>
        <label className="em__chk"><input type="checkbox" checked={strict} onChange={e => setStrict(e.target.checked)} /> {t('Only recycling and waste businesses')}</label>
        <label className="em__chk"><input type="checkbox" checked={openOnly} onChange={e => setOpenOnly(e.target.checked)} /> {t('Hide places closed now')}</label>
      </div>
      {error && <p className="em__err"><AlertTriangle size={15} />{error}</p>}
      <div className="em__cols">
        <div className="em__mapWrap"><div ref={mapEl} className="em__gmap" />{!ready && !error && <div className="em__load">{t('Loading map…')}</div>}</div>
        <div className="em__list" aria-live="polite">
          <p className="em__count">{busy ? t('Searching…') : t('{n} places within {r} km of {where}', { n: found.length, r: radius, where: label })}</p>
          {!busy && searched && found.length === 0 && <p className="em__muted">{t('No matching facilities found. Try a larger radius or turn off the relevance filter.')}</p>}
          {found.map(f => (
            <article key={f.id} id={`pl-${f.id}`} className={f.id === sel ? 'on' : ''} onClick={() => setSel(f.id)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSel(f.id)}>
              <div className="em__row"><h3>{f.name}</h3><span className="em__km">{f.km.toFixed(1)} km</span></div>
              <p className="em__addr"><MapPin size={13} />{f.address}</p>
              <p className="em__meta">{f.rating !== undefined && <span><Star size={12} />{f.rating.toFixed(1)}{f.reviews ? ` (${f.reviews})` : ''}</span>}{f.open !== undefined && <span className={f.open ? 'ok' : 'no'}>{f.open ? t('Open now') : t('Closed now')}</span>}{f.phone && <span>{f.phone}</span>}</p>
              <p className="em__links"><a href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}&destination_place_id=${f.id}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}><Navigation size={13} />{t('Directions')}</a>
                {f.url && <a href={f.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}><ExternalLink size={13} />{t('Open in Google Maps')}</a>}</p>
            </article>))}
        </div>
      </div>
      <small className="em__muted">{t('Listings come live from Google Maps. Opening hours and status are provided by Google and may be out of date; confirm before sending material.')}</small>
    </>
  )
}
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

/* Without an API key we can still show a real Google map (keyless embed), but cannot list places. */
function NoKey({ center, fac, setFac }: { center: Pt; fac: Facility; setFac: (f: Facility) => void }) {
  const { t } = useT(); const cfg = facilities.find(f => f.key === fac)!
  const src = `https://www.google.com/maps?q=${encodeURIComponent(`${cfg.queries[0]} near ${center.lat},${center.lng}`)}&z=12&output=embed`
  return (
    <>
      <div className="em__key"><KeyRound size={18} /><div><b>{t('Add a Google Maps API key to enable the filtered place list')}</b>
        <p>{t('Create a key in Google Cloud, enable "Maps JavaScript API" and "Places API (New)", then put it in .env.local as VITE_GOOGLE_MAPS_API_KEY and restart the dev server.')}</p></div></div>
      <div className="em__f"><Select value={fac} onChange={v => setFac(v as Facility)} options={facilities.map(f => ({ value: f.key, label: t(f.label) }))} /></div>
      <iframe className="em__embed" title="Google Maps" src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
    </>
  )
}

/* ------------------------------------------------------------------ platform network (demo data) */
function Network() {
  const { t, lang } = useT()
  const { processors, matches, batches } = useStore()
  const mapEl = useRef<HTMLDivElement>(null), map = useRef<G>(null), g = useRef<G>(null), overlays = useRef<G[]>([])
  const [type, setType] = useState(''), [mat, setMat] = useState(''), [reg, setReg] = useState(''), [cap, setCap] = useState(false), [status, setStatus] = useState(''), [q, setQ] = useState(''), [links, setLinks] = useState(false), [sel, setSel] = useState(''), [ready, setReady] = useState(false)
  const all: Participant[] = useMemo(() => [...baseParticipants, ...processors.map(p => ({ id: p.id, name: p.name, type: 'processor' as const, region: p.region, lat: p.lat, lng: p.lng, materials: p.accepts, capacity: p.capacity, status: 'active' as const }))], [processors])
  const rows = all.filter(p => (!type || p.type === type) && (!mat || p.materials.includes(mat)) && (!reg || p.region === reg) && (!cap || (p.capacity ?? 0) > 0) && (!status || p.status === status) && (!q || p.name.toLowerCase().includes(q.toLowerCase())))
  const lines = matches.filter(m => m.status === 'accepted').map(m => { const src = all.find(a => a.name === batches.find(b => b.id === m.batchId)?.source), dst = all.find(a => a.id === m.processorId); return src && dst ? { src, dst, id: m.id } : null }).filter(Boolean) as { src: Participant; dst: Participant; id: string }[]
  const cur = all.find(p => p.id === sel)

  useEffect(() => {
    if (!MAPS_KEY) return; let dead = false
    loadGoogleMaps(lang === 'Bahasa Indonesia' ? 'id' : 'en').then(async google => {
      if (dead || !mapEl.current) return; g.current = google; const { Map } = await google.maps.importLibrary('maps')
      map.current = new Map(mapEl.current, { center: { lat: 10, lng: 60 }, zoom: 2, mapTypeControl: false, streetViewControl: false, clickableIcons: false }); setReady(true)
    }); return () => { dead = true }
  }, [lang])
  useEffect(() => {
    const google = g.current; if (!ready || !google) return
    overlays.current.forEach(o => o.setMap(null)); overlays.current = []
    const b = new google.maps.LatLngBounds()
    rows.forEach(p => { const m = new google.maps.Marker({ map: map.current, position: { lat: p.lat, lng: p.lng }, title: p.name, opacity: p.status === 'inactive' ? .5 : 1, icon: { url: pin(colors[p.type]), scaledSize: new google.maps.Size(p.id === sel ? 36 : 28, p.id === sel ? 46 : 36) } }); m.addListener('click', () => setSel(p.id)); overlays.current.push(m); b.extend({ lat: p.lat, lng: p.lng }) })
    if (links) lines.forEach(l => overlays.current.push(new google.maps.Polyline({ map: map.current, path: [{ lat: l.src.lat, lng: l.src.lng }, { lat: l.dst.lat, lng: l.dst.lng }], strokeColor: '#1b5239', strokeWeight: 2, geodesic: true })))
    if (rows.length) map.current.fitBounds(b, 48)
    // eslint-disable-next-line
  }, [ready, rows.length, links, sel, type, mat, reg, cap, status, q, processors])
  useEffect(() => { if (cur && map.current) map.current.panTo({ lat: cur.lat, lng: cur.lng }) }, [cur])

  const o = (all_: string, list: string[]) => [{ value: '', label: t(all_) }, ...list.map(v => ({ value: v, label: t(v) }))]
  return (
    <>
      <div className="em__f">
        <span className="em__search"><Search size={16} /><input placeholder={t('Search participants')} value={q} onChange={e => setQ(e.target.value)} /></span>
        <Select value={type} onChange={setType} options={o('All types', Object.keys(colors))} />
        <Select value={mat} onChange={setMat} options={o('All materials', mats)} />
        <Select value={reg} onChange={setReg} options={o('All regions', [...new Set(all.map(a => a.region))])} />
        <Select value={status} onChange={setStatus} options={[{ value: '', label: t('Any status') }, { value: 'active', label: t('active') }, { value: 'inactive', label: t('inactive') }]} />
        <label className="em__chk"><input type="checkbox" checked={cap} onChange={e => setCap(e.target.checked)} /> {t('Has capacity')}</label>
        <label className="em__chk"><input type="checkbox" checked={links} onChange={e => setLinks(e.target.checked)} /> {t('Recorded connections')} ({lines.length})</label>
      </div>
      <p className="em__muted">{t('Fictional demo locations (no street addresses). Lines are recorded matches from this prototype only.')}</p>
      <div className="em__cols">
        {MAPS_KEY ? <div className="em__mapWrap"><div ref={mapEl} className="em__gmap" />{!ready && <div className="em__load">{t('Loading map…')}</div>}</div> : <Schematic rows={rows} sel={sel} setSel={setSel} lines={links ? lines : []} />}
        <div className="em__list">{cur && <div className="em__detail"><h3>{cur.name}</h3><p>{t(cur.type)} · {t(cur.region)} · {t(cur.status)}</p><p>{t('Materials')}: {cur.materials.map(m => t(m)).join(', ') || '—'}</p>{cur.capacity !== undefined && <p>{t('Capacity')}: {cur.capacity} kg ({t('live demo value')})</p>}</div>}
          {rows.length === 0 ? <p className="em__muted">{t('No participants match.')}</p> : rows.map(p => <button key={p.id} className={p.id === sel ? 'on' : ''} onClick={() => setSel(p.id)}><i style={{ background: colors[p.type] }} />{p.name}<small>{t(p.type)}</small></button>)}</div>
      </div>
    </>
  )
}

const W = 720, H = 360, px = (lng: number) => (lng + 180) / 360 * W, py = (lat: number) => (90 - lat) / 180 * H
function Schematic({ rows, sel, setSel, lines }: { rows: Participant[]; sel: string; setSel: (s: string) => void; lines: { src: Participant; dst: Participant; id: string }[] }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="em__map" role="img" aria-label="Schematic ecosystem map">
      {[0, 1, 2, 3, 4, 5].map(i => <line key={i} x1={0} x2={W} y1={i * 72} y2={i * 72} className="g" />)}{Array.from({ length: 11 }, (_, i) => <line key={i} y1={0} y2={H} x1={i * 72} x2={i * 72} className="g" />)}
      {lines.map(l => <line key={l.id} x1={px(l.src.lng)} y1={py(l.src.lat)} x2={px(l.dst.lng)} y2={py(l.dst.lat)} className="link" />)}
      {rows.map(p => <circle key={p.id} cx={px(p.lng)} cy={py(p.lat)} r={p.id === sel ? 9 : 6} fill={colors[p.type]} className={`pt${p.id === sel ? ' on' : ''}`} opacity={p.status === 'inactive' ? .45 : 1} tabIndex={0} onClick={() => setSel(p.id)} onKeyDown={e => e.key === 'Enter' && setSel(p.id)}><title>{p.name}</title></circle>)}
    </svg>
  )
}
