import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/context'
import { available, money } from '../store/catalog'
import Modal from './Modal'
import ProductImage from './ProductImage'

function SearchForm({ query }) {
  const [value, setValue] = useState(query)
  const navigate = useNavigate()
  return <form role="search" className="flex min-w-0 flex-1 gap-2" onSubmit={event => {
    event.preventDefault()
    const q = value.trim()
    navigate(q ? `/?${new URLSearchParams({ q })}#featured` : '/#featured')
  }}>
    <label htmlFor="store-search" className="sr-only">Search products</label>
    <input id="store-search" type="search" value={value} maxLength={200} onChange={event => setValue(event.target.value)} placeholder="Search products…" className="min-w-0 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2" />
    <button className="rounded-lg bg-primary px-4 py-2 text-white" type="submit">Search</button>
  </form>
}

function CustomerPanel() {
  const store = useStore()
  const { panel, setPanel, session, checkSession, cart, wishlist, errors, loading, busy, mutate, refreshShopping, addToCart, toggleWishlist, logout } = store
  const isCart = panel === 'cart'
  const title = panel === 'account' ? 'Your account' : isCart ? 'Your cart' : 'Your wishlist'
  const items = isCart ? cart : wishlist
  return <Modal title={title} onClose={() => setPanel(null)}>
    {session.status === 'checking' ? <p role="status">Checking your session…</p> : session.status !== 'authenticated' ? <div className="space-y-4">
      <p>{session.status === 'error' ? 'We could not check your account. You can still browse the store.' : 'Sign in to save products and manage your cart. You can browse all products without an account.'}</p>
      <Link to="/register" onClick={() => setPanel(null)} className="inline-block rounded-lg bg-primary px-4 py-2 text-white">Create account</Link>
      <Link to="/login" onClick={() => setPanel(null)} className="ml-3 inline-block text-primary underline">Sign in</Link>
      <button className="rounded-lg bg-primary px-4 py-2 text-white" onClick={checkSession}>Check session again</button>
      <button className="ml-3 underline" onClick={() => setPanel(null)}>Continue browsing</button>
    </div> : panel === 'account' ? <div className="space-y-4"><p>Signed in as {session.user.email}</p><button disabled={busy} onClick={logout} className="rounded-lg border border-outline-variant px-4 py-2">Sign out</button></div> : <div className="space-y-4">
      {loading && <p role="status">Updating your {panel}…</p>}
      {errors[panel] && <div role="alert"><p className="text-error">{errors[panel]}</p><button onClick={refreshShopping} disabled={loading} className="underline">Try again</button></div>}
      {!loading && !errors[panel] && items.length === 0 && <p>Your {panel} is empty. Explore the store to find something you like.</p>}
      {items.map(item => <div key={isCart ? item.productId : item._id} className="flex items-start gap-4 border-b border-outline-variant pb-4">
        <ProductImage src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-lg object-contain bg-surface-container-low" />
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="font-semibold">{item.name}</h3>
          <p>{money(isCart ? item.price : item.currentPrice)}{isCart && ` each · ${money(item.price * item.quantity)} total`}</p>
          {isCart && item.available === false && <p className="text-error text-sm">Requested quantity is unavailable. Reduce it or remove this item.</p>}
          {isCart ? <div className="flex flex-wrap items-center gap-3">
            <button aria-label={`Decrease quantity of ${item.name}`} disabled={busy || loading || item.quantity <= 1} onClick={() => mutate({ method: 'patch', url: '/cart/quantity', data: { productId: item.productId, quantity: item.quantity - 1 } }, 'Quantity updated.')} className="rounded border px-3 py-1 disabled:opacity-40">−</button>
            <span aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
            <button aria-label={`Increase quantity of ${item.name}`} disabled={busy || loading || item.quantity >= 999 || item.available === false} onClick={() => mutate({ method: 'patch', url: '/cart/quantity', data: { productId: item.productId, quantity: item.quantity + 1 } }, 'Quantity updated.')} className="rounded border px-3 py-1 disabled:opacity-40">+</button>
            <button disabled={busy || loading} onClick={() => mutate({ method: 'delete', url: '/cart/remove', data: { productId: item.productId } }, 'Product removed.')} className="text-error underline">Remove</button>
          </div> : <div className="flex flex-wrap gap-3">
            <button disabled={busy || loading || !available(item) || cart.some(entry => entry.productId === item._id)} onClick={() => addToCart(item)} className="text-primary underline disabled:opacity-40">{cart.some(entry => entry.productId === item._id) ? 'Already in cart' : 'Add to cart'}</button>
            <button disabled={busy || loading} onClick={() => toggleWishlist(item)} className="text-error underline">Remove</button>
          </div>}
        </div>
      </div>)}
      {items.length > 0 && !errors[panel] && (isCart ? <div className="space-y-3">
        <p className="flex justify-between font-semibold"><span>Subtotal</span><span>{money(cart.reduce((total, item) => total + item.price * item.quantity, 0))}</span></p>
        <p className="text-sm text-outline">Prices and availability are checked again at checkout. Checkout is not yet available on this storefront.</p>
        <button disabled={busy || loading} onClick={() => mutate({ method: 'delete', url: '/cart/clear' }, 'Cart cleared.')} className="text-error underline">Clear cart</button>
      </div> : <button disabled={busy || loading} onClick={() => mutate({ method: 'post', url: '/wishlist/add-to-cart' }, 'Wishlist added to your cart.', 'cart')} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-40">Add wishlist to cart</button>)}
    </div>}
    {store.notice && <p role="status" className="mt-4 rounded-lg bg-surface-container-low p-3">{store.notice}</p>}
  </Modal>
}

export default function TopNavbar() {
  const { categories, session, cart, wishlist, errors, loading, panel, setPanel, notice, setNotice } = useStore()
  const [params] = useSearchParams()
  const category = params.get('category') || ''
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  return <>
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-8">
        <Link to="/" className="text-headline-md font-headline-md font-extrabold text-primary">FastStore</Link>
        <div className="order-3 w-full md:order-none md:w-auto md:flex-1"><SearchForm key={params.get('q') || ''} query={params.get('q') || ''} /></div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setPanel('wishlist')} aria-label="Open wishlist" className="flex items-center gap-1 rounded-lg p-2 hover:bg-surface-container-low"><span className="material-symbols-outlined" aria-hidden="true">favorite</span><span className="text-xs">{session.status === 'authenticated' && !errors.wishlist && !loading ? wishlist.length : '—'}</span></button>
          <button onClick={() => setPanel('cart')} aria-label="Open cart" className="flex items-center gap-1 rounded-lg p-2 hover:bg-surface-container-low"><span className="material-symbols-outlined" aria-hidden="true">shopping_bag</span><span className="text-xs">{session.status === 'authenticated' && !errors.cart && !loading ? cartCount : '—'}</span></button>
          <button onClick={() => setPanel('account')} className="rounded-lg border border-outline-variant px-3 py-2 text-sm">{session.status === 'authenticated' ? 'Account' : 'Sign in'}</button>
        </div>
      </div>
      <nav aria-label="Product categories" className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 pb-3 text-sm sm:px-8">
        <Link to="/#featured" className="shrink-0 text-primary font-semibold">All products</Link>
        {categories.loading && <span role="status">Loading categories…</span>}
        {categories.error && <button className="shrink-0 text-error underline" onClick={categories.retry}>Retry categories</button>}
        {(categories.data || []).map(name => <Link key={name} aria-current={category === name ? 'page' : undefined} className={`shrink-0 hover:text-primary ${category === name ? 'text-primary font-semibold' : ''}`} to={`/?${new URLSearchParams({ category: name })}#featured`}>{name}</Link>)}
      </nav>
    </header>
    {notice && !panel && <div role="status" className="fixed bottom-5 left-4 right-4 z-40 mx-auto flex max-w-lg items-center justify-between gap-4 rounded-xl border border-outline-variant bg-white p-4 shadow-xl"><p>{notice}</p><button aria-label="Dismiss message" onClick={() => setNotice('')} className="p-2">×</button></div>}
    {panel && <CustomerPanel />}
  </>
}
