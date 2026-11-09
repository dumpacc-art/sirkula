import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import './SettingsPage.css'
export default function SettingsPage() {
  const { user, prefs, updateUser, setPrefs, logout, notify } = useStore(); const { t } = useT(); const nav = useNavigate()
  const [d, setD] = useState({ name:user?.name ?? '', email:user?.email ?? '', org:user?.org ?? '', currency:prefs.currency, units:prefs.units, emailAlerts:prefs.emailAlerts }), [err, setErr] = useState<Record<string, string>>({})
  const reset = () => { setD({ name:user?.name ?? '', email:user?.email ?? '', org:user?.org ?? '', currency:prefs.currency, units:prefs.units, emailAlerts:prefs.emailAlerts }); setErr({}) }
  const save = () => { const x: Record<string, string> = {}
    if (!d.name.trim()) x.name = 'Name is required'; if (!/^\S+@\S+\.\S+$/.test(d.email)) x.email = 'Enter a valid email'; if (!d.org.trim()) x.org = 'Organization is required'
    setErr(x); if (Object.keys(x).length) return
    updateUser({ name:d.name.trim(), email:d.email, org:d.org.trim() }); setPrefs({ currency:d.currency, units:d.units, emailAlerts:d.emailAlerts }); notify('Settings saved on this device') }
  const signOut = () => { logout(); nav('/login') }
  return (
    <div className="st">
      <header><h1>{t('Settings')}</h1><p>{t('Stored in this browser only. The language applies immediately. Currency and unit choices are simulated and do not yet convert displayed data.')}</p></header>
      <section><h3>{t('Language')}</h3>
        <label>{t('Interface language')}<Select value={prefs.language} onChange={v => { setPrefs({ language:v }) }} options={[{ value:'English', label:'English' }, { value:'Bahasa Indonesia', label:'Bahasa Indonesia' }]} /></label>
        <small>{t('Applies instantly across the whole platform and is remembered on this device.')}</small></section>
      <section><h3>{t('Profile')}</h3><label>{t('Name')}<input value={d.name} onChange={e => setD({ ...d, name:e.target.value })} />{err.name && <em>{t(err.name)}</em>}</label>
        <label>{t('Email')}<input value={d.email} onChange={e => setD({ ...d, email:e.target.value })} />{err.email && <em>{t(err.email)}</em>}</label></section>
      <section><h3>{t('Organization')}</h3><label>{t('Organization')}<input value={d.org} onChange={e => setD({ ...d, org:e.target.value })} />{err.org && <em>{t(err.org)}</em>}</label></section>
      <section><h3>{t('Preferences (simulated)')}</h3>
        <label>{t('Currency')}<Select value={d.currency} onChange={v => setD({ ...d, currency:v })} options={['IDR','USD','EUR']} /></label>
        <label>{t('Units')}<Select value={d.units} onChange={v => setD({ ...d, units:v })} options={[{ value:'kg', label:'kg' }, { value:'tonnes', label:t('tonnes') }, { value:'lb', label:'lb' }]} /></label>
        <label className="row"><input type="checkbox" checked={d.emailAlerts} onChange={e => setD({ ...d, emailAlerts:e.target.checked })} /> {t('Email alerts (no emails are sent in this prototype)')}</label></section>
      <div className="st__act"><button onClick={save}>{t('Save')}</button><button className="alt" onClick={reset}>{t('Cancel')}</button></div>
      <section className="st__account"><h3>{t('Account')}</h3>
        <small>{t('Sign out of this device. Your data stays stored in this browser.')}</small>
        <button type="button" className="st__out" onClick={signOut}><LogOut size={16} />{t('Sign out')}</button></section>
    </div>
  )
}
