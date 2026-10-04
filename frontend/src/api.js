import axios from 'axios'

// Accept either a server origin or an API base ending in /api.
export const endpoint = (import.meta.env.VITE_BACKEND_ENDPOINT || '').replace(/\/+$/, '').replace(/\/api$/, '')
export const api = axios.create({ baseURL: `${endpoint}/api`, timeout: 15000 })
const sessionApi = axios.create({ baseURL: `${endpoint}/api`, withCredentials: true, timeout: 15000 })
let refreshing

async function sessionRequest(config) {
  const response = await sessionApi.request(config)
  if (String(config.method || 'get').toLowerCase() !== 'get' && (/^\/wallet\//.test(config.url || '') || config.url === '/checkout/wallet')) {
    window.dispatchEvent(new Event('wallet-updated'))
  }
  return response
}

// Only protected requests attempt refresh; public browsing never requires cookies.
export async function customerRequest(config) {
  try {
    return await sessionRequest(config)
  } catch (error) {
    if (error.response?.status !== 401) throw error
    if (!refreshing) {
      refreshing = sessionApi.post('/auth/refresh').finally(() => { refreshing = null })
    }
    await refreshing
    return sessionRequest(config)
  }
}

export function errorMessage(error) {
  return error.response?.data?.message || (error.code === 'ECONNABORTED'
    ? 'The server took too long to respond. Please try again.'
    : 'Unable to reach the store. Please try again.')
}
