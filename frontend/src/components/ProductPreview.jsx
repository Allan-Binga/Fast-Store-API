import useResource from '../hooks/useResource'
import { useStore } from '../store/context'
import { available, money } from '../store/catalog'
import Modal from './Modal'
import ProductImage from './ProductImage'
import ResourceState from './ResourceState'

export default function ProductPreview({ id, onClose }) {
  const resource = useResource(`/products/${encodeURIComponent(id)}`)
  const product = resource.data
  const { addToCart, toggleWishlist, cart, wishlist, busy, setPanel } = useStore()
  return <Modal title={product?.name || 'Product details'} onClose={onClose}>
    <ResourceState resource={resource}>
      {product && <div className="space-y-4">
        <ProductImage src={product.image} alt={product.name} className="h-64 w-full object-contain rounded-xl bg-surface-container-low" />
        <p className="text-sm text-outline">{product.category?.join(' · ')}</p>
        <p className="whitespace-pre-line">{product.description}</p>
        <p className="text-price-lg font-bold">{money(product.currentPrice)}</p>
        <p>{product.quantity} available · {product.reviews?.count || 0} ratings</p>
        <p className="text-sm text-outline">Any eligible flash-sale price is applied when added to your cart.</p>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-lg bg-primary px-4 py-3 text-white disabled:opacity-50" disabled={busy || !available(product)} onClick={() => { if (cart.some(item => item.productId === id)) { onClose(); setPanel('cart') } else { onClose(); void addToCart(product) } }}>{cart.some(item => item.productId === id) ? 'View in cart' : 'Add to cart'}</button>
          <button className="rounded-lg border border-outline-variant px-4 py-3 disabled:opacity-50" disabled={busy} onClick={() => { onClose(); void toggleWishlist(product) }}>{wishlist.some(item => item._id === id) ? 'Remove from wishlist' : 'Save to wishlist'}</button>
        </div>
      </div>}
    </ResourceState>
  </Modal>
}
