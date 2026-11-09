import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, ShieldCheck, ArrowRight } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthField from '../../components/auth/AuthField'
import { validateRequired, validateEmail, validatePassword, validateIndonesianPhone } from '../../utils/validation'
import { signUp } from '../../lib/accounts'

type Form = { fullName: string; email: string; phone: string; pw: string; pw2: string }
type Errors = Partial<Record<keyof Form | 'agree', string>>
const EMPTY: Form = { fullName: '', email: '', phone: '', pw: '', pw2: '' }

/** 0 to 4. Length, mixed case, digit, symbol. */
const strength = (p: string) => (p ? Math.min(4, (p.length >= 8 ? 1 : 0) + (/[a-z]/.test(p) && /[A-Z]/.test(p) ? 1 : 0) + (/\d/.test(p) ? 1 : 0) + (/[^\w\s]/.test(p) ? 1 : 0) || 1) : 0)
const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']

export default function SignUpPage() {
  const { login, notify } = useStore(); const { t } = useT(); const nav = useNavigate()
  const [f, setF] = useState<Form>(EMPTY); const [err, setErr] = useState<Errors>({}); const [agree, setAgree] = useState(false)
  const s = useMemo(() => strength(f.pw), [f.pw])
  const set = (k: keyof Form) => (ev: ChangeEvent<HTMLInputElement>) => { setF(p => ({ ...p, [k]: ev.target.value })); setErr(p => ({ ...p, [k]: undefined })) }
  const e = (k: keyof Errors) => (err[k] ? t(err[k]!) : undefined)

  const submit = (ev: FormEvent) => {
    ev.preventDefault(); const x: Errors = {}
    const n = validateRequired(f.fullName, 'Full name is required'); if (n) x.fullName = n
    const em = validateEmail(f.email); if (em) x.email = em
    const ph = validateIndonesianPhone(f.phone); if (ph) x.phone = ph
    const pw = validatePassword(f.pw); if (pw) x.pw = pw
    if (!f.pw2) x.pw2 = 'Confirm your password'; else if (f.pw !== f.pw2) x.pw2 = 'Passwords do not match'
    if (!agree) x.agree = 'Please accept the prototype notice to continue'
    setErr(x); if (Object.keys(x).length) return
    const r = signUp({ fullName: f.fullName, email: f.email, phone: f.phone, pw: f.pw })
    if (!r.ok) { setErr({ email: 'An account with this email already exists' }); return }
    login(r.user); notify('Account created. Welcome to SIRKULA!'); nav('/app/pickup')
  }

  return (
    <AuthLayout mode="signup" title={t('Create your account')} subtitle={t('It takes less than a minute. No role to pick.')}
      footer={<>{t('Already have an account?')} <Link to="/login">{t('Sign in')}</Link></>}>
      <form className="auth__form" onSubmit={submit} noValidate>
        <AuthField label={t('Full name')} icon={<User size={18} />} autoComplete="name" placeholder={t('Your full name')} value={f.fullName} onChange={set('fullName')} error={e('fullName')} />
        <AuthField label={t('Email')} icon={<Mail size={18} />} type="email" autoComplete="email" inputMode="email" placeholder="name@email.com" value={f.email} onChange={set('email')} error={e('email')} />
        <AuthField label={t('Phone number')} icon={<Phone size={18} />} type="tel" autoComplete="tel" inputMode="tel" placeholder="0812 3456 7890" value={f.phone} onChange={set('phone')} error={e('phone')} hint={t('Used by the collector to reach you.')} />
        <div>
          <AuthField label={t('Password')} icon={<Lock size={18} />} type="password" autoComplete="new-password" placeholder={t('At least 6 characters')} toggleLabels={{ show: t('Show password'), hide: t('Hide password') }} value={f.pw} onChange={set('pw')} error={e('pw')} />
          {f.pw && <div className="pws" data-s={s} aria-live="polite" style={{ marginTop: 10 }}><div className="pws__bars"><i /><i /><i /><i /></div><small>{t('Password strength')}: {t(LABELS[s])}</small></div>}
        </div>
        <AuthField label={t('Confirm password')} icon={<ShieldCheck size={18} />} type="password" autoComplete="new-password" placeholder={t('Repeat your password')} toggleLabels={{ show: t('Show password'), hide: t('Hide password') }} value={f.pw2} onChange={set('pw2')} error={e('pw2')} />
        <div>
          <label className="auth__check"><input type="checkbox" checked={agree} onChange={ev => { setAgree(ev.target.checked); setErr(p => ({ ...p, agree: undefined })) }} /><span>{t('I understand this is a prototype. Data stays in this browser.')}</span></label>
          {err.agree && <small className="af__err" role="alert">{t(err.agree)}</small>}
        </div>
        <button className="auth__submit" type="submit">{t('Create account')}<ArrowRight size={18} /></button>
      </form>
    </AuthLayout>
  )
}
