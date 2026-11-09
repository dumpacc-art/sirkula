import { Check } from 'lucide-react'
import { useT } from '../../i18n'
import './Stepper.css'

/** Horizontal progress for the Pickup flow. `current` is 1-based; a value above the last step marks every step as done. */
export default function Stepper({ steps, current }: { steps: { key: string; label: string; hint: string }[]; current: number }) {
  const { t } = useT()
  return (
    <ol className="stp" aria-label={t('Progress')}>
      {steps.map((s, i) => {
        const n = i + 1, state = n < current ? 'done' : n === current ? 'now' : 'next'
        return (
          <li key={s.key} className={`stp__item stp__item--${state}`} aria-current={state === 'now' ? 'step' : undefined}>
            <span className="stp__dot">{state === 'done' ? <Check size={15} strokeWidth={3} aria-hidden="true" /> : n}</span>
            <span className="stp__txt"><b>{t(s.label)}</b><small>{t(s.hint)}</small></span>
          </li>
        )
      })}
    </ol>
  )
}
