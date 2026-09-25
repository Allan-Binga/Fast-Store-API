import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { passwordRules, normalizePhone, registrationData, validateRegistration } from '../src/utils/registration.js'
const require = createRequire(import.meta.url)
const { passwordValid } = require('../../backend/utils/http.js')
const valid = { firstName: ' Alex ', lastName: ' Morgan ', email: ' Alex@Example.com ', country: 'US', phone: '(555) 123-4567', password: 'ValidPass123!' }

test('frontend password acceptance stays compatible with the backend, including unsupported symbols and the bcrypt limit', () => {
  for (const password of ['', 'Short1!', 'abcdefgh!', 'ABCDEFGH1!', 'ValidPass123!', 'ValidPass123#', 'Valid Pass123!', 'ValidPass123!é', 'A1!' + 'a'.repeat(69), 'A1!' + 'a'.repeat(70)]) {
    assert.equal(passwordRules.every(rule => rule.test(password)), passwordValid(password), `Password length ${password.length}`)
  }
})
test('registration sends backend field names, normalized identity, and an untouched password', () => {
  assert.deepEqual(registrationData(valid), { firstName: 'Alex', lastName: 'Morgan', email: 'alex@example.com', phone: '+15551234567', password: valid.password })
  assert.deepEqual(validateRegistration(valid), {})
})
test('phone normalization does not double a pasted country code and handles Canada without a synthetic -CA suffix', () => {
  assert.equal(normalizePhone('+254 712 345678', 'US'), '+254712345678')
  assert.equal(normalizePhone('(416) 555-0123', 'CA'), '+14165550123')
  assert.equal(normalizePhone('20 7946 0958', 'GB'), '+442079460958')
  assert.equal(normalizePhone('+49 (30) 12345678', 'OTHER'), '+493012345678')
  for (const phone of ['', 'abc12345678', '123', '++1234567890', '+1234567890123456']) {
    assert.ok(validateRegistration({ ...valid, phone }).phone)
  }
})
test('blank names and malformed email cannot submit', () => {
  const errors = validateRegistration({ ...valid, firstName: ' ', lastName: '', email: 'wrong' })
  assert.deepEqual(Object.keys(errors), ['firstName', 'lastName', 'email'])
})
