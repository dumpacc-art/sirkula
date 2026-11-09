import { MapPin, Truck, Factory, CheckCircle2, Clock, Scale, Camera, FileCheck2, Ban, Package } from 'lucide-react'
import { useT } from '../../i18n'

/** Small product mock for each stage of the flow. Decorative: the text beside it carries the meaning. */
export default function StageVisual({ i }: { i: number }) {
  const { t } = useT()
  const dots = <div className="sv__dots" aria-hidden="true"><i /><i /><i /></div>
  return (
    <div className="sv" aria-hidden="true">
      <div className="sv__bar">{dots}<span>{t(['Register a batch', 'SmartMatch ranking', 'Collection route', 'Processing record', 'Evidence review'][i])}</span></div>
      <div className="sv__body">
        {i === 0 && <>
          <div className="sv__chips">{['Plastic', 'Organic', 'E-waste', 'Paper'].map((c, k) => <span key={c} className={k === 0 ? 'on' : ''}>{t(c)}</span>)}</div>
          <div className="sv__field"><Package size={16} /><span>25 kg</span></div>
          <div className="sv__field"><MapPin size={16} /><span>Jl. Sunset Road, Denpasar</span></div>
          <div className="sv__field sv__field--photo"><Camera size={16} /><span>{t('Photo added')}</span><CheckCircle2 size={16} className="ok" /></div>
          <div className="sv__btn">{t('Register batch')}</div>
        </>}
        {i === 1 && <>
          {[['PT Daur Hijau Dewata', 92], ['Pulau Hijau Plant', 85], ['EcoCycle Bali', 71]].map(([n, s], k) => (
            <div key={n as string} className={`sv__rank${k === 0 ? ' top' : ''}`}><b>{n}</b><div className="sv__meter"><i style={{ width: `${s}%` }} /></div><em>{s}</em></div>
          ))}
          <div className="sv__rank off"><Ban size={15} /><b>CV Kuta Limbah</b><small>{t('Excluded: capacity full')}</small></div>
        </>}
        {i === 2 && <>
          <svg viewBox="0 0 320 150" className="sv__map"><path className="sv__road" d="M24 112 C 90 112, 90 40, 160 60 S 250 100, 296 36" /><path className="sv__trail" d="M24 112 C 90 112, 90 40, 160 60 S 250 100, 296 36" />
            <circle cx="24" cy="112" r="8" className="sv__pin a" /><circle cx="296" cy="36" r="8" className="sv__pin b" /></svg>
          <div className="sv__row"><Truck size={16} /><span>{t('Collector on the way')}</span><em>12 {t('min')}</em></div>
          <div className="sv__row"><Clock size={16} /><span>{t('Handover recorded with time and weight')}</span></div>
        </>}
        {i === 3 && <>
          <div className="sv__big"><Scale size={20} /><div><small>{t('Received at processor')}</small><b>24.6 kg</b></div></div>
          <div className="sv__row"><Factory size={16} /><span>{t('Input')} 24.6 kg</span><em>→ {t('Output')} 23.9 kg</em></div>
          <div className="sv__row warn"><Clock size={16} /><span>{t('Difference of 0.4 kg is recorded, not hidden')}</span></div>
        </>}
        {i === 4 && <>
          {[['Photo of reused material', true], ['Weight slip', true], ['Independent review', false]].map(([n, ok]) => (
            <div key={n as string} className="sv__row"><FileCheck2 size={16} /><span>{t(n as string)}</span><em className={ok ? 'okb' : 'pendb'}>{ok ? t('Accepted') : t('Pending')}</em></div>
          ))}
          <div className="sv__note">{t('Nothing is called verified until a reviewer accepts it.')}</div>
        </>}
      </div>
    </div>
  )
}
