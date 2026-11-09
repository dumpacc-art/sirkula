import { useT } from '../../i18n'
import './CourierScene.css'

/** Adegan kartun status pickup. Maskot "Truki" (truk ramah) milik SIRKULA. Murni SVG + CSS, menghormati prefers-reduced-motion. */
const SCENES: Record<string, { mode: 'found' | 'drive' | 'arrive' | 'done'; title: string; sub: string }> = {
  matched: { mode: 'found', title: 'Partner found!', sub: 'Truki is getting ready for you.' },
  collector_assigned: { mode: 'found', title: 'Collector assigned!', sub: 'Truki is on the job.' },
  on_the_way_to_pickup: { mode: 'drive', title: 'On the way!', sub: 'Truki is heading to your location.' },
  arrived_at_pickup: { mode: 'arrive', title: 'Truki has arrived!', sub: 'Please hand over your waste.' },
  partner_ready: { mode: 'done', title: "You're a partner now!", sub: 'Pickup orders will arrive in your dashboard.' },
  waste_collected: { mode: 'done', title: 'All loaded!', sub: 'Thanks for sorting your waste.' },
}
const trees = [20, 100, 185, 265].flatMap(x => [x, x + 360])
export default function CourierScene({ status }: { status: string }) {
  const { t } = useT(); const sc = SCENES[status]
  if (!sc) return null
  return (
    <div className={`cs cs--${sc.mode}`} role="img" aria-label={`${t(sc.title)} ${t(sc.sub)}`}>
      <svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfeaff" /><stop offset="1" stopColor="#eafaf0" /></linearGradient></defs>
        <rect width="360" height="150" fill="url(#cs-sky)" />
        <circle cx="300" cy="28" r="14" fill="#ffe27a" className="cs__sun" />
        <g className="cs__cloud"><ellipse cx="40" cy="30" rx="22" ry="8" fill="#fff" /><ellipse cx="54" cy="24" rx="14" ry="8" fill="#fff" /></g>
        <g className="cs__cloud cs__cloud--2"><ellipse cx="40" cy="52" rx="16" ry="6" fill="#fff" opacity=".9" /><ellipse cx="50" cy="47" rx="10" ry="6" fill="#fff" opacity=".9" /></g>
        <g className="cs__trees">{trees.map(x => <g key={x}><rect x={x + 6} y="96" width="5" height="18" fill="#7a5a3a" /><circle cx={x + 8} cy="90" r="14" fill="#34b36b" /><circle cx={x + 2} cy="98" r="9" fill="#2a9a5c" /></g>)}</g>
        <g className="cs__house"><rect x="290" y="82" width="42" height="32" rx="3" fill="#fff" /><path d="M285 84 L311 62 L337 84Z" fill="#e5603f" /><rect x="304" y="96" width="14" height="18" rx="2" fill="#0f6b47" /></g>
        <rect y="112" width="360" height="38" fill="#33413a" /><path className="cs__dash" d="M0 131 H360" stroke="#fff" strokeWidth="3" strokeDasharray="22 18" />
        <g className="cs__speed" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M40 100 h30" /><path d="M20 114 h40" /><path d="M48 126 h26" /></g>
        <g className="cs__truck">
          <rect x="100" y="70" width="80" height="46" rx="9" fill="#0f6b47" /><circle cx="140" cy="93" r="12" fill="#c5f26b" /><path d="M134 98 q6-14 14-10 q-2 12-14 10Z" fill="#0f6b47" />
          <path d="M180 82 h26 q10 0 16 10 l10 12 v12 h-52Z" fill="#c5f26b" /><path d="M189 88 h15 q6 0 10 9 h-25Z" fill="#f2fdff" />
          <g className="cs__eyes"><circle cx="196" cy="94" r="2.6" fill="#0b2a1f" /><circle cx="205" cy="94" r="2.6" fill="#0b2a1f" /></g>
          <path d="M194 99 q7 5 14 0" stroke="#0b2a1f" strokeWidth="1.8" fill="none" strokeLinecap="round" /><circle cx="190" cy="98" r="2.5" fill="#ff9aa8" opacity=".8" />
          {[142, 205].map(cx => <g key={cx} className="cs__wheel"><circle cx={cx} cy="118" r="11" fill="#1b1f1d" /><circle cx={cx} cy="118" r="5" fill="#dfe8e2" /><path d={`M${cx - 4} 118 h8`} stroke="#33413a" strokeWidth="2" /></g>)}
        </g>
        <g className="cs__bubble"><rect x="214" y="44" width="58" height="22" rx="11" fill="#fff" /><path d="M226 66 l-4 8 l12 -8Z" fill="#fff" /><text x="243" y="59" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0b2a1f">{sc.mode === 'arrive' ? 'Halo!' : sc.mode === 'done' ? 'Yay!' : 'Siap!'}</text></g>
        <g className="cs__confetti">{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <rect key={i} x={110 + i * 17} y="10" width="6" height="9" rx="2" fill={['#c5f26b', '#ff9aa8', '#ffe27a', '#7fe0b0', '#8ab4ff'][i % 5]} style={{ animationDelay: `${i * .14}s` }} />)}</g>
      </svg>
      <div className="cs__cap"><b>{t(sc.title)}</b><span>{t(sc.sub)}</span></div>
    </div>
  )
}
