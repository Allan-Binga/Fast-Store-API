import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import HomeHero from '../components/HomeHero'
import Reveal from '../components/Reveal'
import Skeleton from '../components/Skeleton'
import TopNavbar from '../components/TopNavbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import ResourceState from '../components/ResourceState'
import useResource from '../hooks/useResource'
import { useStore } from '../store/context'
import { catalogUrl } from '../store/catalog'

function ProductGrid({ products, onView }) {
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product, index) => <Reveal key={product._id} index={index}><ProductCard product={product} onView={onView} /></Reveal>)}</div>
}

function Collection({ title, url, onView, promotions = false, id }) {
  const resource = useResource(url)
  const products = promotions ? [...new Map((resource.data || []).filter(promo => promo.product).map(promo => [promo.product._id, promo.product])).values()] : resource.data || []
  return <section id={id} className="space-y-5 scroll-mt-44"><h2 className="font-headline-md text-headline-md">{title}</h2><ResourceState resource={resource} empty={!products.length} skeleton={<Skeleton variant="products" count={8} label={`Loading ${title}`} />}><ProductGrid products={products} onView={onView} /></ResourceState></section>
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
  const navigate = useNavigate()
  const [recent, setRecent] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem('faststore.recent') || '[]')
      return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)))].slice(0, 4) : []
    } catch { return [] }
  })
  const browse = Boolean(query || category)
  function viewProduct(id) {
    navigate(`/products/${id}`)
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
        <HomeHero />
        <section className="space-y-5"><h2 className="font-headline-md text-headline-md">Explore departments</h2>
          <ResourceState resource={categories} empty={!categories.data?.length} skeleton={<Skeleton variant="departments" count={8} label="Loading departments" />}><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{(categories.data || []).map((name, index) => <Reveal key={name} index={index}><Link to={`/?${new URLSearchParams({ category: name })}#featured`} className="flex h-full items-center gap-3 rounded-sm border border-outline-variant bg-white p-5 transition-colors hover:border-primary hover:text-primary"><span className="material-symbols-outlined text-primary" aria-hidden="true">category</span><span>{name}</span></Link></Reveal>)}</div></ResourceState>
        </section>
        <Collection title="Deals of the week" url="/promo?limit=8" promotions onView={viewProduct} id="deals" />
        <Collection title="Flash sales" url="/flashsale?limit=8" onView={viewProduct} />
      </>}
      <section id="featured" className="space-y-6 scroll-mt-44" aria-labelledby="catalog-title">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="catalog-title" className="font-headline-md text-headline-md">{query ? `Search results for “${query}”` : category || 'Explore our products'}</h2><p className="mt-1 text-sm text-outline">{browse ? 'Discover products from the current catalog.' : 'Find something for your everyday.'}</p></div>{browse && <Link to="/#featured" className="text-primary underline">Clear filters</Link>}</div>
        <ResourceState resource={products} empty={!products.data?.length} skeleton={<Skeleton variant="products" count={12} label="Loading products" />}><ProductGrid products={products.data || []} onView={viewProduct} /></ResourceState>
        <nav aria-label="Catalog pages" className="flex items-center justify-center gap-4">
          <button className="rounded-sm border border-outline-variant px-4 py-2 disabled:opacity-40" disabled={page === 1 || products.loading} onClick={() => changePage(page - 1)}>Previous</button>
          <span>Page {page}</span>
          <button className="rounded-sm border border-outline-variant px-4 py-2 disabled:opacity-40" disabled={products.loading || Boolean(products.error) || (products.data?.length || 0) < 12 || page >= 10000} onClick={() => changePage(page + 1)}>Next</button>
        </nav>
      </section>
      {!browse && <Collection title="New arrivals" url="/products/new-arrivals" onView={viewProduct} />}
      <RecentlyViewed ids={recent} onView={viewProduct} />
    </main>
    <Footer />
  </div>
}
