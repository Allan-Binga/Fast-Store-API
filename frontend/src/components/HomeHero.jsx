import { useEffect, useState } from 'react';
import fallback from '../assets/hero.png';
const slides = [
  { photo: 'headphones', words: 'everyday essentials', alt: 'Premium headphones on a warm yellow background' },
  { photo: 'desk', words: 'workday setup', alt: 'A considered workspace with everyday accessories' },
  { photo: 'coffee', words: 'morning rituals', alt: 'Hands holding three cups of freshly prepared coffee' },
  { photo: 'sneakers', words: 'weekend style', alt: 'A bright red sneaker on a red background' },
  { photo: 'watch', words: 'daily details', alt: 'A minimalist watch photographed on a clean background' },
  { photo: 'camera', words: 'creative moments', alt: 'A camera ready for the next adventure' },
  { photo: 'fragrance', words: 'personal favorites', alt: 'A fragrance bottle with refined everyday styling' },
  { photo: 'home', words: 'home comforts', alt: 'A minimalist pendant lamp against a turquoise background' },
  { photo: 'bag', words: 'shopping moments', alt: 'A brown paper shopping bag on a clean background' },
  { photo: 'bottle', words: 'healthy habits', alt: 'A reusable water bottle for everyday hydration' },
];
export default function HomeHero() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [frame, setFrame] = useState({ index: 0, text: slides[0].words, deleting: false });
  const slide = slides[frame.index];
  const stopped = reduced || paused || interacting || hidden;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = event => setReduced(event.matches);
    const visibility = () => setHidden(document.hidden);
    media.addEventListener('change', motion);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (stopped) return;
    const complete = frame.text === slide.words;
    const delay = frame.deleting ? 42 : complete ? 4500 : 85;
    const timer = window.setTimeout(() => {
      if (frame.deleting) {
        if (frame.text.length) setFrame({ ...frame, text: frame.text.slice(0, -1) });
        else setFrame({ index: (frame.index + 1) % slides.length, text: '', deleting: false });
      } else if (complete) setFrame({ ...frame, deleting: true });
      else setFrame({ ...frame, text: slide.words.slice(0, frame.text.length + 1) });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [frame, slide, stopped]);
  useEffect(() => {
    if (stopped) return;
    const next = new Image();
    next.src = `/hero/${slides[(frame.index + 1) % slides.length].photo}.webp`;
  }, [frame.index, stopped]);
  function advance(direction) {
    const index = (frame.index + direction + slides.length) % slides.length;
    setPaused(true);
    setFrame({ index, text: slides[index].words, deleting: false });
  }
  return <section aria-labelledby="hero-title" aria-roledescription="carousel" className="overflow-hidden rounded-sm border border-outline-variant bg-surface-container-low" onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
    <div className="grid items-center lg:grid-cols-2"><div className="space-y-6 p-8 lg:p-12">
      <span className="inline-block rounded-full border border-outline-variant bg-surface-container-high px-3 py-1 text-sm font-semibold text-primary">Discover FastStore</span>
      <h1 id="hero-title" className="min-h-[168px] font-display-hero text-display-hero-mobile lg:min-h-[180px] lg:text-display-hero"><span className="sr-only">Elevate your everyday essentials</span><span aria-hidden="true">Elevate your <span className="block text-primary">{reduced ? slide.words : frame.text}<span className={`hero-caret ${stopped ? 'hero-caret-still' : ''}`}>|</span></span></span></h1>
      <p className="text-body-lg text-on-surface-variant">Explore the latest products, discover new arrivals, and find your next everyday favorite.</p>
      <div className="flex flex-wrap gap-3"><a href="#featured" className="rounded-sm bg-primary px-6 py-3 text-white hover:bg-secondary">Shop now →</a><a href="#deals" className="rounded-sm border border-outline-variant bg-white px-6 py-3">Explore deals</a></div>
      <p className="text-sm text-outline">Browse freely. Sign in to save your favorites and build your cart.</p>
    </div><div className="relative h-80 overflow-hidden bg-surface-container-high lg:h-[580px]">
      <img key={slide.photo} src={`/hero/${slide.photo}.webp`} alt={slide.alt} width="1600" height="1200" fetchPriority={frame.index === 0 ? 'high' : 'auto'} className="hero-photo h-full w-full object-cover" onError={event => { if (!event.currentTarget.dataset.fallback) { event.currentTarget.dataset.fallback = 'true'; event.currentTarget.src = fallback; } }} />
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-sm border border-outline-variant bg-white/95 p-2">
        <span className="pl-2 text-xs font-semibold text-on-surface-variant">Everyday inspiration · {frame.index + 1}/{slides.length}</span><div className="flex gap-1">
          <button aria-label="Previous inspiration image" onClick={() => advance(-1)} className="flex min-h-10 min-w-10 items-center justify-center rounded-sm hover:bg-surface-container-low">←</button>
          <button aria-label={paused ? 'Play banner animation' : 'Pause banner animation'} aria-pressed={paused} onClick={() => setPaused(value => !value)} disabled={reduced} className="flex min-h-10 min-w-10 items-center justify-center rounded-sm hover:bg-surface-container-low disabled:opacity-40"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">{paused || reduced ? 'play_arrow' : 'pause'}</span></button>
          <button aria-label="Next inspiration image" onClick={() => advance(1)} className="flex min-h-10 min-w-10 items-center justify-center rounded-sm hover:bg-surface-container-low">→</button>
        </div>
      </div>
    </div></div>
  </section>;
}
