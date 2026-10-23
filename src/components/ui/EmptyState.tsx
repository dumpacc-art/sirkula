import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Inbox } from 'lucide-react'
import './EmptyState.css'

/** empty = no data yet, error = something failed, pending = waiting (e.g. verification), success = done. */
export type StateTone = 'empty' | 'error' | 'pending' | 'success'
const icons = { empty: Inbox, error: AlertTriangle, pending: Clock, success: CheckCircle2 } as const

/** Pass already-translated title/description. `action` is usually a <Button>. */
export default function EmptyState({ tone = 'empty', title, description, action }: { tone?: StateTone; title: string; description?: string; action?: ReactNode }) {
  const Icon = icons[tone]
  return (
    <div className={`ui-state ui-state--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="ui-state__ico" aria-hidden="true"><Icon size={22} /></span>
      <b>{title}</b>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
