import { useEffect, useState } from 'react'
import { api, errorMessage } from '../api'

// Keying state by URL prevents stale results appearing under a new search title.
export default function useResource(url) {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    api.get(url, { signal: controller.signal }).then(({ data }) => {
      setResult({ url, attempt, data, error: '' })
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ url, attempt, data: null, status: error.response?.status, error: errorMessage(error) })
    })
    return () => controller.abort()
  }, [url, attempt])
  const current = result?.url === url && result?.attempt === attempt ? result : null
  return { data: current?.data, status: current?.status, error: current?.error, loading: Boolean(url) && !current, retry: () => setAttempt(value => value + 1) }
}
