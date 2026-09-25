import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, errorMessage } from '../api'
import { money } from '../store/catalog'
import ProductImage from './ProductImage'

export default function LiveSearch({ query, onView }) {
  const [value, setValue] = useState(query)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const input = useRef(null)
  const listId = useId()
  const navigate = useNavigate()
  const term = value.trim()
  const current = result?.term === term && result?.attempt === attempt ? result : null
  const products = current?.products || []
  const loading = Boolean(term) && !current

  useEffect(() => {
    if (!term) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      api.get('/products/search', { params: { q: term, limit: 5, suggest: 'true' }, signal: controller.signal }).then(({ data }) => {
        if (!controller.signal.aborted) setResult({ term, attempt, products: data })
      }).catch(error => {
        if (!controller.signal.aborted) setResult({ term, attempt, products: [], error: errorMessage(error) })
      })
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [term, attempt])
  useEffect(() => {
    function shortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); input.current?.focus() }
    }
    document.addEventListener('keydown', shortcut)
    return () => document.removeEventListener('keydown', shortcut)
  }, [])
  function view(product) { setOpen(false); setActive(-1); onView(product._id) }
  function search(event) {
    event.preventDefault()
    if (event.nativeEvent.submitter?.name !== 'all-results' && open && active >= 0 && products[active]) { view(products[active]); return }
    setOpen(false)
    navigate(term ? `/?${new URLSearchParams({ q: term })}#featured` : '/#featured')
  }
  return <form role="search" onSubmit={search} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }} className="relative min-w-0 w-full">
    <div className="relative flex items-center">
      <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute left-3 text-[20px] text-outline">search</span>
      <input ref={input} role="combobox" aria-label="Search products" aria-autocomplete="list" aria-expanded={open && Boolean(term)} aria-controls={listId} aria-activedescendant={open && active >= 0 && products[active] ? `${listId}-${active}` : undefined} autoComplete="off" type="search" value={value} maxLength={200} onChange={event => { setValue(event.target.value); setOpen(true); setActive(-1) }} onFocus={() => setOpen(true)} onKeyDown={event => {
        if (event.key === 'Escape') { setOpen(false); setActive(-1) }
        if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActive(index => Math.min(index + 1, products.length - 1)) }
        if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(-1, index - 1)) }
      }} placeholder="Search products…" className="h-10 w-full min-w-0 rounded-sm border border-outline-variant bg-white pl-10 pr-14 text-sm placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15" />
      <button type="submit" aria-label="Search" className="absolute right-2 flex h-7 w-9 items-center justify-center rounded border border-outline-variant/60 bg-surface-container-low text-outline hover:text-primary"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span></button>
    </div>
    {open && term && <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[65dvh] overflow-y-auto rounded-xl border border-outline-variant bg-white p-2 shadow-xl">
      <p className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-outline">Suggested products</p>
      {loading && <p role="status" className="px-3 py-4 text-sm text-outline">Searching…</p>}
      {current?.error && <div role="alert" className="space-y-2 px-3 py-3 text-sm"><p className="text-error">{current.error}</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="text-primary underline">Retry search</button></div>}
      {!loading && !current?.error && !products.length && <p role="status" className="px-3 py-4 text-sm text-outline">No matching products. Try another search.</p>}
      <ul id={listId} role="listbox" aria-label="Product suggestions" className="space-y-1">
        {products.map((product, index) => <li key={product._id} id={`${listId}-${index}`} role="option" aria-selected={active === index} onMouseDown={event => event.preventDefault()} onClick={() => view(product)} className={`flex cursor-pointer items-center gap-3 rounded-sm px-2.5 py-2 hover:bg-surface-container-low ${active === index ? 'bg-surface-container-low' : ''}`}>
          <ProductImage src={product.image} alt="" className="h-10 w-10 shrink-0 rounded object-contain" />
          <div className="min-w-0 flex-1"><p className="text-sm font-medium text-on-surface">{product.name}</p><p className="truncate text-xs text-outline">{product.category?.join(' · ')}</p></div><span className="text-xs font-semibold text-primary">{money(product.currentPrice)}</span>
        </li>)}
      </ul>
      <button type="submit" name="all-results" className="mt-2 w-full rounded-sm border-t border-outline-variant/60 px-3 py-3 text-left text-sm font-semibold text-primary">View all results for “{term}” →</button>
    </div>}
  </form>
}
