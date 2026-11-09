import Logo from './Logo'
/** Layar tunggu bermerek untuk Suspense tingkat route (sebelum AppShell ada). */
export default function BrandSplash() {
  return <div className="brand-splash" role="status" aria-busy="true" aria-label="SIRKULA"><Logo variant="mark" height={84} /><span className="brand-splash__bar" aria-hidden="true" /></div>
}
