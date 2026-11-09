import { useEffect, useState } from 'react'
import { getBlob } from '../../lib/photos'
import { useT } from '../../i18n'
import { ImageOff } from 'lucide-react'
import './OrderPhoto.css'

/** Photo attached to an order. The image lives in IndexedDB; the order only holds its id. Falls back when this device has no copy. */
export default function OrderPhoto({ photoId, alt }: { photoId: string | null; alt: string }) {
  const { t } = useT()
  const [src, setSrc] = useState<string | null>(null)
  const [missing, setMissing] = useState(!photoId)
  useEffect(() => {
    if (!photoId) { setMissing(true); return }
    let url: string | null = null, alive = true
    getBlob(photoId).then(b => {
      if (!alive) return
      if (b) { url = URL.createObjectURL(b); setSrc(url); setMissing(false) } else setMissing(true)
    }).catch(() => alive && setMissing(true))
    return () => { alive = false; if (url) URL.revokeObjectURL(url) }
  }, [photoId])
  if (src) return <img className="opho" src={src} alt={alt} loading="lazy" />
  return (
    <div className="opho opho--empty" role="img" aria-label={t('No photo on this device')}>
      <ImageOff size={22} aria-hidden="true" />
      <span>{missing ? t('No photo on this device') : t('Loading photo…')}</span>
    </div>
  )
}
