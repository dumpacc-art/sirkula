import { useT } from '../../i18n'
import { adminWaUrl } from '../../config/contact'
import WhatsAppIcon from './WhatsAppIcon'
import './AdminWhatsApp.css'

/** Tombol "Hubungi admin via WhatsApp". Variasi: solid/ghost (tombol), rail (sidebar, ikon saja saat collapse), tile (lembar menu mobile). */
export default function AdminWhatsApp({ variant = 'solid', collapsed = false, message, label }: { variant?: 'solid' | 'ghost' | 'rail' | 'tile'; collapsed?: boolean; message?: string; label?: string }) {
  const { t } = useT()
  const text = label ?? t('Contact admin')
  return (
    <a className={`wa wa--${variant}${collapsed ? ' wa--collapsed' : ''}`} href={adminWaUrl(message)} target="_blank" rel="noopener noreferrer" title={t('Chat admin via WhatsApp')} aria-label={`${text} (WhatsApp)`}>
      <WhatsAppIcon size={variant === 'tile' ? 22 : 18} />
      {!collapsed && <span>{text}</span>}
    </a>
  )
}
