import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api, errorMessage } from '../api'
import { useStore } from '../store/context'

const inputClass = 'h-11 w-full rounded-lg border bg-surface-container-lowest px-3.5 text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 disabled:opacity-60'

export default function Login() {
  const { session, login } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState(null)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [resending, setResending] = useState(false)
  const locked = useRef(false)
  const alertRef = useRef(null)

  useEffect(() => {
    const previous = document.title
    document.title = 'Sign in — FastStore'
    return () => { document.title = previous }
  }, [])
  useEffect(() => { if (failure) alertRef.current?.focus() }, [failure])

  if (session.status === 'authenticated') return <Navigate to="/" replace />

  function resetFeedback() { setFailure(null); setMessage(''); setErrors({}) }
  async function submit(event) {
    event.preventDefault()
    if (locked.current || session.status === 'checking') return
    const nextErrors = {}
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextErrors.email = 'Enter a valid email address.'
    // Login accepts existing passwords; registration's strength rules do not apply here.
    if (!password || new TextEncoder().encode(password).length > 72) nextErrors.password = 'Enter your password (maximum 72 bytes).'
    resetFeedback()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) { document.getElementById(`login-${Object.keys(nextErrors)[0]}`)?.focus(); return }
    locked.current = true
    setPending(true)
    try {
      await login({ email: normalizedEmail, password })
      setPassword('')
      navigate('/', { replace: true })
    } catch (error) {
      setFailure({ message: errorMessage(error), unverified: error.response?.status === 403 && /verify your email/i.test(error.response?.data?.message || '') })
    } finally { locked.current = false; setPending(false) }
  }
  async function resend() {
    if (locked.current) return
    locked.current = true
    setResending(true)
    setMessage('')
    try {
      const { data } = await api.post('/verify/resend/account/verification', { email: email.trim().toLowerCase() })
      setMessage(data.message || 'If verification is needed, an email will be sent.')
    } catch (error) { setMessage(errorMessage(error)) }
    finally { locked.current = false; setResending(false) }
  }
  const disabled = pending || resending || session.status === 'checking'
  return <div className="flex min-h-screen flex-col bg-surface font-body-md text-on-surface">
    <header className="border-b border-outline-variant bg-surface-container-lowest"><div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-8"><Link to="/" className="font-headline-md text-headline-md font-extrabold tracking-tight text-primary">FastStore</Link><Link to="/" className="flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>Continue browsing</Link></div></header>
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg space-y-4">
        {failure && <div ref={alertRef} tabIndex={-1} role="alert" className={`rounded-xl border p-4 ${failure.unverified ? 'border-outline-variant bg-surface-container-high/60' : 'border-error/20 bg-error-container/40'}`}>
          <div className="flex items-start gap-3"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">{failure.unverified ? 'mail_lock' : 'warning'}</span><div className="flex-1 space-y-2"><h2 className="font-semibold">{failure.unverified ? 'Verification required' : 'Unable to continue'}</h2><p className="text-sm text-on-surface-variant">{failure.message}</p>{failure.unverified && <button type="button" disabled={disabled} onClick={resend} className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm font-semibold text-primary disabled:opacity-60">{resending ? 'Requesting verification email…' : 'Resend verification email'}</button>}</div><button type="button" aria-label="Dismiss error notice" onClick={() => setFailure(null)} className="p-1">×</button></div>
        </div>}
        {message && <p role="status" className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-sm">{message}</p>}
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center"><h1 className="font-headline-md text-headline-md font-semibold tracking-tight">Sign in to FastStore</h1><p className="mt-1.5 text-body-md text-on-surface-variant">Access your orders, saved wishlist, and faster checkout.</p></div>
          <form onSubmit={submit} noValidate aria-busy={pending}>
            <fieldset disabled={disabled} className="min-w-0 space-y-4"><legend className="sr-only">Sign-in details</legend>
              <div className="space-y-1.5"><label htmlFor="login-email" className="block text-label-md font-medium">Email address</label><input id="login-email" type="email" name="email" value={email} onChange={event => { setEmail(event.target.value); resetFeedback() }} autoComplete="email" autoCapitalize="none" spellCheck={false} required placeholder="name@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} className={`${inputClass} ${errors.email ? 'border-error' : 'border-outline-variant'}`} />{errors.email && <p id="login-email-error" className="text-sm text-error">{errors.email}</p>}</div>
              <div className="space-y-1.5"><div className="flex items-center justify-between"><label htmlFor="login-password" className="text-label-md font-medium">Password</label><Link to="/password-reset" className="text-label-sm font-medium text-primary hover:underline">Forgot password?</Link></div><div className="relative"><input id="login-password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={event => { setPassword(event.target.value); resetFeedback() }} placeholder="Enter your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} className={`${inputClass} pr-12 ${errors.password ? 'border-error' : 'border-outline-variant'}`} /><button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-outline"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">{visible ? 'visibility_off' : 'visibility'}</span></button></div>{errors.password && <p id="login-password-error" className="text-sm text-error">{errors.password}</p>}</div>
              <button type="submit" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2 font-semibold text-white shadow-sm hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60">{pending && <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}{session.status === 'checking' ? 'Checking session…' : pending ? 'Signing in…' : 'Sign in'}</button>
            </fieldset>
          </form>
          <><div className="my-6 flex items-center gap-3 text-label-sm text-outline"><span className="flex-1 border-t border-outline-variant" />New to FastStore?<span className="flex-1 border-t border-outline-variant" /></div><p className="text-center text-body-md text-on-surface-variant">Don’t have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Create account</Link></p></>
        </div>
        <p className="text-center text-caption text-outline">After signing in, you’ll return to the homepage.</p>
      </div>
    </main>
    <footer className="border-t border-outline-variant bg-surface-container-lowest"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-label-sm sm:px-8"><p className="text-on-surface-variant">© {new Date().getFullYear()} FastStore. All rights reserved.</p><Link to="/" className="text-primary hover:underline">Continue browsing</Link></div></footer>
  </div>
}
