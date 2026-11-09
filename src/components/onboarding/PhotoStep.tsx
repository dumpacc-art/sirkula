import { useEffect, useRef, useState, type DragEvent } from 'react'
import { Camera, ImagePlus, ImageOff, RefreshCw, Trash2 } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Button from '../ui/Button'
import { processImage, putBlob, getBlob, deleteBlob, ACCEPTED_TYPES } from '../../lib/photos'
import './PhotoStep.css'

/** Onboarding step 2 (optional). The photo lives in IndexedDB; the store keeps its reference so reloads keep it. */
export default function PhotoStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { onboarding, updateOnboarding } = useStore(); const { t } = useT()
  const ref = onboarding.photo
  const [url, setUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'missing'>(ref ? 'loading' : 'idle')
  const [busy, setBusy] = useState(false); const [progress, setProgress] = useState(0)
  const [err, setErr] = useState(''); const [drag, setDrag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null), camRef = useRef<HTMLInputElement>(null)
  // Camera button only when the browser exposes camera access; mobile browsers also open the camera from the file input.
  const cameraOk = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  // Load the stored photo after a reload. Revoke the object URL when the photo changes or the step unmounts.
  useEffect(() => {
    let alive = true, objectUrl: string | null = null
    if (!ref) { setUrl(null); setStatus('idle'); return }
    setStatus('loading')
    getBlob(ref.id).then(b => {
      if (!alive) return
      if (!b) { setStatus('missing'); return }
      objectUrl = URL.createObjectURL(b); setUrl(objectUrl); setStatus('ready')
    }).catch(() => { if (alive) setStatus('missing') })
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [ref?.id])

  const handleFile = async (file?: File | null) => {
    if (!file) return
    setErr(''); setBusy(true); setProgress(0)
    try {
      const img = await processImage(file, setProgress)
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ph-${Date.now()}`
      await putBlob(id, img.blob)
      const previous = ref
      updateOnboarding({ photo: { id, name: file.name, width: img.width, height: img.height, size: img.blob.size, savedAt: new Date().toISOString() } })
      if (previous) deleteBlob(previous.id).catch(() => undefined)
    } catch (e: any) {
      setErr(e?.message === 'Use a JPG, PNG, or WebP image' || e?.message === 'Maximum file size is 15 MB' || e?.message === 'Could not process this image'
        ? e.message : 'Could not save the photo on this device.')
    } finally {
      setBusy(false); setProgress(0)
      if (fileRef.current) fileRef.current.value = ''
      if (camRef.current) camRef.current.value = ''
    }
  }
  const remove = async () => {
    if (!ref) return
    await deleteBlob(ref.id).catch(() => undefined)
    updateOnboarding({ photo: null }); setErr('')
  }
  const pick = () => fileRef.current?.click()
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]) }
  const accept = ACCEPTED_TYPES.join(',')

  return (
    <section className="pho" aria-labelledby="pho-title">
      <header className="pho__head">
        <h2 id="pho-title">{t('Upload a photo of your waste')}</h2>
        <p>{t('A clear photo helps us confirm the material before pickup. Optional, but recommended.')}</p>
      </header>

      {status === 'ready' && url && ref ? (
        <figure className="pho__preview">
          <img src={url} alt={t('Photo of your waste')} />
          <figcaption>{ref.name} · {ref.width}×{ref.height} · {Math.round(ref.size / 1024)} KB</figcaption>
          <div className="pho__actions">
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={pick} disabled={busy}>{t('Replace photo')}</Button>
            <Button variant="ghost" icon={<Trash2 size={16} />} onClick={remove} disabled={busy}>{t('Remove')}</Button>
          </div>
        </figure>
      ) : status === 'loading' ? (
        <p className="pho__muted" role="status">{t('Loading your photo…')}</p>
      ) : status === 'missing' ? (
        <div className="pho__state" role="alert">
          <ImageOff size={28} />
          <b>{t('The saved photo is no longer on this device.')}</b>
          <Button onClick={pick} disabled={busy}>{t('Upload again')}</Button>
        </div>
      ) : (
        <div className={`pho__drop${drag ? ' is-drag' : ''}`} onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)} onDrop={onDrop}>
          <ImagePlus size={32} aria-hidden="true" />
          <b>{t('Drop an image here')}</b>
          <small>{t('JPG, PNG or WebP, up to 15 MB')}</small>
          <div className="pho__actions">
            <Button icon={<ImagePlus size={16} />} onClick={pick} loading={busy}>{t('Choose file')}</Button>
            {cameraOk && <Button variant="secondary" icon={<Camera size={16} />} onClick={() => camRef.current?.click()} disabled={busy}>{t('Use camera')}</Button>}
          </div>
        </div>
      )}

      {busy && (
        <div className="pho__progress" role="progressbar" aria-label={t('Processing photo')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
      {err && <p className="pho__err" role="alert">{t(err)}</p>}

      <input ref={fileRef} type="file" accept={accept} hidden onChange={e => handleFile(e.target.files?.[0])} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={e => handleFile(e.target.files?.[0])} />

      <div className="pho__nav">
        <Button variant="ghost" onClick={onBack} disabled={busy}>{t('Back')}</Button>
        <Button size="lg" onClick={onNext} disabled={busy}>{t('Continue')}</Button>
      </div>
    </section>
  )
}
