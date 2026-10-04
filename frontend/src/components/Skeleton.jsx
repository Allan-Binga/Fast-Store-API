export default function Skeleton({ variant = 'cards', count = 2, label = 'Loading content' }) {
  const tiles = variant === 'departments';
  const products = variant === 'products';
  return <div role="status" aria-label={label} aria-busy="true" className={tiles ? 'grid grid-cols-2 gap-4 md:grid-cols-4' : products ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4' : 'space-y-5'}>
    <span className="sr-only">{label}…</span>
    {Array.from({ length: count }, (_, index) => <div key={index} aria-hidden="true" className={`animate-pulse rounded-md border border-outline-variant/60 bg-white ${tiles ? 'h-20' : 'space-y-4 p-5'}`}>
      {!tiles && <>{products && <div className="aspect-square rounded-sm bg-surface-container-low" />}<div className="h-4 w-1/3 rounded-sm bg-surface-container-high" /><div className="h-6 w-3/4 rounded-sm bg-surface-container-low" /><div className="h-4 w-full rounded-sm bg-surface-container-low" /><div className="h-4 w-2/3 rounded-sm bg-surface-container-low" /><div className="h-10 w-32 rounded-sm bg-surface-container-high" /></>}
    </div>)}
  </div>;
}
