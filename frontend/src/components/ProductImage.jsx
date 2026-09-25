import { useState } from 'react'
export default function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(null)
  if (!src || failed === src) return <div role="img" aria-label={`${alt}: image unavailable`} className={`flex items-center justify-center bg-surface-container-low text-outline ${className}`}><span className="material-symbols-outlined" aria-hidden="true">image</span></div>
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(src)} className={className} />
}
