import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopNavbar from '../components/TopNavbar'
import ProductImage from '../components/ProductImage'
import ProductCard from '../components/ProductCard'
import ResourceState from '../components/ResourceState'
import useResource from '../hooks/useResource'
import { useStore } from '../store/context'
import { money } from '../store/catalog'

function RelatedProducts({ product }) {
  const category = product.category?.[0]
  const resource = useResource(category ? `/categories/${encodeURIComponent(category)}?limit=5` : null)
  const navigate = useNavigate()
  if (!category) return null
  const products = (resource.data || []).filter(item => item._id !== product._id).slice(0, 4)
  return <section className="space-y-5 border-t border-outline-variant pt-8" aria-labelledby="related-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="related-title" className="font-headline-md text-headline-md">More in {category}</h2><Link to={`/?${new URLSearchParams({ category })}#featured`} className="text-sm text-primary hover:underline">Browse category →</Link></div><ResourceState resource={resource} empty={!products.length}><div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map(item => <ProductCard key={item._id} product={item} onView={id => navigate(`/products/${id}`)} />)}</div></ResourceState></section>
}

function ProductContent({ product }) {
  const { cart, wishlist, addToCart, toggleWishlist, setPanel, busy, session } = useStore()
  const [quantity, setQuantity] = useState(1)
  const [quantityError, setQuantityError] = useState('')
  const max = Math.min(product.quantity, 999)
  const inStock = max > 0
  const inCart = cart.some(item => item.productId === product._id)
  const saved = wishlist.some(item => item._id === product._id)
  const disabled = busy || session.status === 'checking'
  useEffect(() => {
    const previous = document.title
    document.title = `${product.name} — FastStore`
    window.scrollTo({ top: 0 })
    try {
      const stored = JSON.parse(localStorage.getItem('faststore.recent') || '[]')
      const ids = Array.isArray(stored) ? stored.filter(id => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id) && id !== product._id) : []
      localStorage.setItem('faststore.recent', JSON.stringify([product._id, ...new Set(ids)].slice(0, 4)))
    } catch { /* Product browsing works without local storage. */ }
    return () => { document.title = previous }
  }, [product._id, product.name])
  function add(event) {
    event.preventDefault()
    if (inCart) { setPanel('cart'); return }
    const amount = Number(quantity)
    if (!Number.isInteger(amount) || amount < 1 || amount > max) { setQuantityError(`Choose a whole number from 1 to ${max}.`); return }
    setQuantityError('')
    void addToCart(product, amount)
  }
  return <>
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-outline"><Link to="/" className="hover:text-primary">Home</Link><span aria-hidden="true">/</span>{product.category?.[0] && <><Link to={`/?${new URLSearchParams({ category: product.category[0] })}#featured`} className="hover:text-primary">{product.category[0]}</Link><span aria-hidden="true">/</span></>}<span aria-current="page" className="text-on-surface">{product.name}</span></nav>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <section aria-label="Product image" className="lg:col-span-7"><div className="relative overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-10"><ProductImage src={product.image} alt={product.name} className="aspect-square w-full object-contain" />{product.discount > 0 && <span className="absolute left-5 top-5 rounded-md bg-primary px-3 py-1 text-sm font-semibold text-white">{product.discount}% off</span>}</div></section>
      <section aria-labelledby="product-title" className="flex flex-col gap-5 rounded-md border border-outline-variant bg-white p-6 shadow-sm sm:p-8 lg:col-span-5">
        <div className="flex flex-wrap gap-2">{(product.category || []).map(category => <Link key={category} to={`/?${new URLSearchParams({ category })}#featured`} className="rounded-md bg-surface-container-low px-3 py-1 text-xs font-medium text-primary">{category}</Link>)}</div>
        <h1 id="product-title" className="break-words font-headline-lg text-headline-lg font-semibold tracking-tight">{product.name}</h1>
        <p className="text-sm text-on-surface-variant">{product.reviews?.count ? `★ ${product.reviews.rate} out of 5 · ${product.reviews.count} ratings` : 'No ratings yet'}</p>
        <div className="flex flex-wrap items-baseline gap-3"><span className="font-price-lg text-price-lg font-bold">{money(product.currentPrice)}</span>{product.originalPrice > product.currentPrice && <><del className="text-outline">{money(product.originalPrice)}</del><span className="text-sm text-primary">Save {money(product.originalPrice - product.currentPrice)}</span></>}</div>
        <p className={`text-sm font-semibold ${inStock ? 'text-green-700' : 'text-error'}`}>{inStock ? `In stock · ${product.quantity} available` : 'Out of stock'}</p>
        <p className="whitespace-pre-line break-words text-body-md leading-relaxed text-on-surface-variant">{product.description}</p>
        <form onSubmit={add} noValidate className="mt-auto space-y-4 border-t border-outline-variant/60 pt-5">
          {!inCart && inStock && <div><label htmlFor="product-quantity" className="mb-2 block text-sm font-medium">Quantity</label><div className="inline-flex h-11 items-center rounded-sm border border-outline-variant"><button type="button" aria-label="Decrease quantity" disabled={disabled || Number(quantity) <= 1} onClick={() => { setQuantity(value => Math.max(1, (Number(value) || 1) - 1)); setQuantityError('') }} className="h-full px-4 disabled:opacity-40">−</button><input id="product-quantity" type="number" inputMode="numeric" min={1} max={max} step={1} value={quantity} disabled={disabled} onChange={event => { setQuantity(event.target.value); setQuantityError('') }} aria-invalid={Boolean(quantityError)} aria-describedby={quantityError ? 'quantity-error' : undefined} className="w-16 bg-white text-center font-semibold" /><button type="button" aria-label="Increase quantity" disabled={disabled || Number(quantity) >= max} onClick={() => { setQuantity(value => Math.min(max, (Number(value) || 0) + 1)); setQuantityError('') }} className="h-full px-4 disabled:opacity-40">+</button></div>{quantityError && <p id="quantity-error" role="alert" className="mt-2 text-sm text-error">{quantityError}</p>}</div>}
          <button type="submit" disabled={disabled || (!inStock && !inCart)} className="min-h-11 w-full rounded-sm bg-primary-container px-5 py-3 font-semibold text-white hover:bg-secondary disabled:opacity-50">{inCart ? 'View in cart' : !inStock ? 'Out of stock' : busy ? 'Updating…' : 'Add to cart'}</button>
          <button type="button" aria-pressed={saved} disabled={disabled} onClick={() => toggleWishlist(product)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-outline-variant px-5 py-3 text-primary hover:bg-surface-container-low disabled:opacity-50"><span aria-hidden="true" className={`material-symbols-outlined text-[20px] ${saved ? 'fill-icon' : ''}`}>favorite</span>{saved ? 'Remove from wishlist' : 'Save to wishlist'}</button>
          <p className="text-caption text-outline">Eligible flash-sale prices are applied in your cart. Prices and stock are checked again at checkout.</p>
        </form>
      </section>
    </div>
    <RelatedProducts product={product} />
  </>
}

export default function ProductDetails() {
  const { id } = useParams()
  const valid = /^[a-f\d]{24}$/i.test(id || '')
  const resource = useResource(valid ? `/products/${id}` : null)
  const missing = !valid || resource.status === 404
  return <div className="flex min-h-screen flex-col bg-surface font-body-md text-on-surface">
    <TopNavbar />
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8 sm:px-8">
      {missing ? <section className="rounded-md border border-outline-variant bg-white p-8 text-center"><h1 className="font-headline-md text-headline-md">Product not found</h1><p className="my-4 text-on-surface-variant">This product may have been removed or the link may be incorrect.</p><Link to="/" className="text-primary underline">Browse products</Link></section> : <ResourceState resource={resource}>{resource.data && <ProductContent key={id} product={resource.data} />}</ResourceState>}
    </main>
    <footer className="border-t border-outline-variant bg-white px-4 py-8 text-center text-sm text-outline"><Link to="/" className="font-semibold text-primary">FastStore</Link><p className="mt-2">© {new Date().getFullYear()} FastStore. All rights reserved.</p></footer>
  </div>
}
