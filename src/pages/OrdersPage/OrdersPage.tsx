import { useSearchParams } from 'react-router-dom'
import { Activity, History, FileBarChart } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import ActiveTab from '../../components/orders/ActiveTab'
import HistoryTab from '../../components/orders/HistoryTab'
import ReportsPanel from '../../components/tracking/ReportsPanel'
import './OrdersPage.css'

type Tab = 'active' | 'history' | 'reports'
const TABS: { key: Tab; label: string; Icon: typeof Activity }[] = [
  { key: 'active', label: 'Active', Icon: Activity },
  { key: 'history', label: 'History', Icon: History },
  { key: 'reports', label: 'Reports', Icon: FileBarChart },
]

/**
 * Orders: everything about a pickup order after it is confirmed, in one place.
 * Active = live tracking, History = completed orders and receipts, Reports = CSV exports.
 *   ?tab=active|history|reports   ?order=<id> focuses one order
 */
export default function OrdersPage() {
  const { pickupOrders, orderHistory } = useStore(); const { t } = useT()
  const [params, setParams] = useSearchParams()
  const q = params.get('tab')
  const tab: Tab = q === 'history' || q === 'reports' ? q : 'active'
  const setTab = (k: Tab) => setParams(k === 'active' ? {} : { tab: k }, { replace: true })
  const count: Partial<Record<Tab, number>> = { active: pickupOrders.length, history: orderHistory.length }
  const lead: Record<Tab, string> = {
    active: 'Follow your pickup on the map. Each status is recorded with a time.',
    history: 'Completed pickups and their receipts. Kept for your records.',
    reports: 'DEMO reports generated from prototype data, exported as CSV.',
  }
  return (
    <div className="ord">
      <header className="ord__head">
        <div>
          <span className="ord__eyebrow">{t('Orders')}</span>
          <h1>{t('Your pickup orders')}</h1>
          <p>{t(lead[tab])}</p>
        </div>
      </header>

      <div className="ord__tabs" role="tablist" aria-label={t('Orders')}>
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} type="button" role="tab" id={`ord-tab-${key}`} aria-selected={tab === key} aria-controls="ord-panel"
            className={`ord__tab${tab === key ? ' on' : ''}`} onClick={() => setTab(key)}>
            <Icon size={16} aria-hidden="true" />{t(label)}
            {count[key] !== undefined && <i>{count[key]}</i>}
          </button>
        ))}
      </div>

      <div id="ord-panel" role="tabpanel" aria-labelledby={`ord-tab-${tab}`} className="ord__panel">
        {tab === 'active' && <ActiveTab onViewReceipt={id => setParams({ tab: 'history', order: id, receipt: '1' }, { replace: true })} />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'reports' && <ReportsPanel />}
      </div>
    </div>
  )
}
