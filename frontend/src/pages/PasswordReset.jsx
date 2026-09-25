import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage } from '../api'
import PasswordLayout from '../components/PasswordLayout'

export default function PasswordReset() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [message, setMessage] = useState('')
  const [remaining, setRemaining] = useState(0)
  const locked = useRef(false)
  const heading = useRef(null)
  useEffect(() => { if (sent) heading.current?.focus() }, [sent])
  useEffect(() => {
    if (!remaining) return
    const timer = setTimeout(() => setRemaining(value => Math.max(0, value - 1)), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  async function send(event) {
    event?.preventDefault()
    if (locked.current || remaining) return
    const normalized = email.trim().toLowerCase()
    setError('')
    setFieldError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setFieldError('Enter a valid email address.')
      document.getElementById('reset-email')?.focus()
      return
    }
    locked.current = true
    setPending(true)
    try {
      const { data } = await api.post('/password/send/email', { email: normalized })
      setMessage(data.message || 'If an account exists, a password reset email will be sent.')
      setSent(true)
      setRemaining(60)
    } catch (failure) {
      setError(errorMessage(failure))
      if (failure.response?.status === 429) {
        const delay = Number(failure.response.headers?.['retry-after'])
        setRemaining(Number.isFinite(delay) && delay > 0 ? Math.ceil(delay) : 60)
      }
    } finally { locked.current = false; setPending(false) }
  }
  return <PasswordLayout title="Reset your password">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary"><span aria-hidden="true" className="material-symbols-outlined">{sent ? 'mark_email_read' : 'key'}</span></div>
    <h1 ref={heading} tabIndex={-1} className="font-headline-md text-headline-md">{sent ? 'Check your email' : 'Reset your password'}</h1>
    {error && <p role="alert" className="rounded-lg border border-error/20 bg-error-container/30 p-3 text-sm text-error">{error}</p>}
    {sent ? <>
      <p role="status" className="rounded-lg border border-outline-variant/60 bg-surface-container-low p-3.5 text-on-surface-variant">{message}</p>
      <p className="text-sm text-on-surface-variant">Check your inbox and spam folder. Only the newest reset link will work.</p>
      <Link to="/login" className="block rounded-lg bg-primary-container px-5 py-3 text-center font-semibold text-white hover:bg-secondary">Return to sign in</Link>
      <button type="button" onClick={send} disabled={pending || remaining > 0} className="w-full text-center font-semibold text-primary hover:underline disabled:opacity-50">{pending ? 'Requesting link…' : 'Resend link'}</button>
      <button type="button" disabled={pending} onClick={() => { setSent(false); setError(''); setMessage('') }} className="w-full text-center text-sm text-primary hover:underline">Use a different email</button>
    </> : <>
      <p className="text-body-md text-on-surface-variant">Enter the email address associated with your FastStore account to request a password reset link.</p>
      <form onSubmit={send} noValidate aria-busy={pending} className="space-y-5">
        <div><label htmlFor="reset-email" className="mb-1.5 block text-label-md font-medium">Email address</label><div className="relative"><span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-3 text-[20px] text-outline">mail</span><input id="reset-email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required disabled={pending} value={email} onChange={event => { setEmail(event.target.value); setFieldError(''); setError('') }} placeholder="name@example.com" aria-invalid={Boolean(fieldError)} aria-describedby={fieldError ? 'reset-email-error' : undefined} className={`h-11 w-full rounded-lg border bg-white pl-10 pr-4 disabled:opacity-60 ${fieldError ? 'border-error' : 'border-outline-variant'}`} /></div>{fieldError && <p id="reset-email-error" className="mt-1 text-sm text-error">{fieldError}</p>}</div>
        <button type="submit" disabled={pending || remaining > 0} className="min-h-11 w-full rounded-lg bg-primary-container px-5 py-2 font-semibold text-white hover:bg-secondary disabled:opacity-60">{pending ? 'Requesting reset link…' : 'Send reset link'}</button>
      </form>
      <div className="space-y-3 border-t border-outline-variant/60 pt-5 text-center text-sm"><p>Remember your password? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p><p>Don’t have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Create account</Link></p></div>
    </>}
    {remaining > 0 && <p className="text-center text-caption text-outline">You can request another link in {remaining}s.</p>}
  </PasswordLayout>
}
