import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, BarChart3 } from 'lucide-react'
import { REGIONS, calcPrice, rupiah, FIXED_FEE } from '../lib/pricing'
import { usePremium } from '../lib/premium'
import PremiumModal from '../components/PremiumModal'
import './Sirkula.css'
export default function Pickup() {
  const { premium } = usePremium(); const nav = useNavigate()
  const [regionId, setRegionId] = useState('bali'); const [j, setJ] = useState('5'); const [w, setW] = useState('10'); const [gate, setGate] = useState(false)
  const region = REGIONS.find(r => r.id === regionId)
  const num = (v: string) => (v.trim() === '' || isNaN(+v) ? null : +v)
  const r = calcPrice({ region, distanceKm: num(j), weightKg: num(w), premium })
  return (
    <div className="sk-page">
      <h1><Truck size={24} /> Pengangkutan Sampah</h1>
      <p className="sk-muted">Hitung estimasi biaya penjemputan sampah. Total dihitung ulang otomatis.</p>
      <div className="sk-grid">
        <section className="sk-card">
          <label>Wilayah<select value={regionId} onChange={e => setRegionId(e.target.value)}>
            {REGIONS.map(x => <option key={x.id} value={x.id}>{x.name}{x.transportRate == null ? ' (belum tersedia)' : ''}</option>)}</select></label>
          <label>Jarak ke fasilitas pengolah (km, satu arah)<input type="number" min="0" step="any" value={j} onChange={e => setJ(e.target.value)} /></label>
          <label>Berat sampah (kg)<input type="number" min="0" step="any" value={w} onChange={e => setW(e.target.value)} /></label>
          <div className="sk-pill">{premium ? 'Akun Premium: biaya tetap Rp0' : `Akun Free: biaya tetap ${rupiah(FIXED_FEE)}`}</div>
          <button className="sk-btn sk-ghost" onClick={() => (premium ? nav('/app/analytics') : setGate(true))}><BarChart3 size={16} /> Riwayat & analisis lengkap</button>
        </section>
        <section className="sk-card">
          <h3>Rincian biaya</h3>
          {!r.available ? <p className="sk-muted">{r.reason}</p> : (
            <dl className="sk-rows">
              <dt>Biaya tetap</dt><dd>{rupiah(r.fixed)}</dd>
              <dt>Transportasi ({j} km × {rupiah(region!.transportRate!)})</dt><dd>{rupiah(r.transport)}</dd>
              <dt>Penanganan ({w} kg × Rp800)</dt><dd>{rupiah(r.handling)}</dd>
              {premium && <><dt className="sk-accent">Diskon Premium (biaya tetap)</dt><dd className="sk-accent">−{rupiah(r.premiumDiscount)}</dd></>}
              <dt className="sk-total">Total</dt><dd className="sk-total">{rupiah(r.total)}</dd>
            </dl>)}
          {!premium && <button className="sk-link" onClick={() => nav('/app/premium')}>Hemat {rupiah(FIXED_FEE)} per pesanan dengan Premium →</button>}
        </section>
      </div>
      <PremiumModal open={gate} feature="Riwayat & analisis lengkap" onClose={() => setGate(false)} />
    </div>
  )
}
