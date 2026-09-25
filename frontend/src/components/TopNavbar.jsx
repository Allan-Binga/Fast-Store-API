import { useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/context'
import { available, money } from '../store/catalog'
import Modal from './Modal'
import ProductImage from './ProductImage'
import LiveSearch from './LiveSearch'

function CustomerPanel() {
  const store = useStore()
  const { panel, setPanel, session, checkSession, cart, wishlist, errors, loading, busy, mutate, refreshShopping, addToCart, toggleWishlist, logout } = store
  const isCart = panel === 'cart'
  const title = panel === 'account' ? 'Your account' : isCart ? 'Your cart' : 'Your wishlist'
  const items = isCart ? cart : wishlist
  return <Modal title={title} onClose={() => setPanel(null)}>
    {session.status === 'checking' ? <p role="status">Checking your session…</p> : session.status !== 'authenticated' ? <div className="space-y-4">
      <p>{session.status === 'error' ? 'We could not check your account. You can still browse the store.' : 'Sign in to save products and manage your cart. You can browse all products without an account.'}</p>
      <Link to="/register" onClick={() => setPanel(null)} className="inline-block rounded-sm bg-primary px-4 py-2 text-white">Create account</Link>
      <Link to="/login" onClick={() => setPanel(null)} className="ml-3 inline-block text-primary underline">Sign in</Link>
      <button className="rounded-sm bg-primary px-4 py-2 text-white" onClick={checkSession}>Check session again</button>
      <button className="ml-3 underline" onClick={() => setPanel(null)}>Continue browsing</button>
    </div> : panel === 'account' ? <div className="space-y-4"><p>Signed in as {session.user.email}</p><button disabled={busy} onClick={logout} className="rounded-sm border border-outline-variant px-4 py-2">Sign out</button></div> : <div className="space-y-4">
      {loading && <p role="status">Updating your {panel}…</p>}
      {errors[panel] && <div role="alert"><p className="text-error">{errors[panel]}</p><button onClick={refreshShopping} disabled={loading} className="underline">Try again</button></div>}
      {!loading && !errors[panel] && items.length === 0 && <p>Your {panel} is empty. Explore the store to find something you like.</p>}
      {items.map(item => <div key={isCart ? item.productId : item._id} className="flex items-start gap-4 border-b border-outline-variant pb-4">
        <ProductImage src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-sm object-contain bg-surface-container-low" />
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
        <Link to="/cart" onClick={() => setPanel(null)} className="block rounded-sm bg-primary px-4 py-2 text-center text-white">View full cart</Link>
        <p className="text-sm text-outline">Prices and availability are checked again at checkout.</p>
        <button disabled={busy || loading} onClick={() => mutate({ method: 'delete', url: '/cart/clear' }, 'Cart cleared.')} className="text-error underline">Clear cart</button>
      </div> : <button disabled={busy || loading} onClick={() => mutate({ method: 'post', url: '/wishlist/add-to-cart' }, 'Wishlist added to your cart.', 'cart')} className="rounded-sm bg-primary px-4 py-2 text-white disabled:opacity-40">Add wishlist to cart</button>)}
    </div>}
    {store.notice && <p role="status" className="mt-4 rounded-sm bg-surface-container-low p-3">{store.notice}</p>}
  </Modal>
}

export default function TopNavbar() {
  const { categories, session, cart, wishlist, errors, loading, panel, setPanel, notice, setNotice, busy, logout } = useStore()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const header = useRef(null)
  const category = params.get('category') || ''
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const names = categories.data || []
  const primary = names.slice(0, 4)
  const signedIn = session.status === 'authenticated'
  const cartReady = signedIn && !errors.cart && !loading
  const wishlistReady = signedIn && !errors.wishlist && !loading
  useEffect(() => {
    function dismiss(event) {
      header.current?.querySelectorAll('details[open]').forEach(menu => {
        if (event.type === 'keydown' && event.key === 'Escape') { menu.open = false; menu.querySelector('summary')?.focus() }
        else if (event.type === 'pointerdown' && !menu.contains(event.target)) menu.open = false
      })
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismiss)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', dismiss) }
  }, [])
  function closeMenu(event) { const menu = event.currentTarget.closest('details'); if (menu) menu.open = false }
  return <>
    <header ref={header} className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-8 xl:flex-nowrap">
        <Link to="/" className="shrink-0 font-headline-md text-headline-md font-extrabold tracking-tight text-primary">FastStore</Link>
        <nav aria-label="Product categories" className="order-3 flex w-full min-w-0 items-center gap-3 xl:order-none xl:w-auto xl:max-w-[390px]">
          {categories.loading && <span role="status" className="text-xs text-outline">Loading categories…</span>}
          {categories.error && <button className="text-xs text-error underline" onClick={categories.retry}>Retry categories</button>}
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3 xl:justify-start">
            {primary.map(name => <Link key={name} title={name} aria-current={category === name ? 'page' : undefined} className={`min-w-0 truncate py-1 text-xs font-semibold text-primary hover:text-secondary sm:text-sm xl:max-w-24 ${category === name ? 'border-b-2 border-primary' : ''}`} to={`/?${new URLSearchParams({ category: name })}#featured`}>{name}</Link>)}
          </div>
          <details className="relative shrink-0" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false }}>
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-sm px-2 py-1.5 text-xs font-semibold text-primary hover:bg-surface-container-low [&::-webkit-details-marker]:hidden" aria-label="More categories">More<span aria-hidden="true" className="material-symbols-outlined text-[18px]">expand_more</span></summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-outline-variant bg-white p-2 shadow-xl">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-outline">Shop by category</p>
              <Link onClick={closeMenu} to="/#featured" className="block rounded-sm px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low">All products</Link>
              <div className="max-h-72 overflow-y-auto">{names.map(name => <Link key={name} onClick={closeMenu} aria-current={category === name ? 'page' : undefined} to={`/?${new URLSearchParams({ category: name })}#featured`} className={`block break-words rounded-sm px-3 py-2 text-sm text-primary hover:bg-surface-container-low ${category === name ? 'bg-surface-container-low font-semibold' : ''}`}>{name}</Link>)}</div>
            </div>
          </details>
        </nav>
        <div className="order-2 w-full min-w-0 md:order-none md:w-auto md:flex-1 xl:min-w-48"><LiveSearch key={params.get('q') || ''} query={params.get('q') || ''} onView={id => navigate(`/products/${id}`)} /></div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button onClick={() => setPanel('wishlist')} aria-label="Open wishlist" className="relative rounded-sm p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low"><span className="material-symbols-outlined text-[22px]" aria-hidden="true">favorite</span>{wishlistReady && wishlist.length > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white">{wishlist.length}</span>}</button>
          <details className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false }}>
            <summary aria-label="Account" className="flex cursor-pointer list-none items-center gap-1.5 rounded-sm p-2 text-on-surface-variant hover:bg-surface-container-low [&::-webkit-details-marker]:hidden"><span className="material-symbols-outlined" aria-hidden="true">account_circle</span><span className="hidden text-sm font-medium sm:inline">{signedIn ? 'Account' : 'Sign in'}</span></summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-60 max-w-[calc(100vw-2rem)] space-y-1 rounded-md border border-outline-variant bg-white p-2 shadow-xl">
              {session.status === 'checking' ? <p role="status" className="p-3 text-sm text-outline">Checking session…</p> : signedIn ? <><p className="break-all border-b border-outline-variant/60 px-3 py-3 text-xs text-outline">Signed in as<br /><span className="font-medium text-on-surface">{session.user.email}</span></p><button onClick={event => { closeMenu(event); setPanel('wishlist') }} className="block w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-surface-container-low">Your wishlist</button><button onClick={event => { closeMenu(event); navigate('/cart') }} className="block w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-surface-container-low">Your cart</button><button disabled={busy} onClick={event => { closeMenu(event); void logout() }} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm font-semibold text-error hover:bg-error-container/30 disabled:opacity-50"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">logout</span>{busy ? 'Please wait…' : 'Log out'}</button></> : <><Link onClick={closeMenu} to="/login" className="block rounded-sm px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low">Sign in</Link><Link onClick={closeMenu} to="/register" className="block rounded-sm px-3 py-2 text-sm hover:bg-surface-container-low">Create account</Link></>}
            </div>
          </details>
          <button onClick={() => navigate('/cart')} aria-label="Open cart" className="flex items-center gap-1.5 rounded-sm border border-outline-variant/60 bg-surface-container-low px-2.5 py-2 text-primary hover:bg-surface-container-high"><span className="material-symbols-outlined text-[22px]" aria-hidden="true">shopping_bag</span><span className="hidden text-sm font-semibold sm:inline">Bag</span>{cartReady && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">{cartCount}</span>}</button>
        </div>
      </div>
    </header>
    {notice && !panel && <div role="status" className="fixed bottom-5 left-4 right-4 z-40 mx-auto flex max-w-lg items-center justify-between gap-4 rounded-md border border-outline-variant bg-white p-4 shadow-xl"><p>{notice}</p><button aria-label="Dismiss message" onClick={() => setNotice('')} className="p-2">×</button></div>}
    {panel && <CustomerPanel />}
  </>
}
