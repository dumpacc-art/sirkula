import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/LoginPage/LoginPage'
const DashboardPage = lazy(() => import('../pages/DashboardPage/DashboardPage'))
import { useStore } from '../store/StoreContext'
const MaterialsPage = lazy(() => import('../pages/MaterialsPage/MaterialsPage'))
const MarketplacePage = lazy(() => import('../pages/MarketplacePage/MarketplacePage'))
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage/ProductDetailPage'))
const PartnersPage = lazy(() => import('../pages/PartnersPage/PartnersPage'))
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage/AnalyticsPage'))
const NotificationsPage = lazy(() => import('../pages/NotificationsPage/NotificationsPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage/SettingsPage'))
const AdminPage = lazy(() => import('../pages/AdminPage/AdminPage'))
import SignUpPage from '../pages/SignUpPage/SignUpPage'
import HomePage from '../pages/HomePage/HomePage'
const PickupPage = lazy(() => import('../pages/Pickup/Pickup'))
const OrdersPage = lazy(() => import('../pages/OrdersPage/OrdersPage'))
const PremiumPage = lazy(() => import('../pages/Premium/Premium'))
import PagePlaceholder from '../pages/PagePlaceholder/PagePlaceholder'
import BrandSplash from '../components/brand/BrandSplash'
function Guard() {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />
  return <AppShell />
}
/** Old menu URLs keep working: the query string (?order=, ?sub=, ...) is carried over to the new page. */
function Move({ to, tab }: { to: string; tab?: string }) {
  const { search } = useLocation()
  const q = new URLSearchParams(search)
  if (tab && !q.has('tab')) q.set('tab', tab)
  const qs = q.toString()
  return <Navigate to={`${to}${qs ? `?${qs}` : ''}`} replace />
}
export default function AppRoutes() {
  return (
    <Suspense fallback={<BrandSplash />}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />
      <Route path="/onboarding" element={<Navigate to="/app/pickup" replace />} />
      <Route path="/app" element={<Guard />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="matching" element={<Move to="/app/pickup" />} />
        <Route path="tracking" element={<Move to="/app/orders" />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="communities" element={<Move to="/app/partners" tab="communities" />} />
        <Route path="agreements" element={<Move to="/app/partners" tab="agreements" />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="history" element={<Move to="/app/orders" tab="history" />} />
        <Route path="map" element={<Move to="/app/partners" />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<Move to="/app/orders" tab="reports" />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="pickup" element={<PickupPage />} />
        <Route path="premium" element={<PremiumPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="marketplace/:productId" element={<ProductDetailPage />} />
      </Route>
      <Route path="*" element={<PagePlaceholder title="404 · Not found" />} />
    </Routes>
    </Suspense>
  )
}
