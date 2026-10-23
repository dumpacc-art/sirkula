import { useStore } from '../store/StoreContext'
import { translate } from './translate'
export { translate }
export type { Lang } from './translate'

export function useT() {
  const { prefs } = useStore()
  const t = (text: string, vars?: Record<string, string | number>) => translate(prefs.language, text, vars)
  return { t, lang: prefs.language }
}
