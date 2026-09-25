export const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
export const available = product => (product.quantityAvailable ?? product.quantity ?? 0) > 0 && (!product.endTime || new Date(product.endTime) > new Date())
export function catalogUrl({ query = '', category = '', page = 1, limit = 12 }) {
  if (query) return `/products/search?${new URLSearchParams({ q: query, page, limit })}`
  if (category) return `/categories/${encodeURIComponent(category)}?${new URLSearchParams({ page, limit })}`
  return `/products?${new URLSearchParams({ page, limit })}`
}
