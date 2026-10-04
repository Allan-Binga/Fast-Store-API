import { useEffect, useRef } from 'react';
export default function Reveal({ children, index = 0 }) {
  const element = useRef(null);
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.dataset.visible = 'true';
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { node.dataset.visible = 'true'; observer.disconnect(); }
    }, { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={element} className="home-reveal h-full" data-visible="false" style={{ '--reveal-delay': `${Math.min(index, 5) * 35}ms` }}>{children}</div>;
}
