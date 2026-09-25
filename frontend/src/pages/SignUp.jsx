import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage } from '../api'
import { passwordRules, registrationData, validateRegistration } from '../utils/registration'

const initialForm = { firstName: '', lastName: '', email: '', country: 'US', phone: '', password: '' }
const inputClass = 'w-full h-11 px-3.5 bg-surface-container-lowest border rounded-lg text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all disabled:bg-surface-container-low disabled:cursor-not-allowed'
const buttonClass = 'w-full min-h-11 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-secondary transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed'

function Icon({ children, className = '' }) {
  return <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>{children}</span>
}
function FieldError({ name, errors }) {
  return errors[name] && <p id={`error-${name}`} className="mt-1 flex items-center gap-1 text-label-sm text-error"><Icon className="text-[14px]">error</Icon>{errors[name]}</p>
}

export default function Signup() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState(null)
  const [created, setCreated] = useState(null)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')
  const locked = useRef(false)
  const resendLocked = useRef(false)
  const feedback = useRef(null)
  const successHeading = useRef(null)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Create account — FastStore'
    return () => { document.title = previousTitle }
  }, [])
  useEffect(() => { if (created) successHeading.current?.focus() }, [created])
  useEffect(() => { if (failure) feedback.current?.focus() }, [failure])

  function change(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name === 'country' ? 'phone' : name]: undefined }))
    setFailure(null)
    setResendMessage('')
    setResendError('')
  }
  async function submit(event) {
    event.preventDefault()
    if (locked.current || resendLocked.current) return
    const validation = validateRegistration(form)
    setErrors(validation)
    setFailure(null)
    setResendMessage('')
    setResendError('')
    if (Object.keys(validation).length) {
      document.getElementById(Object.keys(validation)[0])?.focus()
      return
    }
    locked.current = true
    setPending(true)
    const payload = registrationData(form)
    try {
      const { data } = await api.post('/auth/register', payload)
      setCreated({ email: payload.email, emailSent: data.verificationEmailSent === true })
      setForm(current => ({ ...current, password: '' }))
      setVisible(false)
    } catch (error) {
      setFailure({ message: errorMessage(error), existing: error.response?.status === 409 })
    } finally { locked.current = false; setPending(false) }
  }
  async function resend() {
    if (resendLocked.current || locked.current) return
    resendLocked.current = true
    setResending(true)
    setResendMessage('')
    setResendError('')
    try {
      const { data } = await api.post('/verify/resend/account/verification', { email: created?.email || form.email.trim().toLowerCase() })
      // The endpoint deliberately does not disclose account existence or mail delivery.
      setResendMessage(data.message || 'If verification is needed, an email will be sent. Check your inbox and spam folder.')
    } catch (error) { setResendError(errorMessage(error)) }
    finally { resendLocked.current = false; setResending(false) }
  }
  function field(name, label, options = {}) {
    return <div className="space-y-1.5">
      <label htmlFor={name} className="block text-label-md font-label-md">{label}</label>
      <input id={name} name={name} value={form[name]} onChange={change} required aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `error-${name}` : undefined} className={`${inputClass} ${errors[name] ? 'border-error' : 'border-outline-variant'}`} {...options} />
      <FieldError name={name} errors={errors} />
    </div>
  }
  const resendFeedback = <>
    {resendMessage && <p role="status" className="rounded-lg bg-surface-container-low p-3 text-sm">{resendMessage}</p>}
    {resendError && <p role="alert" className="rounded-lg bg-error-container/40 p-3 text-sm text-error">{resendError}</p>}
  </>

  return <div className="min-h-screen flex flex-col bg-surface text-on-surface font-body-md antialiased selection:bg-primary-container selection:text-on-primary">
    <header className="w-full border-b border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-8">
        <Link to="/" className="text-headline-md font-headline-md font-extrabold tracking-tight text-primary">FastStore</Link>
        <Link to="/" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"><Icon className="text-[20px]">arrow_back</Icon>Continue browsing</Link>
      </div>
    </header>
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-space-xl sm:px-6">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-10">
          {!created ? <div className="space-y-6">
            <div className="space-y-1.5"><h1 className="font-headline-md text-headline-md font-bold tracking-tight">Create your FastStore account</h1><p className="text-body-md text-on-surface-variant">Track orders, save favorite items, and checkout seamlessly.</p></div>
            {failure && <div ref={feedback} tabIndex={-1} role="alert" className="space-y-3 rounded-xl border border-error/30 bg-error-container/40 p-4 text-on-error-container">
              <p>{failure.message}</p>
              {failure.existing && <><p className="text-sm">If your account still needs verification, request another email. You do not need to register again.</p><button type="button" disabled={resending || pending} onClick={resend} className="font-semibold underline disabled:opacity-60">{resending ? 'Requesting verification email…' : 'Resend verification email'}</button></>}
            </div>}
            {resendFeedback}
            <form onSubmit={submit} noValidate aria-busy={pending}>
              <fieldset disabled={pending || resending} className="min-w-0 space-y-5">
                <legend className="sr-only">Account details</legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {field('firstName', 'First name', { autoComplete: 'given-name', placeholder: 'Alex' })}
                  {field('lastName', 'Last name', { autoComplete: 'family-name', placeholder: 'Morgan' })}
                </div>
                {field('email', 'Email address', { type: 'email', autoComplete: 'email', placeholder: 'name@example.com', autoCapitalize: 'none', spellCheck: false })}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-label-md">Phone number</label>
                  <div className={`flex overflow-hidden rounded-lg border focus-within:ring-2 focus-within:ring-primary-container/20 ${errors.phone ? 'border-error' : 'border-outline-variant'}`}>
                    <div className="flex shrink-0 items-center border-r border-outline-variant bg-surface-container-low px-2">
                      <label htmlFor="country" className="sr-only">Country code</label>
                      <select id="country" name="country" value={form.country} onChange={change} autoComplete="country" className="max-w-28 bg-transparent py-2 text-label-md">
                        <option value="US">US +1</option><option value="GB">UK +44</option><option value="CA">CA +1</option><option value="AU">AU +61</option><option value="DE">DE +49</option><option value="OTHER">Other</option>
                      </select>
                    </div>
                    <input id="phone" name="phone" type="tel" autoComplete="tel" required value={form.phone} onChange={change} placeholder={form.country === 'OTHER' ? '+254 712 345678' : '555 000 0000'} aria-invalid={Boolean(errors.phone)} aria-describedby={`phone-help${errors.phone ? ' error-phone' : ''}`} className="h-11 min-w-0 flex-1 bg-transparent px-3.5 disabled:bg-surface-container-low" />
                  </div>
                  <p id="phone-help" className="text-caption text-outline">Use the selected country code without a leading local 0, or paste a full number beginning with +.</p>
                  <FieldError name="phone" errors={errors} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-label-md">Password</label>
                  <div className="relative">
                    <input id="password" name="password" type={visible ? 'text' : 'password'} autoComplete="new-password" required value={form.password} onChange={change} placeholder="Create a strong password" aria-invalid={Boolean(errors.password)} aria-describedby={`password-requirements${errors.password ? ' error-password' : ''}`} className={`${inputClass} pr-12 ${errors.password ? 'border-error' : 'border-outline-variant'}`} />
                    <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(value => !value)} className="absolute inset-y-0 right-0 flex items-center px-3 text-outline hover:text-on-surface"><Icon className="text-[20px]">{visible ? 'visibility_off' : 'visibility'}</Icon></button>
                  </div>
                  <FieldError name="password" errors={errors} />
                </div>
                <div id="password-requirements" className="space-y-2 rounded-xl border border-outline-variant bg-surface-container-low p-4">
                  <p className="text-caption font-semibold uppercase tracking-wide">Password requirements</p>
                  <ul className="space-y-1.5 text-label-sm">{passwordRules.map(rule => {
                    const met = rule.test(form.password)
                    return <li key={rule.label} className={`flex items-start gap-2 ${met ? 'text-green-700' : 'text-outline'}`}><Icon className="shrink-0 text-[16px]">{met ? 'check_circle' : 'circle'}</Icon><span><span className="sr-only">{met ? 'Met: ' : 'Not met: '}</span>{rule.label}</span></li>
                  })}</ul>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg border border-outline-variant p-3 text-caption text-on-surface-variant"><Icon className="shrink-0 text-[18px] text-primary">info</Icon><p>After creating your account, verify your email before signing in. Registration does not sign you in automatically.</p></div>
                <button type="submit" className={buttonClass}>{pending && <Icon className="animate-spin text-[20px]">progress_activity</Icon>}{pending ? 'Creating account…' : 'Create account'}</button>
              </fieldset>
            </form>
            <p className="text-center text-sm text-outline">Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
          </div> : <div className="space-y-6 py-4 text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border shadow-sm ${created.emailSent ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-amber-200 bg-amber-50 text-amber-600'}`}><Icon className="text-[32px]">{created.emailSent ? 'mark_email_read' : 'outgoing_mail'}</Icon></div>
            <div className="space-y-2"><h1 ref={successHeading} tabIndex={-1} className="font-headline-md text-headline-md font-bold">{created.emailSent ? 'Check your inbox' : 'Account created successfully'}</h1>
              {created.emailSent ? <p role="status" className="text-on-surface-variant">Your account is ready for verification. We sent a verification link to <strong className="break-words text-on-surface">{created.email}</strong>.</p> : <div role="status" className="rounded-xl border border-error/30 bg-error-container/40 p-4 text-left text-on-error-container">Your account was created, but we could not deliver the verification email to <strong className="break-words">{created.email}</strong>. Request another link below.</div>}
            </div>
            <div className="space-y-2 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-left text-sm"><p className="font-semibold">Next steps</p><ol className="list-decimal space-y-1 pl-5 text-on-surface-variant"><li>Open your inbox and follow the verification link. Check your spam folder too.</li><li>The link expires in 30 minutes. Request another if needed.</li><li>After verification, sign in with your email and password.</li></ol></div>
            <button type="button" disabled={resending} onClick={resend} className={buttonClass}><Icon className={resending ? 'animate-spin text-[20px]' : 'text-[20px]'}>refresh</Icon>{resending ? 'Requesting verification email…' : 'Resend verification email'}</button>
            {resendFeedback}
            <Link to="/login" className={buttonClass}>Proceed to sign in</Link>
            <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline">Continue browsing<Icon className="text-[18px]">arrow_forward</Icon></Link>
          </div>}
        </div>
        <p className="text-center text-caption text-outline">One account for your wishlist, cart, and order history.</p>
      </div>
    </main>
    <footer className="mt-auto w-full border-t border-outline-variant bg-surface-container-lowest"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-space-xl text-label-sm sm:flex-row sm:px-8"><Link to="/" className="font-headline-sm text-headline-sm font-bold text-primary">FastStore</Link><p className="text-on-surface-variant">© {new Date().getFullYear()} FastStore. All rights reserved.</p><Link to="/" className="text-primary hover:underline">Continue browsing</Link></div></footer>
  </div>
}
