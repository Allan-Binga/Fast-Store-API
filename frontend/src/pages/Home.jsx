import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import hero from '../assets/hero.png'
import TopNavbar from '../components/TopNavbar'
import ProductCard from '../components/ProductCard'
import ProductPreview from '../components/ProductPreview'
import ResourceState from '../components/ResourceState'
import useResource from '../hooks/useResource'
import { useStore } from '../store/context'
import { catalogUrl } from '../store/catalog'

function ProductGrid({ products, onView }) {
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map(product => <ProductCard key={product._id} product={product} onView={onView} />)}</div>
}

function Collection({ title, url, onView, promotions = false, id }) {
  const resource = useResource(url)
  const products = promotions ? [...new Map((resource.data || []).filter(promo => promo.product).map(promo => [promo.product._id, promo.product])).values()] : resource.data || []
  return <section id={id} className="space-y-5 scroll-mt-44"><h2 className="font-headline-md text-headline-md">{title}</h2><ResourceState resource={resource} empty={!products.length}><ProductGrid products={products} onView={onView} /></ResourceState></section>
}

function RecentlyViewed({ ids, onView }) {
  // Each saved ID is resolved against the catalog; local storage never supplies prices.
  return ids.length > 0 && <section className="space-y-5 border-t border-outline-variant pt-8"><h2 className="font-headline-md text-headline-md">Recently viewed</h2><div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{ids.map(id => <RecentProduct key={id} id={id} onView={onView} />)}</div></section>
}
function RecentProduct({ id, onView }) {
  const resource = useResource(`/products/${id}`)
  if (!resource.data) return null
  return <ProductCard product={resource.data} onView={onView} />
}

export default function Home() {
  const { categories } = useStore()
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') || '').trim()
  const category = query ? '' : params.get('category') || ''
  const rawPage = Number(params.get('page') || 1)
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 10000 ? rawPage : 1
  const products = useResource(catalogUrl({ query, category, page }))
  const [preview, setPreview] = useState(null)
  const [recent, setRecent] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem('faststore.recent') || '[]')
      return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)))].slice(0, 4) : []
    } catch { return [] }
  })
  const browse = Boolean(query || category)
  function viewProduct(id) {
    setPreview(id)
    const next = [id, ...recent.filter(value => value !== id)].slice(0, 4)
    setRecent(next)
    try { localStorage.setItem('faststore.recent', JSON.stringify(next)) } catch { /* Browsing still works when storage is unavailable. */ }
  }
  function changePage(next) {
    const updated = new URLSearchParams(params)
    updated.set('page', String(next))
    setParams(updated)
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })
  }
  return <div className="min-h-screen bg-surface text-on-surface font-body-md">
    <TopNavbar />
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-8">
      {!browse && <>
        <section aria-labelledby="hero-title" className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-sm">
          <div className="grid items-center lg:grid-cols-2">
            <div className="space-y-6 p-8 lg:p-12">
              <span className="inline-block rounded-full border border-outline-variant bg-surface-container-high px-3 py-1 text-sm font-semibold text-primary">Discover FastStore</span>
              <h1 id="hero-title" className="font-display-hero text-display-hero-mobile lg:text-display-hero">Elevate your everyday essentials</h1>
              <p className="text-body-lg text-on-surface-variant">Explore the latest products, discover new arrivals, and find your next everyday favorite.</p>
              <div className="flex flex-wrap gap-3"><a href="#featured" className="rounded-lg bg-primary px-6 py-3 text-white hover:bg-secondary">Shop now →</a><a href="#deals" className="rounded-lg border border-outline-variant bg-white px-6 py-3">Explore deals</a></div>
              <p className="text-sm text-outline">Browse freely. Sign in to save your favorites and build your cart.</p>
            </div>
            <img src={hero} alt="A collection of everyday essentials" className="h-72 w-full object-cover lg:h-[440px]" />
          </div>
        </section>
        <section className="space-y-5"><h2 className="font-headline-md text-headline-md">Explore departments</h2>
          <ResourceState resource={categories} empty={!categories.data?.length}><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{(categories.data || []).map(name => <Link key={name} to={`/?${new URLSearchParams({ category: name })}#featured`} className="flex items-center gap-3 rounded-xl border border-outline-variant bg-white p-5 hover:border-primary hover:text-primary"><span className="material-symbols-outlined text-primary" aria-hidden="true">category</span><span>{name}</span></Link>)}</div></ResourceState>
        </section>
        <Collection title="Deals of the week" url="/promo?limit=8" promotions onView={viewProduct} id="deals" />
        <Collection title="Flash sales" url="/flashsale?limit=8" onView={viewProduct} />
      </>}
      <section id="featured" className="space-y-6 scroll-mt-44" aria-labelledby="catalog-title">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="catalog-title" className="font-headline-md text-headline-md">{query ? `Search results for “${query}”` : category || 'Explore our products'}</h2><p className="mt-1 text-sm text-outline">{browse ? 'Discover products from the current catalog.' : 'Find something for your everyday.'}</p></div>{browse && <Link to="/#featured" className="text-primary underline">Clear filters</Link>}</div>
        <ResourceState resource={products} empty={!products.data?.length}><ProductGrid products={products.data || []} onView={viewProduct} /></ResourceState>
        <nav aria-label="Catalog pages" className="flex items-center justify-center gap-4">
          <button className="rounded-lg border border-outline-variant px-4 py-2 disabled:opacity-40" disabled={page === 1 || products.loading} onClick={() => changePage(page - 1)}>Previous</button>
          <span>Page {page}</span>
          <button className="rounded-lg border border-outline-variant px-4 py-2 disabled:opacity-40" disabled={products.loading || Boolean(products.error) || (products.data?.length || 0) < 12 || page >= 10000} onClick={() => changePage(page + 1)}>Next</button>
        </nav>
      </section>
      {!browse && <Collection title="New arrivals" url="/products/new-arrivals" onView={viewProduct} />}
      <RecentlyViewed ids={recent} onView={viewProduct} />
    </main>
    <footer className="mt-12 border-t border-outline-variant bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-8"><div><Link to="/" className="font-headline-md text-headline-md font-bold text-primary">FastStore</Link><p className="mt-2 text-sm text-outline">Everyday essentials, all in one place.</p></div><Link to="/#featured" className="text-primary">Browse all products</Link><p className="text-sm text-outline">© {new Date().getFullYear()} FastStore</p></div></footer>
    {preview && <ProductPreview key={preview} id={preview} onClose={() => setPreview(null)} />}
  </div>
}
