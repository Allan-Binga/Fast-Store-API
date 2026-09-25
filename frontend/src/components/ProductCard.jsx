import { useStore } from '../store/context'
import { available, money } from '../store/catalog'
import ProductImage from './ProductImage'

export default function ProductCard({ product, onView }) {
  const { wishlist, cart, addToCart, toggleWishlist, busy, session, setPanel } = useStore()
  const saved = wishlist.some(item => item._id === product._id)
  const inCart = cart.some(item => item.productId === product._id)
  const inStock = available(product)
  return <article className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
    <div className="relative bg-surface-container-low">
      <button className="block w-full" onClick={() => onView(product._id)} aria-label={`View ${product.name}`}><ProductImage src={product.image} alt={product.name} className="w-full aspect-square object-contain p-5 group-hover:scale-105 transition-transform" /></button>
      <button onClick={() => toggleWishlist(product)} disabled={busy || session.status === 'checking'} aria-pressed={saved} aria-label={`${saved ? 'Remove' : 'Save'} ${product.name} ${saved ? 'from' : 'to'} wishlist`} className="absolute right-3 top-3 rounded-full bg-white p-2 text-primary shadow-sm disabled:opacity-50"><span className={`material-symbols-outlined ${saved ? 'fill-icon' : ''}`} aria-hidden="true">favorite</span></button>
      {product.discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-1 text-xs text-white">{product.discount}% off</span>}
    </div>
    <div className="flex flex-1 flex-col gap-3 p-4">
      <p className="text-caption text-outline">{product.category?.join(' · ')}</p>
      <h3 className="font-title-card text-title-card"><button className="text-left hover:text-primary" onClick={() => onView(product._id)}>{product.name}</button></h3>
      <p className="text-sm text-on-surface-variant">{product.reviews?.count ? `★ ${product.reviews.rate} (${product.reviews.count} ratings)` : 'No ratings yet'}</p>
      {product.endTime && <p className="text-xs text-outline">Sale ends {new Date(product.endTime).toLocaleString()}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2"><span className="text-price-md font-price-md font-bold">{money(product.currentPrice)}</span>{product.originalPrice > product.currentPrice && <del className="text-sm text-outline">{money(product.originalPrice)}</del>}</div>
      <button disabled={busy || session.status === 'checking' || !inStock} onClick={() => inCart ? setPanel('cart') : addToCart(product)} className="rounded-lg bg-primary px-4 py-2.5 text-white hover:bg-secondary disabled:opacity-50">{!inStock ? 'Out of stock' : inCart ? 'View in cart' : 'Add to cart'}</button>
    </div>
  </article>
}
