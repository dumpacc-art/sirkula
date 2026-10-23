import type { ElementType, ReactNode } from 'react'
import './Card.css'

/** Shared surface for grouped content. Pass already-translated title text. */
export default function Card({ as: Tag = 'section', title, actions, padded = true, interactive = false, className = '', children }: {
  as?: ElementType; title?: string; actions?: ReactNode; padded?: boolean; interactive?: boolean; className?: string; children: ReactNode
}) {
  return (
    <Tag className={`ui-card${padded ? ' ui-card--pad' : ''}${interactive ? ' ui-card--link' : ''}${className ? ` ${className}` : ''}`}>
      {(title || actions) && <div className="ui-card__head">{title && <h3>{title}</h3>}{actions && <div className="ui-card__act">{actions}</div>}</div>}
      {children}
    </Tag>
  )
}
