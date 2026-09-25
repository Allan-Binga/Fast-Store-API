import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, errorMessage } from '../api'
import { passwordRules } from '../utils/registration'
import { useStore } from '../store/context'
import PasswordLayout from '../components/PasswordLayout'

function ChangeForm({ token }) {
  const { invalidateSession } = useStore()
  const valid = /^[a-f\d]{64}$/i.test(token)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' })
  const [visible, setVisible] = useState({})
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [pending, setPending] = useState(false)
  const locked = useRef(false)
  const heading = useRef(null)
  const status = !valid ? 'invalid' : result?.attempt === attempt ? result.status : 'checking'

  useEffect(() => {
    if (!valid) return
    const controller = new AbortController()
    api.get('/verify/password/token', { params: { token }, signal: controller.signal }).then(() => {
      if (!controller.signal.aborted) setResult({ attempt, status: 'ready' })
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ attempt, status: error.response?.status === 400 ? 'invalid' : 'error', message: errorMessage(error) })
    })
    return () => controller.abort()
  }, [token, valid, attempt])
  useEffect(() => { if (status !== 'checking') heading.current?.focus() }, [status])

  async function submit(event) {
    event.preventDefault()
    if (locked.current || status !== 'ready') return
    const next = {}
    if (!passwordRules.every(rule => rule.test(passwords.newPassword))) next.newPassword = 'Meet all the password requirements below.'
    if (passwords.newPassword !== passwords.confirmPassword || !passwords.confirmPassword) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    setFailure('')
    if (Object.keys(next).length) { document.getElementById(Object.keys(next)[0])?.focus(); return }
    locked.current = true
    setPending(true)
    try {
      // Accept the clearing of HttpOnly session cookies performed by the reset endpoint.
      await api.put('/password/reset/password/token', { token, ...passwords }, { withCredentials: true })
      invalidateSession()
      setPasswords({ newPassword: '', confirmPassword: '' })
      setResult({ attempt, status: 'success' })
    } catch (error) {
      if (error.response?.status === 400 && /token/i.test(error.response?.data?.message || '')) setResult({ attempt, status: 'invalid' })
      else setFailure(`${errorMessage(error)}${!error.response ? ' If the response was interrupted after saving, try signing in with your new password.' : ''}`)
    } finally { locked.current = false; setPending(false) }
  }
  const titles = { checking: 'Checking your reset link…', invalid: 'Password reset link has expired or is invalid', error: 'Unable to check your reset link', ready: 'Create new password', success: 'Password updated. Please sign in again.' }
  return <PasswordLayout title="Create new password">
    {status !== 'ready' && <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-primary"><span aria-hidden="true" className={`material-symbols-outlined text-[28px] ${status === 'checking' ? 'animate-spin' : ''}`}>{status === 'checking' ? 'progress_activity' : status === 'success' ? 'check_circle' : 'link_off'}</span></div>}
    <h1 ref={heading} tabIndex={-1} className="font-headline-md text-headline-md font-semibold">{titles[status]}</h1>
    {status === 'checking' && <p role="status" className="text-on-surface-variant">Please wait while we check your link.</p>}
    {status === 'invalid' && <><p className="text-on-surface-variant">Your link may be missing, expired, replaced, or already used. Request another link to reset your password.</p><Link to="/password-reset" className="block rounded-lg bg-primary-container px-5 py-3 text-center text-white">Request another link</Link></>}
    {status === 'error' && <><p role="alert" className="text-error">{result.message}</p><button onClick={() => setAttempt(value => value + 1)} className="w-full rounded-lg border border-outline-variant px-4 py-3 text-primary">Retry connection</button></>}
    {status === 'success' && <p role="status" className="text-on-surface-variant">Your password has been reset and your previous session has ended. Sign in with your new password.</p>}
    {status === 'ready' && <>
      <p className="text-body-md text-on-surface-variant">Choose a strong password for your FastStore account.</p>
      {failure && <p role="alert" className="rounded-lg bg-error-container/30 p-3 text-sm text-error">{failure}</p>}
      <form onSubmit={submit} noValidate aria-busy={pending}><fieldset disabled={pending} className="min-w-0 space-y-5"><legend className="sr-only">New password</legend>
        {['newPassword', 'confirmPassword'].map((name, index) => <div key={name} className="space-y-1.5">
          <label htmlFor={name} className="block text-label-md">{index ? 'Confirm new password' : 'New password'}</label>
          <div className="relative"><input id={name} name={name} type={visible[name] ? 'text' : 'password'} autoComplete="new-password" required value={passwords[name]} onChange={event => { setPasswords(current => ({ ...current, [name]: event.target.value })); setErrors(current => ({ ...current, [name]: undefined })); setFailure('') }} aria-invalid={Boolean(errors[name])} aria-describedby={`${name === 'newPassword' ? 'reset-password-rules ' : ''}${errors[name] ? `${name}-error` : ''}`.trim() || undefined} className={`h-11 w-full rounded-lg border bg-white pl-3.5 pr-12 disabled:opacity-60 ${errors[name] ? 'border-error' : 'border-outline-variant'}`} /><button type="button" aria-label={`${visible[name] ? 'Hide' : 'Show'} ${index ? 'confirmation password' : 'new password'}`} aria-pressed={Boolean(visible[name])} onClick={() => setVisible(current => ({ ...current, [name]: !current[name] }))} className="absolute inset-y-0 right-0 px-3 text-outline"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">{visible[name] ? 'visibility_off' : 'visibility'}</span></button></div>
          {errors[name] && <p id={`${name}-error`} className="text-sm text-error">{errors[name]}</p>}
          {!index && <ul id="reset-password-rules" className="mt-3 space-y-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-low p-3.5 text-label-sm">{passwordRules.map(rule => { const met = rule.test(passwords.newPassword); return <li key={rule.label} className={`flex items-start gap-2 ${met ? 'text-green-700' : 'text-on-surface-variant'}`}><span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[16px]">{met ? 'check_circle' : 'radio_button_unchecked'}</span><span><span className="sr-only">{met ? 'Met: ' : 'Not met: '}</span>{rule.label}</span></li> })}</ul>}
        </div>)}
        <button type="submit" className="min-h-11 w-full rounded-lg bg-primary-container px-5 py-3 font-semibold text-white hover:bg-secondary disabled:opacity-60">{pending ? 'Saving password…' : 'Save new password'}</button>
      </fieldset></form>
    </>}
    {status !== 'checking' && <Link to="/login" className={`block text-center ${status === 'success' ? 'rounded-lg bg-primary-container px-5 py-3 text-white' : 'text-primary hover:underline'}`}>{status === 'success' ? 'Sign in to FastStore' : 'Back to sign in'}</Link>}
  </PasswordLayout>
}

export default function PasswordChange() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  return <ChangeForm key={token} token={token} />
}
