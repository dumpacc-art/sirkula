import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthField from '../../components/auth/AuthField'
import { validateEmail } from '../../utils/validation'
import { signIn, demoUser } from '../../lib/accounts'

type Errors = { email?: string; pw?: string; form?: 'no_account' | 'wrong_password' }

export default function LoginPage() {
  const { login, notify } = useStore(); const { t } = useT(); const nav = useNavigate()
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState<Errors>({}); const [busy, setBusy] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const x: Errors = {}
    const em = validateEmail(email); if (em) x.email = em
    if (!pw) x.pw = 'Password is required'
    setErr(x); if (Object.keys(x).length) return
    setBusy(true)
    const r = signIn(email, pw)
    if (!r.ok) { setBusy(false); setErr(r.error === 'wrong_password' ? { pw: 'Incorrect password', form: r.error } : { form: r.error }); return }
    login(r.user); notify('Signed in (prototype session)'); nav('/app/dashboard')
  }
  const demo = () => { login(demoUser()); notify('Signed in (prototype session)'); nav('/app/dashboard') }

  return (
    <AuthLayout mode="login" title={t('Welcome back')} subtitle={t('Sign in to continue your pickups and tracking.')}
      footer={<>{t('New to SIRKULA?')} <Link to="/signup">{t('Create an account')}</Link></>}>
      <form className="auth__form" onSubmit={submit} noValidate>
        {err.form === 'no_account' && <div className="auth__banner" role="alert"><AlertCircle size={18} /><span>{t('No account found with this email.')} <Link to="/signup">{t('Create an account')}</Link></span></div>}
        <AuthField label={t('Email')} icon={<Mail size={18} />} type="email" autoComplete="email" inputMode="email" placeholder="name@email.com"
          value={email} onChange={e => { setEmail(e.target.value); setErr({}) }} error={err.email ? t(err.email) : undefined} />
        <AuthField label={t('Password')} icon={<Lock size={18} />} autoComplete="current-password" type="password" placeholder={t('Enter your password')}
          toggleLabels={{ show: t('Show password'), hide: t('Hide password') }}
          value={pw} onChange={e => { setPw(e.target.value); setErr(p => ({ ...p, pw: undefined, form: undefined })) }} error={err.pw ? t(err.pw) : undefined} />
        <button className="auth__submit" type="submit" disabled={busy}>{t('Sign in')}<ArrowRight size={18} /></button>
        <div className="auth__or"><span>{t('or')}</span></div>
        <button className="auth__demo" type="button" onClick={demo}><Sparkles size={16} />{t('Try the demo, no account needed')}</button>
      </form>
    </AuthLayout>
  )
}
