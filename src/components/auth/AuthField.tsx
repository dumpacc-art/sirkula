import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './auth.css'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  icon: ReactNode
  error?: string
  hint?: string
  /** Shows a show/hide toggle (used for password inputs). Pass already-translated labels. */
  toggleLabels?: { show: string; hide: string }
}

/**
 * Input with a leading icon. The icon sits inside the field and the text/placeholder is pushed right
 * (see .af__input in auth.css) so the hint never touches the icon.
 */
export default function AuthField({ label, icon, error, hint, toggleLabels, type = 'text', ...rest }: Props) {
  const id = useId(), [show, setShow] = useState(false)
  const isPw = !!toggleLabels
  return (
    <div className={`af${error ? ' has-error' : ''}`}>
      <label className="af__label" htmlFor={id}>{label}</label>
      <div className="af__ctl">
        <span className="af__icon" aria-hidden="true">{icon}</span>
        <input id={id} className={`af__input${isPw ? ' af__input--pw' : ''}`} type={isPw && show ? 'text' : type}
          aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined} {...rest} />
        {toggleLabels && <button type="button" className="af__eye" onClick={() => setShow(s => !s)} aria-label={show ? toggleLabels.hide : toggleLabels.show}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
      </div>
      {error ? <small id={`${id}-e`} className="af__err" role="alert">{error}</small> : hint ? <small id={`${id}-h`} className="af__hint">{hint}</small> : null}
    </div>
  )
}
