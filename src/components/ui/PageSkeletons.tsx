import type { CSSProperties, ReactNode } from 'react'
import { useT } from '../../i18n'
import { Skeleton as S, SkeletonCard, SkeletonTable } from './Skeleton'
import './PageSkeletons.css'

/**
 * Placeholder satu halaman penuh. Setiap halaman punya bentuk sendiri yang meniru susunan aslinya
 * (padding, lebar maksimum, header, filter, grid, kartu), jadi saat konten muncul tidak ada lompatan layout.
 * Dipakai oleh Suspense di AppShell selama chunk halaman diunduh. `tab` memilih bentuk tab aktif (Orders, Find Partners).
 */
export type PageSkeletonKind = 'dashboard' | 'pickup' | 'orders' | 'materials' | 'partners' | 'marketplace' | 'analytics' | 'notifications' | 'settings' | 'admin' | 'product' | 'premium'
  | 'table' | 'cards' | 'form' | 'map'

const R = (h: number, r = 14, w: number | string = '100%', style?: CSSProperties) => <S h={h} w={w} style={{ borderRadius: r, ...style }} />
const Box = ({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) => <div className={`skp__box ${className}`} style={style}>{children}</div>
const Pills = ({ n, w = 110, h = 36 }: { n: number; w?: number; h?: number }) => <>{Array.from({ length: n }, (_, i) => <S key={i} w={w} h={h} pill />)}</>

/** Judul halaman: label kecil (opsional), h1 dan 1-2 baris teks. */
const Head = ({ eyebrow = false, lines = 1, w = 300 }: { eyebrow?: boolean; lines?: number; w?: number }) => (
  <div className="skp__head">
    {eyebrow && <S w={84} h={11} />}
    <S w={w} h={34} style={{ maxWidth: '100%' }} />
    {Array.from({ length: lines }, (_, i) => <S key={i} w={i === lines - 1 && lines > 1 ? '48%' : 'min(560px,86%)'} h={12} />)}
  </div>
)
const Kpi = () => <Box className="skp__kpi"><S w="55%" h={10} /><S w="40%" h={26} /></Box>
const Field = ({ h = 44 }: { h?: number }) => <div className="skp__field"><S w={96} h={11} /><S h={h} style={{ borderRadius: 10 }} /></div>
const Rows = ({ n, h = 14 }: { n: number; h?: number }) => <>{Array.from({ length: n }, (_, i) => <div key={i} className="skp__row"><S w={`${72 - (i % 3) * 12}%`} h={h} /><S w={56} h={10} /></div>)}</>

function Dashboard() {
  return <>
    <Box className="skp__dashHead"><div className="skp__col"><S w={110} h={10} /><S w={320} h={30} style={{ maxWidth: '100%' }} /><S w={150} h={12} /></div><div className="skp__acts"><S w={128} h={42} style={{ borderRadius: 8 }} /><S w={150} h={42} style={{ borderRadius: 8 }} /></div></Box>
    <Box className="skp__cta"><S w={60} h={60} circle /><div className="skp__col skp__grow"><S w="42%" h={22} /><S w="64%" h={12} /></div><S w={158} h={50} pill /></Box>
    <div className="skp__grid skp__grid--4">{[0, 1, 2, 3].map(i => <Kpi key={i} />)}</div>
    <div className="skp__grid skp__grid--32"><Box><S w="52%" h={16} style={{ marginBottom: 12 }} />{R(220, 10)}</Box><Box><S w="44%" h={16} style={{ marginBottom: 12 }} />{R(220, 10)}</Box></div>
    <div className="skp__grid skp__grid--2 skp__grid--wide"><div><S w={140} h={16} style={{ marginBottom: 8 }} /><Rows n={3} /></div><div><S w={140} h={16} style={{ marginBottom: 8 }} /><Rows n={6} /></div></div>
  </>
}

function Pickup() {
  return <>
    <Head eyebrow lines={1} w={260} />
    <div className="skp__stepper">{[0, 1, 2].map(i => <div key={i} className="skp__step"><S w={32} h={32} circle /><div className="skp__col"><S w={90} h={13} /><S w={70} h={10} /></div></div>)}</div>
    <Box className="skp__card"><div className="skp__subRow"><S w={210} h={13} /><S w={150} h={6} pill /></div>
      {R(300, 14)}<Field /><Field /><div className="skp__end"><S w={140} h={44} pill /></div></Box>
    <Box className="skp__est"><div className="skp__col"><S w={170} h={14} /><S w="60%" h={10} /></div></Box>
  </>
}

function Orders({ tab }: { tab: string }) {
  return <>
    <Head eyebrow lines={1} w={290} />
    <div className="skp__tabsPill"><Pills n={3} w={104} h={34} /></div>
    {tab === 'history' ? <>
      <div className="skp__bar"><S w={260} h={44} pill /><S w={160} h={44} pill /></div>
      <div className="skp__stack">{[0, 1, 2, 3].map(i => <Box key={i} className="skp__line"><S w={44} h={44} style={{ borderRadius: 12 }} /><div className="skp__col skp__grow"><S w="46%" h={14} /><S w="30%" h={10} /></div><S w={86} h={24} pill /><S w={96} h={38} style={{ borderRadius: 10 }} /></Box>)}</div>
    </> : tab === 'reports' ? <>
      <div className="skp__grid skp__grid--2">{[0, 1, 2, 3].map(i => <Box key={i}><div className="skp__col"><S w="50%" h={16} /><S w="85%" h={11} /><S w={150} h={42} style={{ borderRadius: 10, marginTop: 8 }} /></div></Box>)}</div>
    </> : <>
      <div className="skp__split"><div className="skp__col">{R(400, 16)}<S w="60%" h={11} /></div><Box className="skp__panel"><S w="55%" h={18} />{R(8, 99)}{[0, 1, 2, 3, 4].map(i => <div key={i} className="skp__tl"><S w={20} h={20} circle /><div className="skp__col skp__grow"><S w="55%" h={12} /><S w="35%" h={10} /></div></div>)}{R(44, 12)}</Box></div>
      <div className="skp__detail"><S w={240} h={20} /><S w={300} h={42} style={{ borderRadius: 10 }} /><div className="skp__timeline">{Array.from({ length: 7 }, (_, i) => <S key={i} w={96} h={40} style={{ borderRadius: 10, flex: 'none' }} />)}</div>
        <div className="skp__grid skp__grid--2"><Box><S w="40%" h={16} style={{ marginBottom: 10 }} /><Rows n={4} /></Box><Box><S w="50%" h={16} style={{ marginBottom: 10 }} /><Rows n={4} /></Box></div></div>
    </>}
  </>
}

function Materials() {
  return <>
    <div className="skp__between"><div className="skp__col"><S w={250} h={32} style={{ maxWidth: '100%' }} /><S w={230} h={12} /></div><S w={150} h={42} style={{ borderRadius: 10 }} /></div>
    <div className="skp__bar"><S w={260} h={44} pill /><S w={160} h={44} style={{ borderRadius: 10 }} /><S w={160} h={44} style={{ borderRadius: 10 }} /><S w={160} h={44} style={{ borderRadius: 10 }} /><S w={72} h={44} style={{ borderRadius: 10 }} /></div>
    <SkeletonTable rows={8} cols={8} />
  </>
}

function Partners({ tab }: { tab: string }) {
  return <>
    <Box className="skp__hero"><div className="skp__col skp__grow"><S w={130} h={24} pill /><S w="86%" h={34} /><S w="62%" h={34} /><S w="92%" h={12} /><S w="70%" h={12} /></div>
      <div className="skp__stats">{[0, 1, 2, 3].map(i => <div key={i} className="skp__stat"><S w="62%" h={10} /><S w="34%" h={24} /></div>)}</div></Box>
    <div className="skp__tabsPill"><Pills n={4} w={140} h={34} /></div>
    {(tab === 'nearby' || !tab) && <>
      <div className="skp__bar"><S w={170} h={36} pill /><S w={200} h={36} pill /></div><S w="min(720px,90%)" h={12} />
      <div className="skp__split skp__split--map"><div className="skp__col">{R(440, 18)}</div><div className="skp__stack">{[0, 1, 2, 3].map(i => <Box key={i} className="skp__line"><S w={40} h={40} style={{ borderRadius: 10 }} /><div className="skp__col skp__grow"><S w="62%" h={13} /><S w="40%" h={10} /></div><S w={96} h={34} pill /></Box>)}</div></div>
    </>}
    {tab === 'programs' && <>
      <Box className="skp__invite"><S w={56} h={56} style={{ borderRadius: 18 }} /><div className="skp__col skp__grow"><S w="40%" h={20} /><S w="86%" h={12} /><S w="70%" h={12} /><S w="34%" h={11} /></div><S w={170} h={46} pill /></Box>
      <S w="min(640px,90%)" h={12} />
      <div className="skp__grid skp__grid--3">{[0, 1, 2, 3, 4, 5].map(i => <Box key={i}><div className="skp__col"><S w={44} h={44} style={{ borderRadius: 12 }} /><S w="60%" h={16} /><S w="92%" h={11} /><S w="80%" h={11} /><S w="45%" h={10} /><S w="70%" h={10} /><S w="64%" h={10} /><div className="skp__between" style={{ marginTop: 6 }}><S w={80} h={12} /><S w={88} h={36} pill /></div></div></Box>)}</div>
    </>}
    {tab === 'agreements' && <>
      <div className="skp__grid skp__grid--4">{[0, 1, 2, 3].map(i => <Kpi key={i} />)}</div>
      <div className="skp__bar"><S w={260} h={44} pill /><Pills n={4} w={96} h={36} /></div>
      <div className="skp__split skp__split--even"><div className="skp__stack">{[0, 1, 2].map(i => <SkeletonCard key={i} lines={2} action={false} />)}</div><Box>{R(24, 8, '50%')}<div style={{ height: 12 }} />{R(150, 14)}<div style={{ height: 12 }} />{R(14, 6)}{R(14, 6, '80%', { marginTop: 8 })}{R(14, 6, '65%', { marginTop: 8 })}</Box></div>
    </>}
    {tab === 'communities' && <>
      <Box className="skp__hero skp__hero--short"><div className="skp__col skp__grow"><S w="38%" h={26} /><S w="70%" h={12} /></div><S w={150} h={44} pill /></Box>
      <div className="skp__bar">{[0, 1, 2, 3, 4].map(i => <S key={i} w={130} h={40} pill />)}</div>
      <div className="skp__grid skp__grid--3">{[0, 1, 2].map(c => <div key={c} className="skp__stack"><S w="40%" h={16} />{[0, 1, 2].map(i => <SkeletonCard key={i} lines={2} action={false} />)}</div>)}</div>
    </>}
  </>
}

function Marketplace() {
  return <>
    <div className="skp__between skp__top"><div className="skp__col"><S w={90} h={11} /><S w={300} h={34} style={{ maxWidth: '100%' }} /><S w="min(520px,80vw)" h={12} /><S w="min(380px,60vw)" h={12} /></div><S w={112} h={44} pill /></div>
    <div className="skp__jump"><Pills n={3} w={120} h={36} /></div>
    <Box className="skp__farm"><S w={56} h={56} style={{ borderRadius: 18 }} /><div className="skp__col skp__grow"><S w="34%" h={20} /><S w="82%" h={12} /><S w="58%" h={12} /></div><S w={190} h={42} pill /></Box>
    <div className="skp__chips"><Pills n={9} w={112} h={38} /></div>
    <div className="skp__bar"><S w={280} h={44} pill /><S w={300} h={40} pill /><S w={90} h={24} /><S w={170} h={44} style={{ borderRadius: 10 }} /></div>
    <S w={90} h={12} />
    <div className="skp__products">{Array.from({ length: 8 }, (_, i) => <Box key={i} className="skp__prod"><div className="skp__img"><S h="100%" style={{ borderRadius: 0 }} /></div><div className="skp__col skp__pad"><S w="34%" h={10} /><S w="78%" h={15} /><S w="52%" h={11} /><div className="skp__between"><S w="38%" h={18} /><S w={36} h={36} circle /></div></div></Box>)}</div>
  </>
}

function Analytics() {
  return <>
    <Head lines={2} w={320} />
    <div className="skp__bar"><S w={150} h={44} style={{ borderRadius: 10 }} /><S w={170} h={44} style={{ borderRadius: 10 }} /><S w={170} h={44} style={{ borderRadius: 10 }} /><S w={80} h={44} style={{ borderRadius: 10 }} /><S w={120} h={44} style={{ borderRadius: 10 }} /></div>
    <div className="skp__grid skp__grid--kpi">{Array.from({ length: 9 }, (_, i) => <Kpi key={i} />)}</div>
    <div className="skp__grid skp__grid--2 skp__grid--wide">{Array.from({ length: 6 }, (_, i) => <Box key={i}><S w="46%" h={16} style={{ marginBottom: 12 }} />{R(240, 10)}</Box>)}</div>
    <div className="skp__grid skp__grid--2 skp__grid--wide">{Array.from({ length: 4 }, (_, i) => <Box key={i}><S w="40%" h={16} style={{ marginBottom: 12 }} />{R(220, 10)}</Box>)}</div>
  </>
}

function Notifications() {
  return <>
    <div className="skp__between"><div className="skp__col"><S w={210} h={32} /><S w={90} h={12} /></div><S w={140} h={40} style={{ borderRadius: 10 }} /></div>
    <div className="skp__bar"><S w={200} h={44} style={{ borderRadius: 10 }} /><S w={200} h={44} style={{ borderRadius: 10 }} /></div>
    {Array.from({ length: 6 }, (_, i) => <Box key={i} className="skp__notif"><div className="skp__col skp__grow"><S w="38%" h={15} /><S w="86%" h={11} /><S w="26%" h={10} /></div><div className="skp__acts"><S w={92} h={36} style={{ borderRadius: 8 }} /><S w={64} h={36} style={{ borderRadius: 8 }} /></div></Box>)}
  </>
}

function Settings() {
  const sec = (title: number, fields: number, extra?: ReactNode) => <Box className="skp__sec"><S w={title} h={16} />{Array.from({ length: fields }, (_, i) => <Field key={i} />)}{extra}</Box>
  return <>
    <Head lines={3} w={200} />
    {sec(90, 1, <S w="70%" h={10} />)}{sec(70, 2)}{sec(110, 1)}
    {sec(180, 2, <div className="skp__chk"><S w={20} h={20} style={{ borderRadius: 5 }} /><S w="70%" h={12} /></div>)}
    <div className="skp__acts skp__acts--start"><S w={96} h={44} style={{ borderRadius: 10 }} /><S w={96} h={44} style={{ borderRadius: 10 }} /></div>
    <Box className="skp__sec"><S w={90} h={16} /><S w="68%" h={11} /><S w={130} h={42} style={{ borderRadius: 10 }} /></Box>
  </>
}

function Admin() {
  return <>
    <Head lines={1} w={240} />
    <div className="skp__grid skp__grid--adk">{[0, 1, 2, 3].map(i => <Kpi key={i} />)}</div>
    <div><S w={170} h={18} style={{ marginBottom: 10 }} />{[0, 1].map(i => <div key={i} className="skp__adrow"><S w="58%" h={13} /><div className="skp__acts"><S w={64} h={34} style={{ borderRadius: 8 }} /><S w={64} h={34} style={{ borderRadius: 8 }} /></div></div>)}</div>
    <div><S w={200} h={18} style={{ marginBottom: 10 }} /><div className="skp__adrow"><S w="48%" h={13} /><S w={60} h={14} /></div></div>
    <div className="skp__grid skp__grid--2 skp__grid--wide"><div className="skp__stack"><S w={80} h={18} />{[0, 1, 2].map(i => <S key={i} w={`${70 - i * 8}%`} h={13} />)}</div><div className="skp__stack"><S w={130} h={18} />{[0, 1, 2, 3, 4, 5].map(i => <S key={i} w={`${88 - (i % 3) * 10}%`} h={13} />)}</div></div>
  </>
}

function Product() {
  return <>
    <S w={130} h={14} />
    <div className="skp__grid skp__grid--2 skp__grid--wide skp__pd"><div><div style={{ height: 340 }}>{R(340, 14)}</div><div className="skp__thumbs"><S w={44} h={44} style={{ borderRadius: 8 }} /><S w={44} h={44} style={{ borderRadius: 8 }} /><S w={44} h={44} style={{ borderRadius: 8 }} /></div></div>
      <div className="skp__col skp__info"><S w="70%" h={34} /><S w="55%" h={12} /><S w={180} h={30} /><S w={140} h={24} pill /><S w="95%" h={12} /><S w="80%" h={12} /><S w={90} h={12} /><div className="skp__acts skp__acts--start"><S w={72} h={44} style={{ borderRadius: 10 }} /><S w={150} h={44} style={{ borderRadius: 10 }} /></div>{R(120, 14)}</div></div>
    <div className="skp__col"><S w={160} h={18} /><div className="skp__acts skp__acts--start">{[0, 1, 2].map(i => <S key={i} w={170} h={40} style={{ borderRadius: 10 }} />)}</div></div>
  </>
}

function Premium() {
  return <>
    <div className="skp__hero2"><S w={56} h={56} style={{ borderRadius: 20, flexShrink: 0 }} /><div className="skp__col"><S w={84} h={11} /><S w={240} h={32} /><S w="min(480px,80vw)" h={12} /></div></div>
    {R(116, 20)}
    <div className="skp__col"><S w={140} h={20} /><div className="skp__grid skp__grid--2 skp__grid--wide">{R(250, 28)}{R(250, 28)}</div></div>
    <Box className="skp__ben"><div className="skp__between"><S w={170} h={20} /><S w={200} h={38} pill /></div>{[0, 1, 2].map(i => <div key={i} className="skp__chk"><S w={24} h={24} circle /><S w={`${70 - i * 10}%`} h={13} /></div>)}</Box>
    <Box className="skp__between"><div className="skp__col"><S w={240} h={16} /><S w="min(420px,60vw)" h={11} /></div><S w={170} h={44} pill /></Box>
  </>
}

/** Placeholder umum untuk halaman yang tidak punya bentuk khusus. */
function Generic({ kind }: { kind: 'table' | 'cards' | 'form' | 'map' }) {
  return <>
    <Head />
    {kind === 'table' && <SkeletonTable rows={7} cols={6} />}
    {kind === 'cards' && <div className="sk-page__grid">{[0, 1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} stats={i % 2 === 0} />)}</div>}
    {kind === 'form' && <div className="sk-page__grid"><SkeletonCard lines={6} /><SkeletonCard lines={4} stats /></div>}
    {kind === 'map' && <>{R(320, 20)}<div className="sk-page__grid"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div></>}
  </>
}

export function PageSkeleton({ kind = 'cards', tab = '' }: { kind?: PageSkeletonKind; tab?: string }) {
  const { t } = useT()
  return (
    <div className={`skp skp--${kind}`} role="status" aria-busy="true" aria-label={t('Loading…')}>
      {kind === 'dashboard' && <Dashboard />}
      {kind === 'pickup' && <Pickup />}
      {kind === 'orders' && <Orders tab={tab} />}
      {kind === 'materials' && <Materials />}
      {kind === 'partners' && <Partners tab={tab} />}
      {kind === 'marketplace' && <Marketplace />}
      {kind === 'analytics' && <Analytics />}
      {kind === 'notifications' && <Notifications />}
      {kind === 'settings' && <Settings />}
      {kind === 'admin' && <Admin />}
      {kind === 'product' && <Product />}
      {kind === 'premium' && <Premium />}
      {(kind === 'table' || kind === 'cards' || kind === 'form' || kind === 'map') && <Generic kind={kind} />}
    </div>
  )
}
