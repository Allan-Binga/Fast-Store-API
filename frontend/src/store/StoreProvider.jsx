import { useCallback, useEffect, useRef, useState } from 'react'
import { api, customerRequest, errorMessage } from '../api'
import useResource from '../hooks/useResource'
import { StoreContext } from './context'

export default function StoreProvider({ children }) {
  const categories = useResource('/categories/all')
  const [session, setSession] = useState({ status: 'checking', user: null })
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const locked = useRef(false)
  const sessionVersion = useRef(0)
  const [notice, setNotice] = useState('')
  const [panel, setPanel] = useState(null)

  const refreshShopping = useCallback(async () => {
    const version = sessionVersion.current
    setLoading(true)
    const results = await Promise.allSettled([
      customerRequest({ url: '/cart/user' }), customerRequest({ url: '/wishlist/user' }),
    ])
    if (version !== sessionVersion.current) return
    const nextErrors = {}
    results.forEach((result, index) => {
      const key = index === 0 ? 'cart' : 'wishlist'
      const setter = index === 0 ? setCart : setWishlist
      if (result.status === 'fulfilled') setter(result.value.data.products || [])
      else { setter([]); nextErrors[key] = errorMessage(result.reason) }
    })
    setErrors(nextErrors)
    if (results.some(result => result.status === 'rejected' && [401, 403].includes(result.reason.response?.status))) {
      setSession({ status: 'guest', user: null })
      setCart([])
      setWishlist([])
    }
    setLoading(false)
  }, [])

  const checkSession = useCallback(async () => {
    const version = sessionVersion.current
    try {
      const { data } = await customerRequest({ url: '/auth/check-session' })
      if (version !== sessionVersion.current) return
      setSession({ status: 'authenticated', user: data.user })
      await refreshShopping()
    } catch (error) {
      if (version !== sessionVersion.current) return
      setCart([])
      setWishlist([])
      setSession({ status: [401, 403].includes(error.response?.status) ? 'guest' : 'error', user: null })
    }
  }, [refreshShopping])

  useEffect(() => {
    let active = true
    const version = sessionVersion.current
    customerRequest({ url: '/auth/check-session' }).then(({ data }) => {
      if (!active || version !== sessionVersion.current) return
      setSession({ status: 'authenticated', user: data.user })
      void refreshShopping()
    }).catch(error => {
      if (active && version === sessionVersion.current) setSession({ status: [401, 403].includes(error.response?.status) ? 'guest' : 'error', user: null })
    })
    return () => { active = false }
  }, [refreshShopping])

  async function mutate(config, message, after) {
    if (session.status !== 'authenticated') { setPanel('account'); return }
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setNotice('')
    try {
      await customerRequest(config)
      await refreshShopping()
      setNotice(message)
      if (after) setPanel(after)
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        setSession({ status: 'guest', user: null })
        setCart([])
        setWishlist([])
        setPanel('account')
      }
      setNotice(errorMessage(error))
    } finally { locked.current = false; setBusy(false) }
  }

  const addToCart = (product, quantity = 1) => mutate(product.endTime
    ? { method: 'post', url: '/flashsale/add-to-cart', data: { productId: product._id, quantity } }
    : { method: 'post', url: '/cart/add', data: { products: [{ productId: product._id, quantity }] } }, 'Added to your cart.')
  const toggleWishlist = product => {
    const saved = wishlist.some(item => item._id === product._id)
    return mutate({ method: saved ? 'delete' : 'post', url: saved ? '/wishlist' : '/wishlist/add-to-wishlist', data: { productId: product._id } }, saved ? 'Removed from your wishlist.' : 'Saved to your wishlist.')
  }
  function invalidateSession() {
    sessionVersion.current += 1
    setSession({ status: 'guest', user: null })
    setCart([])
    setWishlist([])
    setErrors({})
    setLoading(false)
    setPanel(null)
    setNotice('')
  }

  async function login(credentials) {
    // Login must send/accept HttpOnly cookies without treating bad credentials as token expiry.
    const { data } = await api.post('/auth/login', credentials, { withCredentials: true })
    setSession({ status: 'authenticated', user: data.user })
    setPanel(null)
    setNotice('')
    setCart([])
    setWishlist([])
    void refreshShopping()
  }

  async function logout() {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    try {
      await api.post('/auth/logout', {}, { withCredentials: true })
      invalidateSession()
      setNotice('You have signed out.')
    } catch (error) { setNotice(errorMessage(error)) }
    finally { locked.current = false; setBusy(false) }
  }

  return <StoreContext.Provider value={{ categories, session, cart, wishlist, errors, loading, busy, notice, setNotice, panel, setPanel, checkSession, refreshShopping, addToCart, toggleWishlist, mutate, login, logout, invalidateSession }}>{children}</StoreContext.Provider>
}
