/** Photo handling for onboarding. Images are resized and stored as blobs in IndexedDB; the store keeps only a reference. */
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_INPUT_BYTES = 15 * 1024 * 1024
const MAX_SIDE = 1600

/** Errors are English keys, translated by the UI with t(). */
export async function processImage(file: File, onProgress: (p: number) => void): Promise<{ blob: Blob; width: number; height: number }> {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) throw new Error('Use a JPG, PNG, or WebP image')
  if (file.size > MAX_INPUT_BYTES) throw new Error('Maximum file size is 15 MB')
  onProgress(10)
  let bmp: ImageBitmap
  try { bmp = await createImageBitmap(file) } catch { throw new Error('Could not process this image') }
  onProgress(40)
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
  const w = Math.max(1, Math.round(bmp.width * scale)), h = Math.max(1, Math.round(bmp.height * scale))
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) { bmp.close(); throw new Error('Could not process this image') }
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h) // PNG transparency becomes white
  ctx.drawImage(bmp, 0, 0, w, h); bmp.close()
  onProgress(75)
  const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.85))
  if (!blob) throw new Error('Could not process this image')
  onProgress(100)
  return { blob, width: w, height: h }
}

const DB = 'sirkula-media', STORE = 'blobs'
let dbp: Promise<IDBDatabase> | null = null
function db(): Promise<IDBDatabase> {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE)
    r.onsuccess = () => res(r.result); r.onerror = () => { dbp = null; rej(r.error) }
  })
  return dbp
}
export async function putBlob(id: string, blob: Blob): Promise<void> {
  const d = await db()
  await new Promise<void>((res, rej) => { const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(blob, id); t.oncomplete = () => res(); t.onerror = t.onabort = () => rej(t.error) })
}
export async function getBlob(id: string): Promise<Blob | undefined> {
  const d = await db()
  return new Promise((res, rej) => { const q = d.transaction(STORE).objectStore(STORE).get(id); q.onsuccess = () => res(q.result ?? undefined); q.onerror = () => rej(q.error) })
}
export async function deleteBlob(id: string): Promise<void> {
  const d = await db()
  await new Promise<void>((res, rej) => { const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).delete(id); t.oncomplete = () => res(); t.onerror = () => rej(t.error) })
}
