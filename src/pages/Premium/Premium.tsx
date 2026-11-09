import { useState } from 'react'
import { Check, Crown, CalendarClock, Sparkles, Building2, User, Trash2 } from 'lucide-react'
import { PLANS, YEARLY_PER_MONTH, MARKETPLACE, activate, cancel, remove, hasRecord, canUseTrial, daysLeft, usePremium, useAccountType } from '../../lib/premium'
import { rupiah } from '../../lib/pricing'
import Modal from '../../components/ui/Modal'
import AdminWhatsApp from '../../components/ui/AdminWhatsApp'
import './Premium.css'
type P = 'trial' | 'monthly' | 'yearly'
const MONTHLY = 149000, YEARLY = 1400000
const SAVE_PCT = Math.round((1 - YEARLY / (MONTHLY * 12)) * 100)
const BEN = {
  personal: ['Biaya tetap pengangkutan Rp0 (normal Rp10.000/pesanan)', 'Statistik & laporan pengangkutan lebih lengkap', 'Riwayat & analisis aktivitas lebih terperinci'],
  company: ['Laporan gabungan dari beberapa cabang', 'Permintaan kerja sama/kontrak langsung ke admin SIRKULA', `Biaya publikasi marketplace ${rupiah(MARKETPLACE.free.listing)} → ${rupiah(MARKETPLACE.premium.listing)}/listing`, `Biaya transaksi marketplace ${MARKETPLACE.free.txPct}% → ${MARKETPLACE.premium.txPct}%`],
}
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-')
const TOTAL_DAYS: Record<P, number> = { trial: 3, monthly: 30, yearly: 365 }
export default function Premium() {
  const { uid, sub, premium } = usePremium(); const accType = useAccountType()
  const [tab, setTab] = useState<'personal' | 'company'>(accType); const [pick, setPick] = useState<P | null>(null); const [msg, setMsg] = useState(''); const [askDel, setAskDel] = useState(false)
  const wipe = () => { remove(uid); setAskDel(false); setMsg('Premium dihapus (DEMO). Akun kembali ke paket Free dan trial gratis bisa dicoba lagi.') }
  const confirm = () => { try { activate(uid, pick!); setMsg(`Berhasil (DEMO): ${PLANS[pick!].name} aktif. Tidak ada pembayaran sungguhan.`) } catch (e: any) { setMsg(e.message) } setPick(null) }
  const left = daysLeft(sub); const pct = premium ? Math.min(100, Math.max(4, (left / TOTAL_DAYS[sub.plan as P]) * 100)) : 0
  const trialOk = canUseTrial(sub) && !premium
  return (
    <div className="pm">
      <header className="pm__hero">
        <span className="pm__icon" aria-hidden="true"><Crown size={26} /></span>
        <div><p className="pm__eyebrow">Langganan</p><h1>SIRKULA Premium</h1><p className="pm__lead">Biaya pengangkutan lebih hemat, laporan lebih lengkap, dan biaya marketplace lebih rendah.</p></div>
      </header>

      {msg && <div className="pm__notice" role="status">{msg}</div>}

      <section className={`pm__status${premium ? ' on' : ''}`} aria-label="Status langganan">
        <span className="pm__statusIcon" aria-hidden="true"><CalendarClock size={20} /></span>
        <div className="pm__statusBody">
          <p className="pm__label">Status langganan</p>
          {premium ? <>
            <h2>{PLANS[sub.plan as P].name}{sub.plan === 'trial' && <small> · masa trial</small>}</h2>
            <div className="pm__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Sisa masa aktif"><i style={{ width: `${pct}%` }} /></div>
            <p className="pm__meta">Sisa <b>{left} hari</b> · {fmt(sub.startDate)} – {fmt(sub.endDate)}</p>
            {sub.status === 'canceled' && <p className="pm__meta">Perpanjangan dihentikan, benefit tetap aktif sampai tanggal berakhir.</p>}
          </> : <>
            <h2>Belum berlangganan</h2>
            <p className="pm__meta">{sub.status === 'expired' ? `Langganan berakhir ${fmt(sub.endDate)}. ` : ''}Pilih paket di bawah untuk mengaktifkan Premium.</p>
          </>}
        </div>
        {(hasRecord(sub) || (premium && sub.autoRenew)) && <div className="pm__statusAct">
          {premium && sub.autoRenew && <button className="pm__btn pm__btn--ghost" onClick={() => cancel(uid)}>Batalkan perpanjangan</button>}
          {hasRecord(sub) && <button className="pm__btn pm__btn--danger" onClick={() => setAskDel(true)}><Trash2 size={15} aria-hidden="true" />Hapus Premium (DEMO)</button>}
        </div>}
      </section>

      <section aria-label="Pilih paket">
        <h2 className="pm__h2">Pilih paket</h2>
        <div className="pm__plans">
          <article className="pm__plan">
            <h3>Bulanan</h3>
            <p className="pm__price">{rupiah(MONTHLY)}<small>/bulan</small></p>
            <p className="pm__note">{trialOk ? 'Coba gratis 3 hari lebih dulu, sekali per akun.' : 'Fleksibel, bisa dihentikan kapan saja.'}</p>
            <div className="pm__actions">
              <button className="pm__btn" onClick={() => setPick('monthly')}>Pilih bulanan</button>
              {trialOk && <button className="pm__btn pm__btn--ghost" onClick={() => setPick('trial')}>Coba gratis 3 hari</button>}
            </div>
          </article>
          <article className="pm__plan pm__plan--best">
            <span className="pm__tag"><Sparkles size={13} aria-hidden="true" />Hemat {SAVE_PCT}%</span>
            <h3>Tahunan</h3>
            <p className="pm__price">{rupiah(YEARLY)}<small>/tahun</small></p>
            <p className="pm__note">Setara ±{rupiah(YEARLY_PER_MONTH)}/bulan, dibanding {rupiah(MONTHLY * 12)} jika bayar bulanan selama 12 bulan.</p>
            <div className="pm__actions"><button className="pm__btn" onClick={() => setPick('yearly')}>Pilih tahunan</button></div>
          </article>
        </div>
      </section>

      <section className="pm__ben" aria-label="Benefit Premium">
        <div className="pm__benHead">
          <h2 className="pm__h2">Benefit Premium</h2>
          <div className="pm__tabs" role="tablist">{(['personal', 'company'] as const).map(t => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
              {t === 'personal' ? <User size={15} aria-hidden="true" /> : <Building2 size={15} aria-hidden="true" />}{t === 'personal' ? 'Pribadi' : 'Perusahaan'}
            </button>))}
          </div>
        </div>
        <ul className="pm__list">{BEN[tab].map(b => <li key={b}><span className="pm__check" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>{b}</li>)}</ul>
      </section>

      <section className="pm__help">
        <div><h3>Ada pertanyaan soal Premium?</h3><p>Chat admin SIRKULA, termasuk untuk kerja sama atau kontrak perusahaan.</p></div>
        <AdminWhatsApp variant="solid" message="Halo Admin SIRKULA, saya ingin bertanya soal paket Premium." />
      </section>

      <Modal open={askDel} title="Hapus Premium?" onClose={() => setAskDel(false)}>
        <div className="pm__modal">
          <span className="pm__demo">DEMO – hanya menghapus data di browser ini</span>
          <p>Langganan {premium ? <b>{PLANS[sub.plan as P].name}</b> : 'akun ini'} akan dihapus dan akun kembali ke paket Free. Riwayat trial ikut dihapus, jadi “Coba gratis 3 hari” bisa dipakai lagi.</p>
          <p className="pm__note">Tidak ada pembayaran sungguhan yang dibatalkan atau dikembalikan karena semua ini simulasi.</p>
          <div className="pm__row"><button className="pm__btn pm__btn--ghost" onClick={() => setAskDel(false)}>Batal</button><button className="pm__btn pm__btn--dangerSolid" onClick={wipe}><Trash2 size={15} aria-hidden="true" />Ya, hapus Premium</button></div>
        </div>
      </Modal>

      <Modal open={!!pick} title={pick ? PLANS[pick].name : ''} onClose={() => setPick(null)}>{pick && <div className="pm__modal">
        <span className="pm__demo">DEMO – bukan pembayaran sungguhan</span>
        <p>Harga: <b>{rupiah(PLANS[pick].price)}</b> · Durasi: {pick === 'trial' ? '3 hari' : pick === 'monthly' ? '1 bulan' : '1 tahun'}</p>
        <p className="pm__note">{pick === 'trial' ? 'Trial tidak diperpanjang otomatis dan hanya sekali per akun.' : 'Diperpanjang otomatis sampai dibatalkan. Pembatalan menghentikan perpanjangan berikutnya; benefit tetap aktif sampai tanggal berakhir.'}</p>
        <ul className="pm__list pm__list--sm">{[...BEN.personal, ...BEN.company].map(b => <li key={b}><span className="pm__check" aria-hidden="true"><Check size={12} strokeWidth={3} /></span>{b}</li>)}</ul>
        <div className="pm__row"><button className="pm__btn pm__btn--ghost" onClick={() => setPick(null)}>Batal</button><button className="pm__btn" onClick={confirm}>Simulasikan pembayaran (DEMO)</button></div>
      </div>}</Modal>
    </div>
  )
}
