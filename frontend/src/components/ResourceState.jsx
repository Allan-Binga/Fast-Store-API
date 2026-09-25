export default function ResourceState({ resource, empty, children }) {
  if (resource.loading) return <p role="status" className="p-6 rounded-xl bg-surface-container-low">Loading…</p>
  if (resource.error) return <div role="alert" className="p-5 rounded-xl border border-error text-error"><p>{resource.error}</p><button className="mt-2 underline" onClick={resource.retry}>Try again</button></div>
  if (empty) return <p className="p-6 rounded-xl bg-surface-container-low text-on-surface-variant">Nothing here yet. Check back soon or browse another department.</p>
  return children
}
