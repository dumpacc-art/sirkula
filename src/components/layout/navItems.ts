import { LayoutDashboard, Truck, ClipboardList, Package, Handshake, Store, BarChart3, Settings, Shield, Crown, type LucideIcon } from 'lucide-react'
export interface NavItem { to: string; label: string; Icon: LucideIcon; group: 'main' | 'network' | 'account' }
/** Satu sumber menu untuk sidebar (desktop) dan navigasi bawah (mobile). Pickup = Detail → Pilih mitra → Konfirmasi. Orders = Aktif, Riwayat, Laporan. */
export const navItems: NavItem[] = [
  { to:'dashboard', label:'Dashboard', Icon:LayoutDashboard, group:'main' },
  { to:'pickup', label:'Pickup', Icon:Truck, group:'main' },
  { to:'orders', label:'Orders', Icon:ClipboardList, group:'main' },
  { to:'materials', label:'Materials', Icon:Package, group:'network' },
  { to:'partners', label:'Find Partners', Icon:Handshake, group:'network' },
  { to:'marketplace', label:'Marketplace', Icon:Store, group:'network' },
  { to:'analytics', label:'Analytics', Icon:BarChart3, group:'network' },
  { to:'premium', label:'Premium', Icon:Crown, group:'account' },
  { to:'settings', label:'Settings', Icon:Settings, group:'account' },
  { to:'admin', label:'Admin', Icon:Shield, group:'account' },
]
export const NAV_GROUPS: { key: NavItem['group']; label: string }[] = [
  { key:'main', label:'Main' }, { key:'network', label:'Circular network' }, { key:'account', label:'Account' },
]
