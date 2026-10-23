import { Link } from 'react-router-dom'
import { useT } from '../../i18n'
import './PagePlaceholder.css'
export default function PagePlaceholder({ title }: { title: string }) {
  const { t } = useT()
  return <div className="ph"><h1>{t(title)}</h1><p>{t('This page is not available yet.')}</p><Link to="/">{t('Back to home')}</Link></div>
}
