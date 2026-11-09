import { useT } from '../../i18n'
import Button from '../ui/Button'
import { EWASTE_TEAM } from '../../config/ewasteTeam'
import type { Submission } from '../../types'
import './EwasteTeamCard.css'

/** Replaces the partner list for e-waste orders. Regular partners are never shown for e-waste. */
export default function EwasteTeamCard({ sub, onRoute, onCancel, onConfirm }: { sub: Submission; onRoute: () => void; onCancel: () => void; onConfirm: () => void }) {
  const { t } = useT()
  const routed = sub.status === 'sirkula_team'
  return (
    <section className="ew" aria-labelledby="ew-title">
      <span className="ew__tag">{t('E-waste is not matched with regular partners.')}</span>
      <h2 id="ew-title">{t(EWASTE_TEAM.name)}</h2>
      <p>{t('This order contains e-waste. It skips fictional partner matching and goes to the SIRKULA team, which handles collection and safe processing.')}</p>
      <dl>
        <dt>{t('Estimated total weight (kg)')}</dt><dd>{sub.quantity.kg.toLocaleString('en-US', { maximumFractionDigits: 2 })} kg</dd>
        <dt>{t('Waste categories')}</dt><dd>{sub.wasteTypes.length}</dd>
      </dl>
      {routed ? <>
        <p className="ew__done" role="status">{t('Routed to the SIRKULA team')}</p>
        <div className="ew__row">
          <Button size="lg" onClick={onConfirm} disabled={!!sub.orderId}>{t('Confirm pickup')}</Button>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={!!sub.orderId}>{t('Cancel selection')}</Button>
        </div>
      </> : (
        <Button size="lg" onClick={onRoute}>{t('Send to SIRKULA E-Waste team')}</Button>
      )}
    </section>
  )
}
