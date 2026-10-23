import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import LangSwitch from '../../components/ui/LangSwitch'
import type { Role } from '../../types'
import './RegisterPage.css'
const types: { v: string; role: Role; d: string }[] = [
  { v:'Waste generator', role:'generator', d:'Registers material batches and requests matches.' }, { v:'Processor or recycler', role:'processor', d:'Lists accepted materials and capacity.' },
  { v:'Transport provider', role:'transport', d:'Handles scheduled collections.' }, { v:'Community', role:'community', d:'Coordinates shared initiatives and agreements.' },
  { v:'Product seller', role:'seller', d:'Lists circular products for sale.' }, { v:'Buyer', role:'buyer', d:'Orders circular products.' }, { v:'Other organization', role:'buyer', d:'Starts with buyer access in this prototype.' },
]
export default function RegisterPage() {
  const { login, notify } = useStore(); const { t } = useT(); const nav = useNavigate(); const [ty, setTy] = useState(0), [err, setErr] = useState<Record<string, string>>({})
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget), x: Record<string, string> = {}, g = (k: string) => String(f.get(k)).trim()
    if (!g('name')) x.name = 'Name is required'; if (!/^\S+@\S+\.\S+$/.test(g('email'))) x.email = 'Enter a valid email'; if (!g('org')) x.org = 'Organization is required'
    if (g('pw').length < 6) x.pw = 'At least 6 characters'; if (g('pw') !== g('pw2')) x.pw2 = 'Passwords do not match'
    setErr(x); if (Object.keys(x).length) return
    login({ name:g('name'), email:g('email'), org:g('org'), role:types[ty].role }); notify('Prototype account created. No verification email was sent.'); nav('/app/dashboard')
  }
  const labels = { name:'Full name', email:'Email', org:'Organization' }
  return (
    <div className="rg">
      <div className="rg__top"><Link to="/" className="rg__back"><ArrowLeft size={14} />{t('Back to home')}</Link><LangSwitch /></div>
      <form onSubmit={submit} noValidate><span className="rg__logo">SIRKULA</span><h1>{t('Create a prototype account')}</h1><p className="rg__m">{t('Data stays in this browser. This is not real identity management.')}</p>
        {(['name','email','org'] as const).map(k => <label key={k}>{t(labels[k])}<input name={k} />{err[k] && <em>{t(err[k])}</em>}</label>)}
        <label>{t('Participant type')}<Select value={String(ty)} onChange={v => setTy(+v)} options={types.map((x, i) => ({ value:String(i), label:t(x.v) }))} /><small>{t(types[ty].d)}</small></label>
        <label>{t('Password')}<input name="pw" type="password" />{err.pw && <em>{t(err.pw)}</em>}</label><label>{t('Confirm password')}<input name="pw2" type="password" />{err.pw2 && <em>{t(err.pw2)}</em>}</label>
        <button type="submit">{t('Create account')}</button><p className="rg__m c">{t('Already registered?')} <Link to="/login">{t('Sign in')}</Link></p></form>
    </div>
  )
}
