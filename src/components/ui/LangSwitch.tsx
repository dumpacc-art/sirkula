import { useStore } from '../../store/StoreContext'
export default function LangSwitch() {
  const { prefs, setPrefs } = useStore()
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button className={prefs.language === 'English' ? 'on' : ''} onClick={() => setPrefs({ language:'English' })}>EN</button>
      <button className={prefs.language === 'Bahasa Indonesia' ? 'on' : ''} onClick={() => setPrefs({ language:'Bahasa Indonesia' })}>ID</button>
    </div>
  )
}
