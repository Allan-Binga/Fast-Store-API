import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, errorMessage } from '../api'

function Verification({ token }) {
  const validToken = /^[a-f\d]{64}$/i.test(token)
  const request = useRef(null)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendResult, setResendResult] = useState(null)
  const resendLocked = useRef(false)
  const heading = useRef(null)
  const status = !token ? 'missing' : !validToken ? 'invalid' : result?.attempt === attempt ? result.status : 'checking'

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Verify your email — FastStore'
    return () => { document.title = previousTitle }
  }, [])

  useEffect(() => {
    if (!validToken) return
    let active = true
    // StrictMode replays effects. Reuse this promise: the endpoint consumes the token.
    // Do not abort and reissue a request that may already have verified the account.
    if (!request.current) request.current = api.get('/verify', { params: { token } })
    request.current.then(() => {
      if (active) setResult({ attempt, status: 'success' })
    }).catch(error => {
      if (active) setResult({ attempt, status: error.response?.status === 400 ? 'invalid' : 'error', message: errorMessage(error) })
    })
    return () => { active = false }
  }, [token, validToken, attempt])

  useEffect(() => { if (status !== 'checking') heading.current?.focus() }, [status])

  function retry() {
    request.current = null
    setAttempt(value => value + 1)
  }
  async function resend(event) {
    event.preventDefault()
    if (resendLocked.current) return
    const normalizedEmail = email.trim().toLowerCase()
    setResendResult(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.')
      document.getElementById('verification-email')?.focus()
      return
    }
    setEmailError('')
    resendLocked.current = true
    setResending(true)
    try {
      const { data } = await api.post('/verify/resend/account/verification', { email: normalizedEmail })
      setResendResult({ success: true, message: data.message || 'If verification is needed, an email will be sent.' })
    } catch (error) { setResendResult({ success: false, message: errorMessage(error) }) }
    finally { resendLocked.current = false; setResending(false) }
  }

  const titles = { checking: 'Verifying your email…', success: 'Email verified', missing: 'Verification link missing', invalid: 'This link is no longer valid', error: 'We could not confirm verification' }
  return <div className="flex min-h-screen flex-col bg-surface font-body-md text-on-surface">
    <header className="border-b border-outline-variant bg-surface-container-lowest"><div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-8"><Link to="/" className="font-headline-md text-headline-md font-extrabold text-primary">FastStore</Link><Link to="/" className="text-sm text-primary hover:underline">Continue browsing</Link></div></header>
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section aria-labelledby="verification-title" aria-busy={status === 'checking'} className="w-full max-w-lg space-y-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-10">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-container-low text-primary'}`}><span aria-hidden="true" className={`material-symbols-outlined text-[32px] ${status === 'checking' ? 'animate-spin' : ''}`}>{status === 'checking' ? 'progress_activity' : status === 'success' ? 'mark_email_read' : 'mail_lock'}</span></div>
        <h1 id="verification-title" ref={heading} tabIndex={-1} className="text-center font-headline-md text-headline-md font-semibold">{titles[status]}</h1>
        <div role="status" className="space-y-3 text-center text-on-surface-variant">
          {status === 'checking' && <p>Please wait while we confirm your email address.</p>}
          {status === 'success' && <p>Your account is verified. Sign in with your email and password to start shopping.</p>}
          {status === 'missing' && <p>Open the full verification link from your email, or request a new link below.</p>}
          {status === 'invalid' && <p>Your link may have expired, already been used, or been replaced by a newer email. If you already verified your account, you can sign in.</p>}
          {status === 'error' && <><p>{result?.message}</p><p className="text-sm">Verification may have completed even if the response was interrupted. Try signing in, retry this request, or request a new link.</p></>}
        </div>
        {status === 'error' && <button onClick={retry} className="w-full rounded-lg border border-outline-variant px-4 py-3 text-primary hover:bg-surface-container-low">Try verification again</button>}
        {status !== 'checking' && <Link to="/login" className="block rounded-lg bg-primary-container px-4 py-3 text-center font-semibold text-white hover:bg-secondary">Sign in</Link>}
        {!['checking', 'success'].includes(status) && <form onSubmit={resend} noValidate aria-busy={resending} className="space-y-3 border-t border-outline-variant pt-6">
          <h2 className="font-headline-sm text-headline-sm font-semibold">Request a new verification email</h2>
          <label htmlFor="verification-email" className="block text-sm">Email address</label>
          <input id="verification-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required disabled={resending} value={email} onChange={event => { setEmail(event.target.value); setEmailError(''); setResendResult(null) }} placeholder="name@example.com" aria-invalid={Boolean(emailError)} aria-describedby={emailError ? 'verification-email-error' : undefined} className={`h-11 w-full rounded-lg border bg-white px-3.5 disabled:opacity-60 ${emailError ? 'border-error' : 'border-outline-variant'}`} />
          {emailError && <p id="verification-email-error" className="text-sm text-error">{emailError}</p>}
          <button type="submit" disabled={resending} className="w-full rounded-lg border border-primary px-4 py-3 font-semibold text-primary hover:bg-surface-container-low disabled:opacity-60">{resending ? 'Requesting email…' : 'Resend verification email'}</button>
          {resendResult && <p role={resendResult.success ? 'status' : 'alert'} className={`rounded-lg p-3 text-sm ${resendResult.success ? 'bg-surface-container-low' : 'bg-error-container/40 text-error'}`}>{resendResult.message}</p>}
          <p className="text-caption text-outline">Check your inbox and spam folder. Use the newest link; verification links expire after 30 minutes.</p>
        </form>}
      </section>
    </main>
    <footer className="border-t border-outline-variant bg-white px-4 py-6 text-center text-sm text-outline">© {new Date().getFullYear()} FastStore. All rights reserved.</footer>
  </div>
}

export default function AccountVerification() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  // A different email link gets its own request and state, even during client navigation.
  return <Verification key={token} token={token} />
}
