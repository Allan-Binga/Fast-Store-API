import axios from 'axios'

// Accept either a server origin or an API base ending in /api.
export const endpoint = (import.meta.env.VITE_BACKEND_ENDPOINT || '').replace(/\/+$/, '').replace(/\/api$/, '')
export const api = axios.create({ baseURL: `${endpoint}/api`, timeout: 15000 })
const sessionApi = axios.create({ baseURL: `${endpoint}/api`, withCredentials: true, timeout: 15000 })
let refreshing

// Only protected requests attempt refresh; public browsing never requires cookies.
export async function customerRequest(config) {
  try {
    return await sessionApi.request(config)
  } catch (error) {
    if (error.response?.status !== 401) throw error
    if (!refreshing) {
      refreshing = sessionApi.post('/auth/refresh').finally(() => { refreshing = null })
    }
    await refreshing
    return sessionApi.request(config)
  }
}

export function errorMessage(error) {
  return error.response?.data?.message || (error.code === 'ECONNABORTED'
    ? 'The server took too long to respond. Please try again.'
    : 'Unable to reach the store. Please try again.')
}
