import { useT } from '../../i18n'
import './StatusBadge.css'
export default function StatusBadge({ status }: { status: string }) {
  const { t } = useT()
  return <span className={`sbadge sbadge--${status}`}>{t(status.replace(/_/g, ' '))}</span>
}
