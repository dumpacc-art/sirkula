import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import { PageSkeleton, type PageSkeletonKind } from '../ui/Skeleton'
import './AppShell.css'

/** Bentuk skeleton per halaman, supaya placeholder terlihat seperti halaman yang akan terbuka. Halaman baru yang belum terdaftar memakai bentuk 'cards'. */
const KIND: Record<string, PageSkeletonKind> = {
  dashboard: 'dashboard', pickup: 'pickup', orders: 'orders', materials: 'materials', partners: 'partners', marketplace: 'marketplace',
  analytics: 'analytics', notifications: 'notifications', settings: 'settings', admin: 'admin', premium: 'premium',
}
const kindFor = (pathname: string): PageSkeletonKind => {
  const [, , section, sub] = pathname.split('/')
  return section === 'marketplace' && sub ? 'product' : KIND[section ?? ''] ?? 'cards'
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname, search } = useLocation()
  return (
    <div className="shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="shell__main">
        <Topbar />
        {/* Konten tidak lagi memakai opacity awal 0 dari framer-motion (penyebab elemen kadang tidak muncul); transisi masuk murni CSS dan selalu berakhir terlihat. Skeleton hanya tampil saat chunk halaman benar-benar sedang diunduh (React.lazy), tanpa jeda buatan. */}
        <main key={pathname} className="shell__content">
          <Suspense fallback={<PageSkeleton kind={kindFor(pathname)} tab={new URLSearchParams(search).get('tab') ?? ''} />}><Outlet /></Suspense>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
