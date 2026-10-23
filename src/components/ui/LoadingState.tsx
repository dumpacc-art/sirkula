import { useT } from '../../i18n'
import './LoadingState.css'

/** Inline loading indicator, announced politely to screen readers. */
export default function LoadingState({ label }: { label?: string }) {
  const { t } = useT()
  return <div className="ui-loading" role="status" aria-live="polite"><span className="ui-loading__spin" aria-hidden="true" /><span>{label ?? t('Loading…')}</span></div>
}
