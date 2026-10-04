import Skeleton from './Skeleton'

export default function ResourceState({ resource, empty, children, skeleton }) {
  if (resource.loading) return skeleton || <Skeleton label="Loading content" />
  if (resource.error) return <div role="alert" className="p-5 rounded-sm border border-error text-error"><p>{resource.error}</p><button className="mt-2 underline" onClick={resource.retry}>Try again</button></div>
  if (empty) return <p className="p-6 rounded-sm bg-surface-container-low text-on-surface-variant">Nothing here yet. Check back soon or browse another department.</p>
  return children
}
