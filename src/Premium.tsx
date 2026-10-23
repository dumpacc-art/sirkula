import { useState } from 'react'
import { Check, Crown, X } from 'lucide-react'
import { PLANS, YEARLY_PER_MONTH, MARKETPLACE, activate, cancel, canUseTrial, daysLeft, usePremium, useAccountType } from './lib/premium'
import { rupiah } from './lib/pricing'
import './Sirkula.css'
type P = 'trial' | 'monthly' | 'yearly'
const BEN = {
  personal: ['Biaya tetap pengangkutan Rp0 (normal Rp10.000/pesanan)', 'Statistik & laporan pengangkutan lebih lengkap', 'Riwayat & analisis aktivitas lebih terperinci'],
  company: ['Laporan gabungan dari beberapa cabang', 'Permintaan kerja sama/kontrak langsung ke admin SIRKULA', `Biaya publikasi marketplace ${rupiah(MARKETPLACE.free.listing)} → ${rupiah(MARKETPLACE.premium.listing)}/listing`, `Biaya transaksi marketplace ${MARKETPLACE.free.txPct}% → ${MARKETPLACE.premium.txPct}%`],
}
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-')
export default function Premium() {
  const { uid, sub, premium } = usePremium(); const accType = useAccountType()
  const [tab, setTab] = useState<'personal' | 'company'>(accType); const [pick, setPick] = useState<P | null>(null); const [msg, setMsg] = useState('')
  const confirm = () => { try { activate(uid, pick!); setMsg(`Berhasil (DEMO): ${PLANS[pick!].name} aktif. Tidak ada pembayaran sungguhan.`) } catch (e: any) { setMsg(e.message) } setPick(null) }
  return (
    <div className="sk-page">
      <h1><Crown size={24} /> SIRKULA Premium</h1>
      {msg && <div className="sk-pill">{msg}</div>}
      <section className="sk-card">
        <h3>Status langganan</h3>
        {premium ? <p>Aktif: <b>{PLANS[sub.plan as P].name}</b> · mulai {fmt(sub.startDate)} · berakhir {fmt(sub.endDate)} · sisa {daysLeft(sub)} hari
          {sub.plan === 'trial' && ' (masa trial)'}{sub.status === 'canceled' && ' · perpanjangan dihentikan, benefit aktif sampai tanggal berakhir'}</p>
          : <p className="sk-muted">Akun Free{sub.status === 'expired' ? ` · langganan berakhir ${fmt(sub.endDate)}` : ''}.</p>}
        {premium && sub.autoRenew && <button className="sk-btn sk-ghost" onClick={() => cancel(uid)}>Batalkan perpanjangan</button>}
      </section>
      <div className="sk-plans">
        <div className="sk-card"><h3>Free</h3><div className="sk-price">Rp0</div><p className="sk-muted">Fitur dasar tanpa batas waktu.</p></div>
        {canUseTrial(sub) && !premium && <div className="sk-card"><h3>Free Trial</h3><div className="sk-price">Rp0</div><p className="sk-muted">3 hari, sekali per akun.</p><button className="sk-btn" onClick={() => setPick('trial')}>Mulai trial</button></div>}
        <div className="sk-card"><h3>Bulanan</h3><div className="sk-price">{rupiah(149000)}<small> /bulan</small></div><button className="sk-btn" onClick={() => setPick('monthly')}>Pilih bulanan</button></div>
        <div className="sk-card sk-hl"><h3>Tahunan</h3>
          <div className="sk-price"><s className="sk-muted">{rupiah(2000000)}</s> {rupiah(1400000)}<small> /tahun</small></div>
          <p className="sk-muted">Setara ±{rupiah(YEARLY_PER_MONTH)}/bulan (perbandingan, bukan tagihan bulanan). Rp2.000.000 adalah harga pembanding ilustratif, bukan harga yang pernah berlaku.</p>
          <button className="sk-btn" onClick={() => setPick('yearly')}>Pilih tahunan</button></div>
      </div>
      <section className="sk-card">
        <div className="sk-tabs">{(['personal', 'company'] as const).map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'personal' ? 'Pengguna pribadi' : 'Perusahaan'}</button>)}</div>
        <table className="sk-table"><thead><tr><th>Benefit</th><th>Free</th><th>Premium</th></tr></thead><tbody>
          {BEN[tab].map(b => <tr key={b}><td>{b}</td><td><X size={16} /></td><td><Check size={16} className="sk-accent" /></td></tr>)}</tbody></table>
      </section>
      {pick && <div className="sk-overlay" onClick={() => setPick(null)}><div className="sk-dialog" onClick={e => e.stopPropagation()}>
        <span className="sk-demo">DEMO – bukan pembayaran sungguhan</span>
        <h3>{PLANS[pick].name}</h3>
        <p>Harga: <b>{rupiah(PLANS[pick].price)}</b> · Durasi: {pick === 'trial' ? '3 hari' : pick === 'monthly' ? '1 bulan' : '1 tahun'}</p>
        <p className="sk-muted">{pick === 'trial' ? 'Trial tidak diperpanjang otomatis dan hanya sekali per akun.' : 'Diperpanjang otomatis sampai dibatalkan. Pembatalan menghentikan perpanjangan berikutnya; benefit tetap aktif sampai tanggal berakhir.'}</p>
        <ul>{[...BEN.personal, ...BEN.company].map(b => <li key={b}>{b}</li>)}</ul>
        <div className="sk-row"><button className="sk-btn sk-ghost" onClick={() => setPick(null)}>Batal</button><button className="sk-btn" onClick={confirm}>Simulasikan pembayaran (DEMO)</button></div>
      </div></div>}
    </div>
  )
}

