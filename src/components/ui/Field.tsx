import { useId, type ReactNode } from 'react'
import './Field.css'

export interface FieldControlProps { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean; 'aria-required'?: boolean }

/**
 * Labelled form field with hint and error text wired up for assistive tech.
 * Usage: <Field label={t('Email')} error={err}>{p => <input {...p} />}</Field>
 * Pass already-translated strings.
 */
export default function Field({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: (p: FieldControlProps) => ReactNode }) {
  const id = useId(), hintId = `${id}-hint`, errId = `${id}-err`
  const described = [hint ? hintId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className={`ui-field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}{required && <span className="ui-field__req" aria-hidden="true"> *</span>}</label>
      {children({ id, 'aria-describedby': described, 'aria-invalid': error ? true : undefined, 'aria-required': required || undefined })}
      {hint && <small id={hintId} className="ui-field__hint">{hint}</small>}
      {error && <small id={errId} className="ui-field__err" role="alert">{error}</small>}
    </div>
  )
}
