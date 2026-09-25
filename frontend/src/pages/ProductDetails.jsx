// Static Stitch layout. Shopping behavior and API integration are deferred.
export default function ProductDetails() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-full flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">



      {/* SHARED COMPONENT: TopNavBar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-margin py-space-sm max-w-7xl mx-auto w-full gap-4">

          {/* Brand & Left Navigation Links */}
          <div className="flex items-center gap-8">
            <a className="text-headline-md font-headline-md font-extrabold text-primary tracking-tight focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-1" href="/">
              FastStore
            </a>

            {/* Desktop Navigation Categories */}
            <nav aria-label="Global Categories" className="hidden lg:flex items-center gap-6">
              <a className="text-primary font-semibold border-b-2 border-primary pb-1 font-label-md text-label-md" href="#">
                Electronics
              </a>
              <a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors font-label-md text-label-md" href="#">
                Fashion
              </a>
              <a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors font-label-md text-label-md" href="#">
                Home Goods
              </a>
              <a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors font-label-md text-label-md" href="#">
                Accessories
              </a>
            </nav>
          </div>

          {/* Right Action Cluster: Search Bar + Icons */}
          <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl">

            {/* Integrated Search Bar */}
            <div className="relative w-full max-w-md hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-outline">
                <span className="material-symbols-outlined text-lg" data-icon="search" aria-hidden="true">search</span>
              </span>
              <input className="w-full h-11 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Search headphones, brands, audio..." type="search" />
            </div>

            {/* Trailing Icon Actions */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Favorite */}
              <button aria-label="Wishlist" className="p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 relative focus:outline-none focus:ring-2 focus:ring-primary" type="button">
                <span className="material-symbols-outlined align-middle" data-icon="favorite" aria-hidden="true">favorite</span>
              </button>

              {/* Account */}
              <button aria-label="User Account" className="p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 relative focus:outline-none focus:ring-2 focus:ring-primary" type="button">
                <span className="material-symbols-outlined align-middle" data-icon="account_circle" aria-hidden="true">account_circle</span>
              </button>

              {/* Shopping Bag */}
              <button aria-label="Shopping Cart with 3 items" className="p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 relative focus:outline-none focus:ring-2 focus:ring-primary" type="button">
                <span className="material-symbols-outlined align-middle" data-icon="shopping_bag" aria-hidden="true">shopping_bag</span>
                <span className="absolute top-1.5 right-1.5 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-surface-container-lowest">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>



      {/* MAIN PRODUCT CANVAS */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-margin py-space-md">

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="py-space-sm mb-space-sm text-label-sm font-label-sm text-outline">
          <ol className="flex items-center space-x-2 flex-wrap">
            <li>
              <a className="hover:text-primary transition-colors focus:outline-none focus:underline" href="/">Home</a>
            </li>
            <li><span className="material-symbols-outlined text-xs align-middle text-outline" data-icon="chevron_right" aria-hidden="true">chevron_right</span></li>
            <li>
              <a className="hover:text-primary transition-colors focus:outline-none focus:underline" href="#">Electronics</a>
            </li>
            <li><span className="material-symbols-outlined text-xs align-middle text-outline" data-icon="chevron_right" aria-hidden="true">chevron_right</span></li>
            <li>
              <a className="hover:text-primary transition-colors focus:outline-none focus:underline" href="#">Audio</a>
            </li>
            <li><span className="material-symbols-outlined text-xs align-middle text-outline" data-icon="chevron_right" aria-hidden="true">chevron_right</span></li>
            <li aria-current="page" className="text-on-surface font-semibold truncate max-w-xs">
              QuietSound Wireless Headphones
            </li>
          </ol>
        </nav>

        {/* Success Feedback Alert (Dynamically toggled on cart action) */}
        <div className="hidden mb-space-md bg-surface-container-lowest border border-primary/30 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 transition-all duration-300" id="cart-success-alert">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-primary/10 rounded-full text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl" data-icon="check_circle" aria-hidden="true">check_circle</span>
            </span>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface">Added 1 item to your cart!</p>
              <p className="font-body-md text-body-md text-on-surface-variant">QuietSound Noise-Cancelling Wireless Headphones (Midnight Matte)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg transition-colors focus:ring-2 focus:ring-primary" type="button">
              View Cart (4)
            </button>
            <button className="px-4 py-2 bg-primary text-on-primary hover:bg-secondary font-label-md text-label-md rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-primary" type="button">
              Checkout
            </button>
            <button aria-label="Close notification" className="p-1 text-outline hover:text-on-surface rounded-md focus:outline-none" type="button">
              <span className="material-symbols-outlined" data-icon="close" aria-hidden="true">close</span>
            </button>
          </div>
        </div>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-space-xl">

          {/* LEFT COLUMN: Product Gallery Canvas */}
          <section aria-label="Product Media" className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center group shadow-sm">

              {/* Large High-Resolution Product Image */}
              <img className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105" data-alt="A pristine studio shot of premium matte-black over-ear noise-cancelling headphones resting on a minimalist sculptural display plinth. Clean high-key softbox illumination creates subtle geometric reflections on the polished ear-cup hinges. The background is a calm, sterile warm-gray studio gradient with subtle ambient shadows, perfectly complimenting an elegant corporate retail aesthetic." id="main-product-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfeKLXE0iCrDHXnBjb-8YmXm7h-IjRtBkD_OIddIQYT3clbVCsBHLAJNX5UEL4JQXqcnOKJnYas-DNj6INTUyS90pgCna2UZ73zxKb5MRPPr7taP4Mfd1DfRNz7dJy-wt2rAL2XUDCv9RU0Z0nxKO6HSUK-fkSTPAx33VicarF5l0dfGXHkYK2iKBayud5eq52aFA-7zx2B11_g_fIyr_KZud_GqjNuoZyZ3Vg6-N-qNcbYxCSO8N3mQ" />

              {/* Top-Left Category Badge Overlay */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant rounded-full text-caption font-caption font-semibold text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  FastStore Signature Flagship
                </span>
              </div>

              {/* Top-Right Actions (Zoom & Wishlist) */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button aria-label="Save to Wishlist" className="w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant shadow-sm hover:bg-surface-container-low text-on-surface-variant flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-primary focus:outline-none active:scale-95" id="hero-wishlist-toggle" type="button">
                  <span className="material-symbols-outlined text-lg" data-icon="favorite" aria-hidden="true">favorite</span>
                </button>
                <button aria-label="Zoom Product Image" className="w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant shadow-sm hover:bg-surface-container-low text-on-surface-variant flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-primary focus:outline-none active:scale-95" type="button">
                  <span className="material-symbols-outlined text-lg" data-icon="zoom_in" aria-hidden="true">zoom_in</span>
                </button>
              </div>

              {/* Bottom Feature Bar Overlay */}
              <div className="absolute bottom-4 inset-x-4 bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant/60 rounded-xl p-3 flex justify-around text-center text-label-sm font-label-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary" data-icon="graphic_eq" aria-hidden="true">graphic_eq</span>
                  <span>Active ANC 45dB</span>
                </div>
                <div className="h-4 w-px bg-outline-variant"></div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary" data-icon="battery_full" aria-hidden="true">battery_full</span>
                  <span>60-Hr Battery</span>
                </div>
                <div className="h-4 w-px bg-outline-variant"></div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary" data-icon="bolt" aria-hidden="true">bolt</span>
                  <span>Fast Charge USB-C</span>
                </div>
              </div>
            </div>

            {/* Thumbnails Strip */}
            <div className="grid grid-cols-4 gap-3">
              <button className="relative rounded-xl border-2 border-primary overflow-hidden aspect-video bg-surface-container-lowest p-2 focus:outline-none" type="button">
                <img className="w-full h-full object-contain" data-alt="Close-up detail of the plush leatherette memory foam ear cushions on a luxury matte-black wireless headset, highlighting meticulous stitched borders and ergonomic ear contour under diffused studio soft light." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz3y6cAX9OC0ha8uxVYzjcPL9cUEZr68JXdZqxaPJPX64sGP4n_T0MT3YDHdxFQVFZh7xb0JIDWOXE5FNMBl8Nw_aCeTdYl6YDqTqH2VTB0tlO1nR-EyvNAvYMcrTWTz7yASe-E7n2-trwL-NasugxY4TXPi79GSjvXLXfCGuezfForATZujaAyEt-oT4bU-_-j-elcyj-iF_TW1uiZ_UqnHQpSoBgh3pXay47We12XB7RpGA5mavrtA" />
              </button>
              <button className="relative rounded-xl border border-outline-variant hover:border-outline overflow-hidden aspect-video bg-surface-container-lowest p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors" type="button">
                <img className="w-full h-full object-contain" data-alt="Side profile showing the brushed titanium telescoping headband and tactile physical volume rocker buttons on the ear-cup rim of modern high-fidelity studio headphones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7znybnhG4p7uT_Q7mkYvHGCiuHtnzu5FopiEX-0a-k5dhdd__wgRBMDgGbhwmK9fClFHJ_iCAsE7ysA-AQ4rAANtrxw7bgCetNo59L8qr22SmTABf9XE9pN_ivrIXHl5PjnYQJBlxZEJFn52nM9e2JsSX68gReoaxJjCwn-KP3UcR41MxF6wUPum1mLGp8jRrC2EU3fi6wVEsRjse4ISJuuKPb0bQAgSKNxQa9HlxnCVQAcy0MUzhdg" />
              </button>
              <button className="relative rounded-xl border border-outline-variant hover:border-outline overflow-hidden aspect-video bg-surface-container-lowest p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors" type="button">
                <img className="w-full h-full object-contain" data-alt="High quality overhead view of the headphones folded flat inside a molded travel hard-shell case accompanied by braided audio auxiliary cables and gold plated flight adapters on a slate surface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMdXgmazNU5tDbVnuPrwhVjBwHYH125EnVQPLguODPS6qXeps7kuxowIkQq0Mz5dfgfLbZu2PJdR9dvs-tOMfkdsdMqhkuwYYQN2vli4nhoPxYGxccT4V1YNXKO_JGjFxnd-350NAE_Zvn3ZLJ4t0piXIa6_f7nXv9Ct3ysiE8qcwB-FyQ7rNFXmwl-U6vsP0qzhhFWpWPWgwmNaLAy8-nkAXk_gdrmuG9XC5zBa7OquWfaCM2CQi3mw" />
              </button>
              <button className="relative rounded-xl border border-outline-variant hover:border-outline overflow-hidden aspect-video bg-surface-container-lowest p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors flex flex-col items-center justify-center text-on-surface-variant hover:text-primary" type="button">
                <span className="material-symbols-outlined text-2xl" data-icon="360" aria-hidden="true">360</span>
                <span className="text-caption font-caption font-medium">360° View</span>
              </button>
            </div>
          </section>

          {/* RIGHT COLUMN: Details & Purchase Controls */}
          <section aria-label="Purchase and Specifications" className="lg:col-span-5 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">

            {/* Category & Model Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-block px-2.5 py-1 bg-surface-container-low text-primary rounded-md font-label-sm text-label-sm font-semibold tracking-wide">
                PREMIUM OVER-EAR
              </span>
              <span className="text-caption font-caption text-outline">SKU: QS-8802-ANC</span>
            </div>

            {/* Product Title */}
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mb-3">
              QuietSound Noise-Cancelling Wireless Headphones
            </h1>

            {/* Rating & Reviews Bar */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-outline-variant/60">
              <div aria-label="Rating: 4.8 out of 5 stars" className="flex items-center text-amber-500">
                <span className="material-symbols-outlined text-base fill-current" data-icon="star" data-weight="fill" aria-hidden="true">star</span>
                <span className="material-symbols-outlined text-base fill-current" data-icon="star" data-weight="fill" aria-hidden="true">star</span>
                <span className="material-symbols-outlined text-base fill-current" data-icon="star" data-weight="fill" aria-hidden="true">star</span>
                <span className="material-symbols-outlined text-base fill-current" data-icon="star" data-weight="fill" aria-hidden="true">star</span>
                <span className="material-symbols-outlined text-base" data-icon="star_half" aria-hidden="true">star_half</span>
              </div>
              <span className="font-label-md text-label-md font-bold text-on-surface">4.8</span>
              <span className="text-outline text-caption">•</span>
              <a className="text-primary hover:underline font-label-md text-label-md font-medium" href="#reviews">
                342 verified ratings
              </a>
            </div>

            {/* Price Section */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-price-lg text-price-lg text-on-surface font-bold tracking-tight">
                $189.99
              </span>
              <span className="text-body-lg font-body-lg text-outline line-through">
                $249.99
              </span>
              <span className="px-2 py-0.5 bg-error-container text-on-error-container rounded font-label-sm text-label-sm font-bold">
                24% OFF
              </span>
            </div>

            {/* In-Stock Status Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                In Stock - Ready to ship
              </span>
              <span className="text-caption font-caption text-outline">
                Free 2-day delivery with FastStore Express
              </span>
            </div>

            {/* Concise Description */}
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
              Engineered for immersive audio fidelity. Features high-grade hybrid active noise cancellation, custom 40mm bio-cellulose drivers, multi-point Bluetooth 5.3 pairing, and ultra-comfortable protein memory foam earcups for all-day listening.
            </p>

            {/* Color Variant Selector */}
            <div className="mb-6">
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-2">
                Finish: <span className="font-normal text-on-surface-variant" id="color-label">Midnight Matte</span>
              </label>
              <div className="flex items-center gap-3">
                <button aria-label="Midnight Matte Color" className="w-8 h-8 rounded-full bg-slate-900 ring-2 ring-primary ring-offset-2 focus:outline-none" type="button"></button>
                <button aria-label="Lunar Silver Color" className="w-8 h-8 rounded-full bg-slate-200 ring-1 ring-outline-variant hover:ring-2 hover:ring-primary focus:outline-none" type="button"></button>
                <button aria-label="Espresso Brown Color" className="w-8 h-8 rounded-full bg-amber-900 ring-1 ring-outline-variant hover:ring-2 hover:ring-primary focus:outline-none" type="button"></button>
              </div>
            </div>

            {/* Purchase Interaction Controls Form */}
            <form className="space-y-4 pt-2 border-t border-outline-variant/60">
              <div className="flex items-center gap-4">

                {/* Stepper Quantity Selector */}
                <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-lowest h-11">
                  <button aria-label="Decrease quantity" className="px-3.5 h-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary" type="button">
                    <span className="material-symbols-outlined text-sm align-middle" data-icon="remove" aria-hidden="true">remove</span>
                  </button>
                  <input aria-label="Product quantity" className="w-12 text-center border-none p-0 font-label-md text-label-md font-bold text-on-surface focus:ring-0" id="product-quantity" max="99" min="1" type="number" defaultValue="1" />
                  <button aria-label="Increase quantity" className="px-3.5 h-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary" type="button">
                    <span className="material-symbols-outlined text-sm align-middle" data-icon="add" aria-hidden="true">add</span>
                  </button>
                </div>

                {/* Primary Add To Cart Button */}
                <button className="flex-1 h-11 bg-primary-container text-on-primary font-label-md text-label-md font-semibold rounded-lg hover:bg-secondary active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" id="main-add-to-cart-btn" type="submit">
                  <span className="material-symbols-outlined text-lg" data-icon="shopping_bag" aria-hidden="true">shopping_bag</span>
                  Add to Cart
                </button>
              </div>

              {/* Secondary Buy Now and Wishlist Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="h-11 bg-on-background text-surface-container-lowest font-label-md text-label-md font-semibold rounded-lg hover:bg-inverse-surface active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-on-background" id="main-buy-now-btn" type="button">
                  <span className="material-symbols-outlined text-lg" data-icon="bolt" aria-hidden="true">bolt</span>
                  Buy Now
                </button>
                <button className="h-11 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-medium rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary" type="button">
                  <span className="material-symbols-outlined text-lg text-outline" data-icon="bookmark_border" aria-hidden="true">bookmark_border</span>
                  Save to Wishlist
                </button>
              </div>
            </form>

            {/* Account Helper Rewards Prompt */}
            <div className="mt-5 p-3.5 bg-surface-container-low border border-outline-variant/60 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-xl" data-icon="loyalty" aria-hidden="true">loyalty</span>
              <p className="font-caption text-caption text-on-surface">
                <a className="font-bold text-primary hover:underline" href="#">Sign in</a> to earn <strong>190 FastStore Rewards points</strong> ($1.90 value) on this purchase.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-4 border-t border-outline-variant/60 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-outline text-xl mb-1" data-icon="lock" aria-hidden="true">lock</span>
                <span className="text-caption font-caption text-on-surface-variant font-medium">SSL Encrypted</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-outline text-xl mb-1" data-icon="assignment_return" aria-hidden="true">assignment_return</span>
                <span className="text-caption font-caption text-on-surface-variant font-medium">30-Day Returns</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-outline text-xl mb-1" data-icon="verified_user" aria-hidden="true">verified_user</span>
                <span className="text-caption font-caption text-on-surface-variant font-medium">2-Yr Warranty</span>
              </div>
            </div>
          </section>
        </div>



        {/* INTERACTIVE STATE DEMONSTRATION PANEL */}
        <section className="mb-space-xl bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-outline-variant pb-4">
            <div>
              <span className="px-2.5 py-1 bg-surface-container text-primary font-label-sm text-label-sm font-semibold rounded-md">
                Component State Switcher
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface mt-1">Interactive UI States</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Toggle between operational states to preview UI resilience and design token responses.</p>
            </div>

            {/* State Selector Tabs */}
            <div className="inline-flex p-1 bg-surface-container-low rounded-xl border border-outline-variant/60">
              <button className="px-3.5 py-2 rounded-lg text-label-md font-label-md font-semibold bg-surface-container-lowest text-primary shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary" id="tab-state-in-stock" type="button">
                1. In-Stock (Active)
              </button>
              <button className="px-3.5 py-2 rounded-lg text-label-md font-label-md font-medium text-on-surface-variant hover:text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary" id="tab-state-out-of-stock" type="button">
                2. Out of Stock
              </button>
              <button className="px-3.5 py-2 rounded-lg text-label-md font-label-md font-medium text-on-surface-variant hover:text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary" id="tab-state-failed" type="button">
                3. Network Error
              </button>
              <button className="px-3.5 py-2 rounded-lg text-label-md font-label-md font-medium text-on-surface-variant hover:text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary" id="tab-state-skeleton" type="button">
                4. Loading Skeleton
              </button>
            </div>
          </div>

          {/* State 1: Active In-Stock Summary */}
          <div className="block" id="demo-content-state-in-stock">
            <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-2xl" data-icon="check_circle" aria-hidden="true">check_circle</span>
                <div>
                  <p className="font-label-md text-label-md font-semibold text-emerald-950">Normal Catalog State: Inventory Verified</p>
                  <p className="font-caption text-caption text-emerald-800">14 units currently allocated at Regional Fulfillment Center (West Hub).</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-caption font-caption font-bold">Standard Flow Ready</span>
            </div>
          </div>

          {/* State 2: Out of Stock Banner Demo */}
          <div className="hidden" id="demo-content-state-out-of-stock">
            <div className="border border-error/20 bg-error-container/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-error text-on-error rounded-xl">
                  <span className="material-symbols-outlined text-2xl" data-icon="production_quantity_limits" aria-hidden="true">production_quantity_limits</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Currently Unavailable in Your Region</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-4">
                    We're restocking this popular configuration. Sign up to receive an immediate SMS or Email ping when new stock arrives.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 max-w-lg">
                    <input className="flex-1 min-w-[220px] h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md outline-none focus:ring-2 focus:ring-primary" placeholder="Enter your email for notification..." type="email" />
                    <button className="h-11 px-5 bg-on-background text-surface-container-lowest font-label-md text-label-md font-semibold rounded-lg hover:bg-inverse-surface transition-colors" type="button">
                      Notify Me When Available
                    </button>
                  </div>
                </div>
              </div>

              {/* Disabled Mock Controls */}
              <div className="mt-6 pt-6 border-t border-outline-variant/60 flex items-center gap-4 opacity-50 pointer-events-none">
                <button className="h-11 px-8 bg-outline text-white font-label-md text-label-md rounded-lg" disabled="" type="button">Add to Cart (Disabled)</button>
                <button className="h-11 px-8 bg-outline-variant text-on-surface-variant font-label-md text-label-md rounded-lg" disabled="" type="button">Buy Now</button>
                <span className="text-caption font-caption text-error font-medium">Out of Stock SKU</span>
              </div>
            </div>
          </div>

          {/* State 3: Recommendation Failure with Retry */}
          <div className="hidden" id="demo-content-state-failed">
            <div className="border border-outline-variant rounded-xl p-8 text-center bg-surface-container-low flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl" data-icon="cloud_off" aria-hidden="true">cloud_off</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                Failed to load personalized recommendations
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-4">
                Our recommendation engine timed out while retrieving related audio accessories. Your cart and checkout remain unaffected.
              </p>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary hover:bg-secondary font-label-md text-label-md font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-primary" type="button">
                <span className="material-symbols-outlined text-sm" data-icon="refresh" aria-hidden="true">refresh</span>
                Retry Network Connection
              </button>
            </div>
          </div>

          {/* State 4: Loading Skeleton Cards */}
          <div className="hidden" id="demo-content-state-skeleton">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
                <div className="w-full aspect-square bg-surface-container-highest rounded-lg"></div>
                <div className="h-4 bg-surface-container-highest rounded w-1/3"></div>
                <div className="h-5 bg-surface-container-highest rounded w-4/5"></div>
                <div className="h-4 bg-surface-container-highest rounded w-1/2"></div>
                <div className="h-10 bg-surface-container-highest rounded mt-2"></div>
              </div>
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
                <div className="w-full aspect-square bg-surface-container-highest rounded-lg"></div>
                <div className="h-4 bg-surface-container-highest rounded w-1/3"></div>
                <div className="h-5 bg-surface-container-highest rounded w-4/5"></div>
                <div className="h-4 bg-surface-container-highest rounded w-1/2"></div>
                <div className="h-10 bg-surface-container-highest rounded mt-2"></div>
              </div>
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
                <div className="w-full aspect-square bg-surface-container-highest rounded-lg"></div>
                <div className="h-4 bg-surface-container-highest rounded w-1/3"></div>
                <div className="h-5 bg-surface-container-highest rounded w-4/5"></div>
                <div className="h-4 bg-surface-container-highest rounded w-1/2"></div>
                <div className="h-10 bg-surface-container-highest rounded mt-2"></div>
              </div>
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
                <div className="w-full aspect-square bg-surface-container-highest rounded-lg"></div>
                <div className="h-4 bg-surface-container-highest rounded w-1/3"></div>
                <div className="h-5 bg-surface-container-highest rounded w-4/5"></div>
                <div className="h-4 bg-surface-container-highest rounded w-1/2"></div>
                <div className="h-10 bg-surface-container-highest rounded mt-2"></div>
              </div>
            </div>
          </div>
        </section>



        {/* RECOMMENDATIONS / CUSTOMERS ALSO BOUGHT */}
        <section aria-labelledby="recommendations-heading" className="mb-space-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold" id="recommendations-heading">
                Frequently Bought Together
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Recommended audio companions and charging essentials engineered for QuietSound.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Previous items" className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors focus:ring-2 focus:ring-primary" type="button">
                <span className="material-symbols-outlined text-lg align-middle" data-icon="arrow_back" aria-hidden="true">arrow_back</span>
              </button>
              <button aria-label="Next items" className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors focus:ring-2 focus:ring-primary" type="button">
                <span className="material-symbols-outlined text-lg align-middle" data-icon="arrow_forward" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* 4 Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1 */}
            <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md hover:border-outline transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="relative bg-surface-container-low rounded-lg aspect-square mb-3 overflow-hidden flex items-center justify-center">
                  <img className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" data-alt="A premium molded EVA travel hard case tailored for foldable noise-cancelling headphones, displayed zipped closed on a neutral concrete surface with subtle carbon texture finish under bright modern lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi9TDFUim29KPDj7VD3xulyBzm8Un2H3f_3NyGTGD5bNkLNFx93egtEVg--HYWwBy2wBXjPQNsS8PpThJdGJLJaxDCePmAOkVwHdgXZ-oMu8aJv4n4k_H0VSop-njjF9EPDoZ7StALn1XipyKNpHB77vKQchLNJzf8oBeR5u9j3ZDrNEZ2nHFDnpn9p1d2C7n0XZsg3AxHEfBkM0jCEAcKIb9mzAJqbvm72EnVtXeYRvXf5C9Hwl9pSA" />
                  <button aria-label="Add to wishlist" className="absolute top-2 right-2 p-1.5 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-on-surface-variant focus:outline-none" type="button">
                    <span className="material-symbols-outlined text-sm" data-icon="favorite" aria-hidden="true">favorite</span>
                  </button>
                </div>
                <span className="font-caption text-caption text-outline font-medium">Accessories</span>
                <h3 className="font-title-card text-title-card text-on-surface font-semibold line-clamp-1 mt-1 mb-1.5 group-hover:text-primary transition-colors">
                  ShieldGuard EVA Travel Case
                </h3>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-sm text-amber-500 fill-current" data-icon="star" data-weight="fill" aria-hidden="true">star</span>
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">4.9</span>
                  <span className="font-caption text-caption text-outline">(128)</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                <span className="font-price-md text-price-md font-bold text-on-surface">$29.99</span>
                <button className="px-3 py-1.5 bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary rounded-lg font-label-sm text-label-sm font-semibold transition-colors duration-150 flex items-center gap-1" type="button">
                  <span className="material-symbols-outlined text-sm" data-icon="add_shopping_cart" aria-hidden="true">add_shopping_cart</span>
                  Add
                </button>
              </div>
            </article>

            {/* Card 2 */}
            <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md hover:border-outline transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="relative bg-surface-container-low rounded-lg aspect-square mb-3 overflow-hidden flex items-center justify-center">
                  <img className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" data-alt="A sleek anodized aluminum desktop headphone stand in space gray with weighted non-slip silicone base and integrated silicone cable organizer, bathed in calm ambient studio lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLYLj0fJaGyGwqmvwXr_iBNeUWaYgzbfwiuOB-rCIznygZT1PFqzm3jD_OyzcYClwTW68PbpeBlOW0b_02q0Q493frl7CQgYM3s7uJbZ__zXrT8FiziQZsViraLN3-vonSvjEl6PL9i5P8hsD05mVdwJb2usXQPn2OHm_xrQ-RN55ZpE1gt3qCJJWmrH7nKGcT7EKLUHXQ8P2ULu8xWyttFGnLTUT75fdIEgqUE1_B8Fs1g2JAaSdeRQ" />
                  <button aria-label="Add to wishlist" className="absolute top-2 right-2 p-1.5 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-on-surface-variant focus:outline-none" type="button">
                    <span className="material-symbols-outlined text-sm" data-icon="favorite" aria-hidden="true">favorite</span>
                  </button>
                </div>
                <span className="font-caption text-caption text-outline font-medium">Desk Gear</span>
                <h3 className="font-title-card text-title-card text-on-surface font-semibold line-clamp-1 mt-1 mb-1.5 group-hover:text-primary transition-colors">
                  AluStand Desktop Headset Dock
                </h3>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-sm text-amber-500 fill-current" data-icon="star" data-weight="fill" aria-hidden="true">star</span>
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">4.7</span>
                  <span className="font-caption text-caption text-outline">(89)</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                <span className="font-price-md text-price-md font-bold text-on-surface">$34.50</span>
                <button className="px-3 py-1.5 bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary rounded-lg font-label-sm text-label-sm font-semibold transition-colors duration-150 flex items-center gap-1" type="button">
                  <span className="material-symbols-outlined text-sm" data-icon="add_shopping_cart" aria-hidden="true">add_shopping_cart</span>
                  Add
                </button>
              </div>
            </article>

            {/* Card 3 */}
            <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md hover:border-outline transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="relative bg-surface-container-low rounded-lg aspect-square mb-3 overflow-hidden flex items-center justify-center">
                  <img className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" data-alt="A compact dual-port 65-watt GaN fast wall charger with folding prongs and braided blue nylon USB-C fast charging cable on clean white architectural pedestal." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFlG5fTTYP8VtfcO9O0RPlQe8LP89wJo1pv9f_-qO0P4txnwT7tXtXtUJhsMvnHTQzD-7Ql4WKptdBIeeo6037tr4tphuEoGBYPq9XTB8zUnJ-EHvIj9pAGhS3x8hUaHR10bRQkSDJe_n5Rfki8U09ybhl2i1ajJyTlp7gW0tGIG4BVzWl66RKxDKHNVI2viSbfZ4IvKKtjv1d3Eac_NDh4_EpJZ02VWngUNx9JWHKw1wnXoQFA323sg" />
                  <button aria-label="Add to wishlist" className="absolute top-2 right-2 p-1.5 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-on-surface-variant focus:outline-none" type="button">
                    <span className="material-symbols-outlined text-sm" data-icon="favorite" aria-hidden="true">favorite</span>
                  </button>
                </div>
                <span className="font-caption text-caption text-outline font-medium">Power &amp; Cables</span>
                <h3 className="font-title-card text-title-card text-on-surface font-semibold line-clamp-1 mt-1 mb-1.5 group-hover:text-primary transition-colors">
                  PowerSpeed 65W GaN Duo Charger
                </h3>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-sm text-amber-500 fill-current" data-icon="star" data-weight="fill" aria-hidden="true">star</span>
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">4.9</span>
                  <span className="font-caption text-caption text-outline">(412)</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                <span className="font-price-md text-price-md font-bold text-on-surface">$39.99</span>
                <button className="px-3 py-1.5 bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary rounded-lg font-label-sm text-label-sm font-semibold transition-colors duration-150 flex items-center gap-1" type="button">
                  <span className="material-symbols-outlined text-sm" data-icon="add_shopping_cart" aria-hidden="true">add_shopping_cart</span>
                  Add
                </button>
              </div>
            </article>

            {/* Card 4 */}
            <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md hover:border-outline transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="relative bg-surface-container-low rounded-lg aspect-square mb-3 overflow-hidden flex items-center justify-center">
                  <img className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" data-alt="Replacement cooling gel infused velour fabric ear pads designed for premium studio headsets, shown unmounted highlighting airflow perforations and memory foam elasticity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwEa2DNHh_Ni-DvkvRVlCrsL5iuKfTJIpu7CXPwwGXcTmYo0nnDFmwQiXEVOqUGqPNut9yevniUrTJetvPzW8gAcg8CHVbjE23kKnUbODWInpzW66bZ9UZ9ka3y3Y5a-Bk0gC4AOTucb8J0wDZjJTI3NrkgkCwCDnqGYq5r5ZArF3pXDz4WdPZcuBlia0Cft3ZvS2ZO6IDDkTK0PWmmHLNnEsV9du_D9gp2l0wGXHOAGG_4PJnDq1ivQ" />
                  <button aria-label="Add to wishlist" className="absolute top-2 right-2 p-1.5 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-on-surface-variant focus:outline-none" type="button">
                    <span className="material-symbols-outlined text-sm" data-icon="favorite" aria-hidden="true">favorite</span>
                  </button>
                </div>
                <span className="font-caption text-caption text-outline font-medium">Accessories</span>
                <h3 className="font-title-card text-title-card text-on-surface font-semibold line-clamp-1 mt-1 mb-1.5 group-hover:text-primary transition-colors">
                  CoolFreeze Memory Foam Earpads
                </h3>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-sm text-amber-500 fill-current" data-icon="star" data-weight="fill" aria-hidden="true">star</span>
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">4.6</span>
                  <span className="font-caption text-caption text-outline">(64)</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                <span className="font-price-md text-price-md font-bold text-on-surface">$22.00</span>
                <button className="px-3 py-1.5 bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary rounded-lg font-label-sm text-label-sm font-semibold transition-colors duration-150 flex items-center gap-1" type="button">
                  <span className="material-symbols-outlined text-sm" data-icon="add_shopping_cart" aria-hidden="true">add_shopping_cart</span>
                  Add
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>



      {/* SHARED COMPONENT: Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant mt-auto">
        <div className="w-full px-margin py-space-xl max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">

            {/* Col 1: FastStore Identity */}
            <div className="md:col-span-2">
              <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight block mb-3">
                FastStore
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-4">
                Reliable, frictionless shopping for high-performance technology, design-first home accents, and everyday lifestyle essentials.
              </p>
              {/* Col 2: Shop Links */}
              <div className="flex items-center gap-3 text-outline">
                <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors" data-icon="local_shipping" aria-hidden="true">local_shipping</span>
                <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors" data-icon="verified" aria-hidden="true">verified</span>
                <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors" data-icon="shield" aria-hidden="true">shield</span>
                <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors" data-icon="lock" aria-hidden="true">lock</span>
              </div>
            </div>

            {/* Col 3: Customer Service */}
            <div>
              <h4 className="font-label-md text-label-md font-bold text-on-surface mb-3">Shop Departments</h4>
              <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant">
                <li><a className="hover:text-primary transition-colors" href="#">Electronics</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Fashion</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Home Goods</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Accessories</a></li>
              </ul>
            </div>

            {/* Col 4: Legal & Policy */}
            <div>
              <h4 className="font-label-md text-label-md font-bold text-on-surface mb-3">Customer Support</h4>
              <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant">
                <li><a className="hover:text-primary transition-colors" href="#">Order Status</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Shipping &amp; Returns</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Warranty Claims</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-label-md text-label-md font-bold text-on-surface mb-3">Company &amp; Legal</h4>
              <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant">
                <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Cookie Preferences</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Security Overview</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar with exact JSON copyright string */}
          <div className="pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 text-label-sm font-label-sm text-outline">
            <p>© 2024 FastStore Inc. All rights reserved. Secure 256-bit SSL encrypted checkout.</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Systems Operational
              </span>
              <span>•</span>
              <span>PCI-DSS Level 1 Compliant</span>
            </div>
          </div>
        </div>
      </footer>




    </div>
  )
}
