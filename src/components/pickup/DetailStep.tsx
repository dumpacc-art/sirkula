import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import PickupLocationStep from '../onboarding/PickupLocationStep'
import PhotoStep from '../onboarding/PhotoStep'
import WasteTypeStep from '../onboarding/WasteTypeStep'
import QuantityStep from '../onboarding/QuantityStep'
import ReviewStep from '../onboarding/ReviewStep'
import { ONBOARDING_STEPS } from '../../config/onboarding'
import PriceEstimator from './PriceEstimator'

/**
 * Pickup › step 1 (Detail). Location, photo, waste types, quantity and a final review.
 * These used to be a separate onboarding wizard; the same saved draft is used, so a reload resumes where the user left off.
 */
export default function DetailStep({ onSubmitted }: { onSubmitted: (subId: string) => void }) {
  const { onboarding, updateOnboarding } = useStore(); const { t } = useT()
  const last = ONBOARDING_STEPS.length - 1
  const step = Math.min(Math.max(onboarding.step ?? 0, 0), last)
  const go = (n: number) => updateOnboarding({ step: n })
  return (
    <>
      <div className="pw__card">
        <div className="pw__sub">
          <span className="pw__subTxt">{t('Step {n} of {total}', { n: step + 1, total: ONBOARDING_STEPS.length })} · <b>{t(ONBOARDING_STEPS[step].title)}</b></span>
          <div className="pw__bar" role="progressbar" aria-label={t('Detail progress')} aria-valuemin={1} aria-valuemax={ONBOARDING_STEPS.length} aria-valuenow={step + 1}>
            <span style={{ width: `${((step + 1) / ONBOARDING_STEPS.length) * 100}%` }} />
          </div>
        </div>
        {step === 0 && <PickupLocationStep onDone={() => go(1)} />}
        {step === 1 && <PhotoStep onBack={() => go(0)} onNext={() => go(2)} />}
        {step === 2 && <WasteTypeStep onBack={() => go(1)} onDone={() => go(3)} />}
        {step === 3 && <QuantityStep onBack={() => go(2)} onNext={() => go(4)} />}
        {step === 4 && <ReviewStep onBack={() => go(3)} onGoTo={go} onSubmitted={onSubmitted} />}
      </div>
      {step === 0 && (
        <details className="pw__est">
          <summary>{t('Quick price estimate')}<small>{t('Check the cost for an address and weight before you fill in the details.')}</small></summary>
          <div className="pw__estBody"><PriceEstimator /></div>
        </details>
      )}
    </>
  )
}
