import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean
  icon?: ReactNode
}

/** Shared button. Pass already-translated text as children. */
export default function Button({ variant = 'primary', size = 'md', loading = false, icon, className = '', children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={`ui-btn ui-btn--${variant} ui-btn--${size}${loading ? ' is-loading' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="ui-btn__spin" aria-hidden="true" /> : icon}
      <span>{children}</span>
    </button>
  )
}
