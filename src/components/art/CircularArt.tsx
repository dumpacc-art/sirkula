import { Leaf, Truck, Factory, Sprout, Recycle, CheckCircle2, MapPin } from 'lucide-react'
import { useT } from '../../i18n'
import './CircularArt.css'

/**
 * Hero illustration: a material loop (source > pickup > processing > reuse) with a live batch card in the middle.
 * Pure HTML/CSS/SVG. Works on dark and light backgrounds via the `tone` prop.
 */
export default function CircularArt({ tone = 'dark', compact = false }: { tone?: 'dark' | 'light'; compact?: boolean }) {
  const { t } = useT()
  const nodes = [
    { Icon: Leaf, label: 'Source', cls: 'n1' },
    { Icon: Truck, label: 'Pickup', cls: 'n2' },
    { Icon: Factory, label: 'Processing', cls: 'n3' },
    { Icon: Sprout, label: 'Reuse', cls: 'n4' },
  ]
  return (
    <div className={`ca ca--${tone}${compact ? ' ca--compact' : ''}`} role="img" aria-label={t('Circular flow of material through five stages')}>
      <div className="ca__glow" />
      <svg className="ca__ring" viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <linearGradient id={`caG-${tone}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c5f26b" /><stop offset="1" stopColor="#4ade80" /></linearGradient>
        </defs>
        <circle cx="200" cy="200" r="150" className="ca__track" />
        <circle cx="200" cy="200" r="150" className="ca__run" stroke={`url(#caG-${tone})`} />
        <circle cx="200" cy="200" r="104" className="ca__track ca__track--in" />
      </svg>
      <div className="ca__spin" aria-hidden="true"><i /></div>
      {nodes.map(({ Icon, label, cls }) => (
        <div key={label} className={`ca__node ${cls}`}><span><Icon size={compact ? 18 : 22} /></span><b>{t(label)}</b></div>
      ))}
      <div className="ca__core">
        <div className="ca__coreTop"><span className="ca__coreIco"><Recycle size={16} /></span><div><b>BT-1042</b><small>{t('Plastic · 25 kg')}</small></div></div>
        <div className="ca__bar"><i /></div>
        <div className="ca__coreRow"><span>{t('Processing')}</span><span>72%</span></div>
      </div>
      {!compact && <>
        <div className="ca__chip c1"><CheckCircle2 size={16} /><div><b>{t('Pickup confirmed')}</b><small>{t('Today, 14:00')}</small></div></div>
        <div className="ca__chip c2"><MapPin size={16} /><div><b>{t('Partner matched')}</b><small>{t('3.2 km away')}</small></div></div>
      </>}
    </div>
  )
}
