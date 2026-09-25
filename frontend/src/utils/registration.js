export const passwordRules = [
  { label: 'At least 8 characters', test: value => value.length >= 8 },
  { label: 'At least one uppercase letter (A–Z)', test: value => /[A-Z]/.test(value) },
  { label: 'At least one lowercase letter (a–z)', test: value => /[a-z]/.test(value) },
  { label: 'At least one number (0–9)', test: value => /\d/.test(value) },
  { label: 'At least one special symbol: @$!%*?&', test: value => /[@$!%*?&]/.test(value) },
  { label: 'Only letters, numbers, and @$!%*?&; maximum 72 characters', test: value => value.length <= 72 && /^[A-Za-z\d@$!%*?&]+$/.test(value) },
]

export const callingCodes = { US: '+1', GB: '+44', CA: '+1', AU: '+61', DE: '+49', OTHER: '' }
export function normalizePhone(phone, country) {
  const compact = phone.trim().replace(/[\s().-]/g, '')
  if (!compact) return ''
  return compact.startsWith('+') ? compact : `${callingCodes[country] ?? ''}${compact}`
}
export function registrationData(form) {
  return { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim().toLowerCase(), phone: normalizePhone(form.phone, form.country), password: form.password }
}
export function validateRegistration(form) {
  const data = registrationData(form)
  const errors = {}
  if (!data.firstName) errors.firstName = 'Please enter your first name.'
  if (!data.lastName) errors.lastName = 'Please enter your last name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email address.'
  if (!/^\+[1-9]\d{7,14}$/.test(data.phone)) errors.phone = 'Enter a valid international phone number, including its country code.'
  if (!passwordRules.every(rule => rule.test(data.password))) errors.password = 'Your password must meet all the requirements below.'
  return errors
}
