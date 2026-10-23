import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/LoginPage/LoginPage'
import DashboardPage from '../pages/DashboardPage/DashboardPage'
import { useStore } from '../store/StoreContext'
import MaterialsPage from '../pages/MaterialsPage/MaterialsPage'
import SmartMatchPage from '../pages/SmartMatchPage/SmartMatchPage'
import BatchTrackingPage from '../pages/BatchTrackingPage/BatchTrackingPage'
import CommunityPage from '../pages/CommunityPage/CommunityPage'
import AgreementsPage from '../pages/AgreementsPage/AgreementsPage'
import MarketplacePage from '../pages/MarketplacePage/MarketplacePage'
import ProductDetailPage from '../pages/ProductDetailPage/ProductDetailPage'
import OrdersPage from '../pages/OrdersPage/OrdersPage'
import EcosystemMapPage from '../pages/EcosystemMapPage/EcosystemMapPage'
import AnalyticsPage from '../pages/AnalyticsPage/AnalyticsPage'
import ReportsPage from '../pages/ReportsPage/ReportsPage'
import NotificationsPage from '../pages/NotificationsPage/NotificationsPage'
import SettingsPage from '../pages/SettingsPage/SettingsPage'
import AdminPage from '../pages/AdminPage/AdminPage'
import RegisterPage from '../pages/RegisterPage/RegisterPage'
import HomePage from '../pages/HomePage/HomePage'
import PickupPage from '../pages/Pickup'
import PremiumPage from '../pages/Premium'
import PagePlaceholder from '../pages/PagePlaceholder/PagePlaceholder'
const app = [['dashboard','Dashboard'],['materials','Material Registry'],['matching','SmartMatch'],['tracking','Circular Flow Tracking'],['communities','Communities'],['agreements','Agreements'],['marketplace','Marketplace'],['orders','Orders'],['map','Ecosystem Map'],['analytics','Analytics'],['reports','Reports'],['notifications','Notifications'],['settings','Settings'],['admin','Administration']]
function Guard() { const { user } = useStore(); return user ? <AppShell /> : <Navigate to="/login" replace /> }
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={<Guard />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="matching" element={<SmartMatchPage />} />
        <Route path="tracking" element={<BatchTrackingPage />} />
        <Route path="communities" element={<CommunityPage />} />
        <Route path="agreements" element={<AgreementsPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="map" element={<EcosystemMapPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="pickup" element={<PickupPage />} />
        <Route path="premium" element={<PremiumPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
        {app.filter(([p]) => !['dashboard','materials','matching','tracking','communities','agreements','marketplace','orders','map','analytics','reports','notifications','settings','admin'].includes(p)).map(([p, t]) => <Route key={p} path={p} element={<PagePlaceholder title={t} />} />)}
        <Route path="marketplace/:productId" element={<ProductDetailPage />} />
      </Route>
      <Route path="*" element={<PagePlaceholder title="404 · Not found" />} />
    </Routes>
  )
}
