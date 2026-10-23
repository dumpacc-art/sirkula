import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Recycle, Route, ShieldCheck, ArrowLeft, Mail, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import LangSwitch from '../../components/ui/LangSwitch'
import type { Role } from '../../types'
import './LoginPage.css'
const roles: Role[] = ['generator','processor','transport','community','seller','buyer','admin']
const points = [
  { Icon: Recycle, t: 'Smart matching', d: 'Connect material with the right processor.' },
  { Icon: Route, t: 'End-to-end traceability', d: 'Follow every batch from source to reuse.' },
  { Icon: ShieldCheck, t: 'Reviewed evidence', d: 'Nothing is called verified without review.' },
]
export default function LoginPage() {
  const { login, notify } = useStore(); const { t } = useT(); const nav = useNavigate()
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [show, setShow] = useState(false)
  const [role, setRole] = useState<Role>('generator'); const [err, setErr] = useState<{ email?:string; pw?:string }>({})
  const enter = (name:string, em:string) => { login({ name, email:em, org:'Demo Organization', role }); notify('Signed in (prototype session)'); nav('/app/dashboard') }
  const submit = (e: FormEvent) => {
    e.preventDefault(); const x: typeof err = {}
    if (!email) x.email = 'Email is required'; else if (!/^\S+@\S+\.\S+$/.test(email)) x.email = 'Enter a valid email'
    if (!pw) x.pw = 'Password is required'; else if (pw.length < 6) x.pw = 'At least 6 characters'
    setErr(x); if (!Object.keys(x).length) enter(email.split('@')[0], email)
  }
  return (
    <div className="login">
      <aside className="login__art">
        <div className="login__orb o1" /><div className="login__orb o2" />
        <svg className="login__ring" viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="150" /><circle cx="200" cy="200" r="150" className="run" /><circle cx="200" cy="200" r="100" className="in" /></svg>
        <Link to="/" className="login__back"><ArrowLeft size={14} />{t('Back to home')}</Link>
        <div className="login__artBody">
          <h1>SIRKULA</h1>
          <p className="login__tag">{t('A circular economy network for every region')}</p>
          <ul>{points.map(({ Icon, t: k, d }, i) => <motion.li key={k} initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay:.2 + i * .12 }}><span><Icon size={18} /></span><div><b>{t(k)}</b><small>{t(d)}</small></div></motion.li>)}</ul>
          <p className="login__note">{t('Prototype environment: authentication here is a demo flow, not real identity security.')}</p>
        </div>
      </aside>
      <div className="login__side">
        <div className="login__lang"><LangSwitch /></div>
        <form className="login__form" onSubmit={submit} noValidate>
          <h2>{t('Sign in')}</h2><p className="login__sub">{t('Welcome back. Enter your details to continue.')}</p>
          <label>{t('Email')}<span className="login__field"><Mail size={16} /><input value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!err.email} placeholder="name@company.com" /></span>{err.email && <em>{t(err.email)}</em>}</label>
          <label>{t('Password')}<span className="login__field"><Lock size={16} /><input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} aria-invalid={!!err.pw} placeholder="••••••••" />
            <button type="button" onClick={() => setShow(s => !s)} aria-label={t('Toggle password')}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></span>{err.pw && <em>{t(err.pw)}</em>}</label>
          <button className="login__primary" type="submit">{t('Sign in')}</button>
          <div className="login__or"><span>{t('or try the demo')}</span></div>
          <div className="login__demo"><label>{t('Demo access as')}<Select value={role} onChange={v => setRole(v as Role)} options={roles.map(r => ({ value:r, label:t(r) }))} /></label>
            <button type="button" onClick={() => enter('Demo User', 'demo@sirkula.example')}>{t('Enter demo')}</button></div>
          <p className="login__reg">{t('No account?')} <Link to="/register">{t('Register')}</Link></p>
        </form>
      </div>
    </div>
  )
}
