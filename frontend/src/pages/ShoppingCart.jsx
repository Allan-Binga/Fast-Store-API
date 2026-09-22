// Static Stitch layout. Shopping behavior and API integration are deferred.
export default function ShoppingCart() {
  return (
<div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">

{/* TopNavBar (Shared Component) */}
<header className="w-full bg-surface-container-lowest shadow-sm border-b border-outline-variant sticky top-0 z-40">
<div className="flex items-center justify-between px-margin py-space-sm max-w-7xl mx-auto w-full gap-6">

{/* Brand & Navigation Links */}
<div className="flex items-center gap-8">
<a className="text-headline-md font-headline-md font-extrabold text-primary tracking-tight" href="/">FastStore</a>
<nav className="hidden md:flex items-center gap-6">
<a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors text-label-md font-label-md" href="#">Electronics</a>
<a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors text-label-md font-label-md" href="#">Fashion</a>
<a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors text-label-md font-label-md" href="#">Home Goods</a>
<a className="text-on-surface-variant font-medium hover:text-on-surface transition-colors text-label-md font-label-md" href="#">Accessories</a>
</nav>
</div>

{/* Right Search & Trailing Actions */}
<div className="flex items-center gap-4 flex-1 max-w-md justify-end">

{/* Integrated Search Bar */}
<div className="relative w-full max-w-xs">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true">search</span>
<input className="w-full h-[40px] pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all" placeholder="Search products, brands..." type="text" />
</div>

{/* Trailing Actions (favorite, account_circle, shopping_bag) */}
<div className="flex items-center gap-1">
<button aria-label="Wishlist" className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-150" type="button">
<span className="material-symbols-outlined text-[22px]" aria-hidden="true">favorite</span>
</button>
<button aria-label="Account" className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-150" type="button">
<span className="material-symbols-outlined text-[22px]" aria-hidden="true">account_circle</span>
</button>

{/* Active Cart Indicator */}
<a aria-label="Shopping Cart" className="relative w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-high text-primary font-semibold transition-colors active:scale-95 duration-150" href="/cart">
<span className="material-symbols-outlined text-[22px] stitch-style-1" aria-hidden="true">shopping_bag</span>
<span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-sm" id="nav-cart-badge">3</span>
</a>
</div>
</div>
</div>
</header>

{/* Main Canvas */}
<main className="flex-grow max-w-7xl mx-auto w-full px-margin py-space-lg">

{/* Cart Header Bar & State Toggle */}
<div className="flex flex-col md:flex-row md:items-center justify-between pb-space-md border-b border-outline-variant gap-4 mb-space-lg">
<div className="flex items-baseline gap-3">
<h1 className="text-headline-lg font-headline-lg text-on-background">Shopping Cart</h1>
<span className="text-body-lg font-body-lg text-outline" id="cart-item-count-label">(3 items)</span>
</div>

{/* Preview State Switcher */}
<div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 shadow-sm">
<span className="text-label-sm font-label-sm text-on-surface-variant font-medium">Demo State:</span>
<button className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-primary font-medium text-label-sm font-label-sm transition-all" id="toggle-state-btn" type="button">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">swap_horiz</span>
<span id="toggle-state-text">View Empty Cart</span>
</button>
</div>
</div>

{/* Interactive Network Error Toast Banner */}
<div className="mb-space-lg rounded-xl border border-error-container bg-error-container/40 p-space-md flex items-center justify-between shadow-sm transition-all duration-300" id="network-error-banner">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-lg bg-error text-on-error flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]" aria-hidden="true">error_outline</span>
</div>
<div>
<p className="text-title-card font-title-card text-on-error-container font-semibold">Could not update quantity. Network error.</p>
<p className="text-caption font-caption text-outline">An attempt to synchronize the inventory state timed out. Please retry.</p>
</div>
</div>
<div className="flex items-center gap-3">
<button className="h-[36px] px-4 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors active:scale-95 duration-150" type="button">
          Retry
        </button>
<button aria-label="Dismiss error" className="w-8 h-8 rounded flex items-center justify-center text-outline hover:text-on-surface transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
</button>
</div>
</div>

{/* Active Cart View (2 Columns) */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start" id="active-cart-view">

{/* Left Column: Items Table / List (8 cols) */}
<div className="lg:col-span-8 flex flex-col gap-space-md">
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">

{/* Desktop Table Header Row */}
<div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-surface-container-low border-b border-outline-variant text-label-sm font-label-sm text-outline uppercase tracking-wider font-semibold">
<div className="col-span-6">Product</div>
<div className="col-span-2 text-right">Unit Price</div>
<div className="col-span-2 text-center">Quantity</div>
<div className="col-span-2 text-right">Subtotal</div>
</div>

{/* Product Items List */}
<div className="divide-y divide-outline-variant/60" id="cart-item-container">

{/* Item 1: QuietSound Wireless Headphones */}
<article className="p-6 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-surface/50" id="item-row-1">
<div className="col-span-6 flex items-start gap-4">
<div className="w-20 h-20 rounded-lg bg-surface-container-low shrink-0 overflow-hidden border border-outline-variant/50 relative">
<img className="w-full h-full object-cover" data-alt="Minimal sleek matte black over-ear wireless headphones resting cleanly on a pale studio stone podium with subtle blue neon ambient side lighting, captured in modern high-key product catalog style with clean edges and smooth textures" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd9NMdMVUeHjFvHKND_poTX_MLp1bfOanYRag0B5-qVn7NLwOFU4zfLL0UrgFxlbHOXhiG87b2Z6hykDcR-FsVhreZvLZuGpb6uXH5y3zKdONuKyzxG0zg-FQetHzLLYkdMUD0MPyiuMhRuqoOB12a46yJN07bH1rltFLot0TtV3AYCl9sPSnav59dhBbx731S94uCNtEzSfEVvuHvf4uvxAHl_H_ZLLnynRPw_Px0j9j2Go9b84AaAg" />
</div>
<div className="flex flex-col justify-center">
<span className="text-caption font-caption text-outline">Audio &amp; Accessories</span>
<h3 className="text-title-card font-title-card text-on-surface font-semibold leading-tight mt-0.5">QuietSound Wireless Headphones</h3>
<span className="text-caption font-caption text-outline mt-1">Color: Midnight Matte • In Stock</span>
<div className="flex items-center gap-4 mt-2">
<button className="text-label-sm font-label-sm text-primary hover:underline flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[15px]" aria-hidden="true">bookmark_border</span>
                      Save for later
                    </button>
<button className="text-label-sm font-label-sm text-error hover:underline flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[15px]" aria-hidden="true">delete_outline</span>
                      Remove
                    </button>
</div>
</div>
</div>
<div className="col-span-2 text-right">
<span className="text-body-md font-body-md text-on-surface font-medium">$189.99</span>
</div>
<div className="col-span-2 flex justify-center">

{/* Stepper */}
<div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-lowest h-9">
<button aria-label="Decrease quantity" className="w-8 h-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low rounded-l-lg transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">remove</span>
</button>
<span className="w-9 text-center text-label-md font-label-md font-semibold text-on-surface" id="qty-val-1">1</span>
<button aria-label="Increase quantity" className="w-8 h-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low rounded-r-lg transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
</button>
</div>
</div>
<div className="col-span-2 text-right">
<span className="text-price-md font-price-md text-on-surface font-bold" id="subtotal-val-1">$189.99</span>
</div>
</article>

{/* Item 2: Organic Cotton Everyday Crewneck */}
<article className="p-6 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-surface/50" id="item-row-2">
<div className="col-span-6 flex items-start gap-4">
<div className="w-20 h-20 rounded-lg bg-surface-container-low shrink-0 overflow-hidden border border-outline-variant/50 relative">
<img className="w-full h-full object-cover" data-alt="A neatly folded premium organic cotton crewneck sweatshirt in soft heather gray against a clean warm white tabletop backdrop with delicate soft directional lighting and crisp fabric texture detail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiP0K-SbLyN1TEtcuHtpzYZijKdWIqhSWEFGxtxS1UBH8g_Yl361xMYrsckWVw-Nvq_JuMQDTifjf0gdrXsj0d6DdBTl-yo6fqxBo7qgOX2VVk9SYScOPi3fdlm7MfJfvsEGMV__zgOhscxYtmauZ12uHgKLTP7_j_CCvaYACUWDmpVSKoWuB1yap-1PAPYbScquMaY7MTjGVw-IGGG5hfAbePjf8nY93TjlrRVZpKFCy2o8vTkRiYzw" />
</div>
<div className="flex flex-col justify-center">
<span className="text-caption font-caption text-outline">Men's Apparel</span>
<h3 className="text-title-card font-title-card text-on-surface font-semibold leading-tight mt-0.5">Organic Cotton Everyday Crewneck</h3>
<span className="text-caption font-caption text-outline mt-1">Size: M • Color: Heather Gray</span>
<div className="flex items-center gap-4 mt-2">
<button className="text-label-sm font-label-sm text-primary hover:underline flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[15px]" aria-hidden="true">bookmark_border</span>
                      Save for later
                    </button>
<button className="text-label-sm font-label-sm text-error hover:underline flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[15px]" aria-hidden="true">delete_outline</span>
                      Remove
                    </button>
</div>
</div>
</div>
<div className="col-span-2 text-right">
<span className="text-body-md font-body-md text-on-surface font-medium">$42.00</span>
</div>
<div className="col-span-2 flex justify-center">

{/* Stepper */}
<div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-lowest h-9">
<button aria-label="Decrease quantity" className="w-8 h-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low rounded-l-lg transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">remove</span>
</button>
<span className="w-9 text-center text-label-md font-label-md font-semibold text-on-surface" id="qty-val-2">2</span>
<button aria-label="Increase quantity" className="w-8 h-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low rounded-r-lg transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
</button>
</div>
</div>
<div className="col-span-2 text-right">
<span className="text-price-md font-price-md text-on-surface font-bold" id="subtotal-val-2">$84.00</span>
</div>
</article>

{/* Item 3: Minimalist Ceramic Desk Lamp */}
<article className="p-6 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-surface/50" id="item-row-3">
<div className="col-span-6 flex items-start gap-4">
<div className="w-20 h-20 rounded-lg bg-surface-container-low shrink-0 overflow-hidden border border-outline-variant/50 relative">
<img className="w-full h-full object-cover" data-alt="Minimalist architectural ceramic desk lamp with clean curved geometry and off-white matte glaze sitting gracefully on a contemporary light ashwood desk surface in clean daylight studio setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwTDK410F_DjeYtyNuAoHc6FValTUfd5xyCoF7YhIIxz7t22I7D6FtH5ygI-ZqoFpfUN1w8vtGYC9BzOMUbfLBQ1d7bqNlqyjsIxcK_gYUDHjJkASk5pcpNQTrBKNt7i22QrzS9Tplmn0LZ6s2TxDWD-YVn-RMm_hm9thiKBMBwdZwBdWv1NHvumv5dz_v5ikU9oYPY8dt05wpy3MS1OsZfgCiuoLalDgRl_sqH9Dk3SoBB4vt8Q0pWQ" />
</div>
<div className="flex flex-col justify-center">
<span className="text-caption font-caption text-outline">Home &amp; Lighting</span>
<h3 className="text-title-card font-title-card text-on-surface font-semibold leading-tight mt-0.5">Minimalist Ceramic Desk Lamp</h3>
<span className="text-caption font-caption text-outline mt-1">Finish: Matte Clay • Warm LED</span>
<div className="flex items-center gap-4 mt-2">
<button className="text-label-sm font-label-sm text-primary hover:underline flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[15px]" aria-hidden="true">bookmark_border</span>
                      Save for later
                    </button>
<button className="text-label-sm font-label-sm text-error hover:underline flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[15px]" aria-hidden="true">delete_outline</span>
                      Remove
                    </button>
</div>
</div>
</div>
<div className="col-span-2 text-right">
<span className="text-body-md font-body-md text-on-surface font-medium">$68.00</span>
</div>
<div className="col-span-2 flex justify-center">

{/* Stepper */}
<div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-lowest h-9">
<button aria-label="Decrease quantity" className="w-8 h-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low rounded-l-lg transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">remove</span>
</button>
<span className="w-9 text-center text-label-md font-label-md font-semibold text-on-surface" id="qty-val-3">1</span>
<button aria-label="Increase quantity" className="w-8 h-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low rounded-r-lg transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
</button>
</div>
</div>
<div className="col-span-2 text-right">
<span className="text-price-md font-price-md text-on-surface font-bold" id="subtotal-val-3">$68.00</span>
</div>
</article>
</div>
</div>

{/* Safe Checkout Assurance Strip */}
<div className="flex flex-wrap items-center justify-between p-space-md bg-surface-container-low rounded-xl border border-outline-variant/60 text-caption font-caption text-on-surface-variant gap-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">verified_user</span>
<span>FastStore 30-Day Money-Back Guarantee</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">local_shipping</span>
<span>Free Express Delivery over $99</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">lock</span>
<span>Zero fraud liability protection</span>
</div>
</div>
</div>

{/* Right Column: Order Summary Sidebar (4 cols) */}
<div className="lg:col-span-4 flex flex-col gap-space-md">
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm sticky top-24">
<h2 className="text-headline-sm font-headline-sm text-on-surface font-semibold pb-4 border-b border-outline-variant">Order Summary</h2>

{/* Price Calculation Lines */}
<div className="py-4 space-y-3 border-b border-outline-variant text-body-md font-body-md">
<div className="flex items-center justify-between">
<span className="text-outline">Subtotal</span>
<span className="font-medium text-on-surface" id="summary-subtotal">$341.99</span>
</div>
<div className="flex items-center justify-between">
<span className="text-outline flex items-center gap-1">
                Standard Shipping
                <span className="material-symbols-outlined text-outline text-[16px] cursor-help" title="Eligible for free shipping" aria-hidden="true">help_outline</span>
</span>
<span className="font-medium text-emerald-600">Free</span>
</div>
<div className="flex items-center justify-between">
<span className="text-outline">Estimated Sales Tax</span>
<span className="text-outline-variant text-caption font-caption">Calculated at checkout</span>
</div>
</div>

{/* Total Due Row */}
<div className="py-4 flex items-baseline justify-between">
<div>
<span className="text-title-card font-title-card font-semibold text-on-surface block">Total</span>
<span className="text-caption font-caption text-outline">Includes applicable sales taxes</span>
</div>
<span className="text-price-lg font-price-lg font-bold text-primary" id="summary-total">$341.99</span>
</div>

{/* Primary CTA Button */}
<button className="w-full h-[48px] bg-primary-container hover:bg-secondary text-on-primary font-label-md text-label-md font-semibold rounded-lg shadow-sm transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 group mb-4" type="button">
<span>Continue to secure checkout</span>
<span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
</button>

{/* Stripe & Security Badges */}
<div className="flex flex-col items-center gap-2 pt-2 text-caption font-caption text-outline">
<div className="flex items-center gap-2 text-on-surface-variant font-medium">
<span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">lock</span>
<span>Proceeds to Stripe's hosted payment page</span>
</div>
<div className="flex items-center justify-center gap-3 mt-1">
<div className="flex items-center gap-1 border border-outline-variant/80 rounded px-2 py-1 bg-surface-container-low text-[11px] font-semibold text-on-surface">
<span className="material-symbols-outlined text-[14px] text-secondary" aria-hidden="true">verified</span>
<span>Stripe</span>
</div>
<div className="flex items-center gap-1 border border-outline-variant/80 rounded px-2 py-1 bg-surface-container-low text-[11px] font-medium text-outline">
<span className="material-symbols-outlined text-[14px]" aria-hidden="true">shield</span>
<span>256-bit SSL</span>
</div>
<div className="flex items-center gap-1 border border-outline-variant/80 rounded px-2 py-1 bg-surface-container-low text-[11px] font-medium text-outline">
<span className="material-symbols-outlined text-[14px]" aria-hidden="true">bolt</span>
<span>Instant Auth</span>
</div>
</div>
</div>

{/* Promo Code Accordion */}
<div className="mt-6 pt-4 border-t border-outline-variant">
<details className="group cursor-pointer">
<summary className="flex items-center justify-between text-label-md font-label-md text-on-surface font-medium select-none list-none">
<span className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">sell</span>
                  Have a promo or gift code?
                </span>
<span className="material-symbols-outlined text-[18px] text-outline transition-transform group-open:rotate-180" aria-hidden="true">expand_more</span>
</summary>
<div className="pt-3 pb-1 flex gap-2">
<input className="h-[40px] px-3 w-full bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 uppercase text-on-surface placeholder:normal-case placeholder:text-outline" placeholder="Enter coupon code" type="text" />
<button className="h-[40px] px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors active:scale-95 duration-150" type="button">
                  Apply
                </button>
</div>
</details>
</div>
</div>
</div>
</div>

{/* Empty Cart Preview Section (Initially Hidden / Toggled) */}
<div className="hidden py-16 px-4" id="empty-cart-view">
<div className="max-w-md mx-auto text-center bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
<div className="w-20 h-20 rounded-full bg-surface-container-low mx-auto flex items-center justify-center text-outline mb-4">
<span className="material-symbols-outlined text-[40px]" aria-hidden="true">shopping_bag</span>
</div>
<h2 className="text-headline-md font-headline-md text-on-surface font-bold mb-2">Your cart is currently empty</h2>
<p className="text-body-md font-body-md text-outline mb-6">
          Looks like you haven't added anything to your cart yet. Explore our curated collections to discover exceptional everyday products.
        </p>
<button className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-lg bg-primary-container hover:bg-secondary text-on-primary font-label-md text-label-md font-semibold transition-all active:scale-95 duration-150 shadow-sm" type="button">
<span className="material-symbols-outlined text-[20px]" aria-hidden="true">storefront</span>
<span>Continue Shopping</span>
</button>
</div>
</div>

{/* Recently Viewed Items Carousel / Grid */}
<section className="mt-space-xl pt-space-lg border-t border-outline-variant">
<div className="flex items-center justify-between mb-space-md">
<div>
<h2 className="text-headline-md font-headline-md text-on-surface font-bold">Recently Viewed</h2>
<p className="text-caption font-caption text-outline">Items you checked out during your current session</p>
</div>
<div className="flex items-center gap-2">
<button aria-label="Previous items" className="w-9 h-9 rounded-lg border border-outline-variant bg-surface-container-lowest flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_left</span>
</button>
<button aria-label="Next items" className="w-9 h-9 rounded-lg border border-outline-variant bg-surface-container-lowest flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_right</span>
</button>
</div>
</div>

{/* Bento-style Card Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">

{/* Rec Card 1 */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
<div className="aspect-square bg-surface-container-low overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="High quality titanium stainless steel smartwatch with vibrant high resolution color display resting tilted on stone surface with dramatic soft ambient studio light in pristine light mode" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWw2p4JoAPDO1Im6eweJ0KeHNod3W1iiuVpyRSFAlXuLDJSO6HSxY-FoPBfwSkJu5pGpKw-_ilm4gJ0O95f9OHQxLK_AcAXJEC48M6ajVQVzj_SOj_wkg9jYg2Bdt5IHnxcd5R1XhGRy_gNKmjQ6h8EjztzzO7XgqnZj66u_QRiaE11uET4EXrhwGSydcOipu30yKHN4Aymf7gJ26QIuqs6rRhk69molrCqXn_btYmdCCk6KtxT38g0w" />
<button aria-label="Add to wishlist" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-outline hover:text-error transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">favorite</span>
</button>
</div>
<div className="p-4 flex flex-col flex-grow justify-between">
<div>
<span className="text-caption font-caption text-outline">Accessories</span>
<h3 className="text-title-card font-title-card text-on-surface font-medium line-clamp-1 mt-0.5">Titanium Precision Smartwatch</h3>
<div className="flex items-center gap-1.5 mt-1.5">
<div className="flex text-amber-500">
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star_half</span>
</div>
<span className="text-label-sm font-label-sm text-outline">4.8 (84)</span>
</div>
</div>
<div className="flex items-center justify-between pt-3 mt-2 border-t border-outline-variant/60">
<span className="text-price-md font-price-md font-bold text-on-surface">$249.00</span>
<button className="h-8 px-3 rounded-lg bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary font-label-sm text-label-sm font-semibold transition-all" type="button">
                Add to Cart
              </button>
</div>
</div>
</div>

{/* Rec Card 2 */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
<div className="aspect-square bg-surface-container-low overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Ergonomic minimalist aluminum wireless mechanical keyboard on a pristine white desk layout with clean diffuse light highlighting the low profile textured keys and refined chamfered edges" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2XP3R0Qio4RdZ-ZeJigdHkLxUUbnyTthIFRgEm6vssTWL4V42l6RrzwWOT32sPaa8GkymMlc23-jf-EsdjAQ3ckjaIiPXX4vMI8AJeVxDlru34zv3cIHNdDVLXHwki6WTbeFHd6hC8kkfkRXd7w2jJUFbeaVqP8VWMhiYPE7w6FfP5mhBgmnI9WbERd96uBCkbkSVCmv9-Oczq1HlIauEkP8C5BXTbQjO8IU9GVupY5lT05GZpy3Srw" />
<button aria-label="Add to wishlist" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-outline hover:text-error transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">favorite</span>
</button>
</div>
<div className="p-4 flex flex-col flex-grow justify-between">
<div>
<span className="text-caption font-caption text-outline">Electronics</span>
<h3 className="text-title-card font-title-card text-on-surface font-medium line-clamp-1 mt-0.5">Slim Wireless Mechanical Keyboard</h3>
<div className="flex items-center gap-1.5 mt-1.5">
<div className="flex text-amber-500">
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
</div>
<span className="text-label-sm font-label-sm text-outline">5.0 (212)</span>
</div>
</div>
<div className="flex items-center justify-between pt-3 mt-2 border-t border-outline-variant/60">
<span className="text-price-md font-price-md font-bold text-on-surface">$129.50</span>
<button className="h-8 px-3 rounded-lg bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary font-label-sm text-label-sm font-semibold transition-all" type="button">
                Add to Cart
              </button>
</div>
</div>
</div>

{/* Rec Card 3 */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
<div className="aspect-square bg-surface-container-low overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Double wall insulated stainless steel matte stone-white travel coffee mug sitting on a light oak wooden coaster with subtle steam rising in a bright modern kitchen environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3h5BRnTqULm_ouK0jIo1uyuQpUKnYR_fZot2MkvaudGCbXJsR_t_lXJ9DeTRWWzSiW6ZXSIoKK8pIGKyA80brtPIyk514RzkUWYhpWJkxxy8Eld0kRA_KccBiNGhetlKFqXOsutpJQaP6HfA2i881nr6ndRrxFrUmx1q4-gbVI_R8JOakXr3F63FusLLpKYdkn77NDILd-rDPv7d1An7lX5gCA7hJXCgEBmMujV2XKaYCgy41M8vJiA" />
<button aria-label="Add to wishlist" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-outline hover:text-error transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">favorite</span>
</button>
</div>
<div className="p-4 flex flex-col flex-grow justify-between">
<div>
<span className="text-caption font-caption text-outline">Home Goods</span>
<h3 className="text-title-card font-title-card text-on-surface font-medium line-clamp-1 mt-0.5">Insulated Ceramic Tumbler 16oz</h3>
<div className="flex items-center gap-1.5 mt-1.5">
<div className="flex text-amber-500">
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px]" aria-hidden="true">star</span>
</div>
<span className="text-label-sm font-label-sm text-outline">4.6 (39)</span>
</div>
</div>
<div className="flex items-center justify-between pt-3 mt-2 border-t border-outline-variant/60">
<span className="text-price-md font-price-md font-bold text-on-surface">$34.00</span>
<button className="h-8 px-3 rounded-lg bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary font-label-sm text-label-sm font-semibold transition-all" type="button">
                Add to Cart
              </button>
</div>
</div>
</div>

{/* Rec Card 4 */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
<div className="aspect-square bg-surface-container-low overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Refined Italian full-grain leather bifold minimalist card wallet in chestnut brown resting open on a light textured linen surface with balanced gentle daylight highlights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNE8eh7fqcIe1oBC289WfUwUEk8h6O_DYKCF7WB-Z6tF0gR098nWXJv2AMn5D9KKcx6V_2e4MhJSSudGQ0k3y1vMTD7aXPTLivstX6nLOCKnmPnrvF1hajH0jZiA-gjVjg0S0LqFHi4BRV90_-gwA8yfUYzj4gNfFCJczIcURc3Y3Y04QA0eD3uNOg7CZsFiSILUouZhcIXNBH68RQBVYnNC0kzL93UtKIQstFOqf_kGHwVWzi_MAEdg" />
<button aria-label="Add to wishlist" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-outline hover:text-error transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">favorite</span>
</button>
</div>
<div className="p-4 flex flex-col flex-grow justify-between">
<div>
<span className="text-caption font-caption text-outline">Accessories</span>
<h3 className="text-title-card font-title-card text-on-surface font-medium line-clamp-1 mt-0.5">Classic Leather Card Sleeve</h3>
<div className="flex items-center gap-1.5 mt-1.5">
<div className="flex text-amber-500">
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star</span>
<span className="material-symbols-outlined text-[15px] stitch-style-1" aria-hidden="true">star_half</span>
</div>
<span className="text-label-sm font-label-sm text-outline">4.7 (158)</span>
</div>
</div>
<div className="flex items-center justify-between pt-3 mt-2 border-t border-outline-variant/60">
<span className="text-price-md font-price-md font-bold text-on-surface">$48.00</span>
<button className="h-8 px-3 rounded-lg bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary font-label-sm text-label-sm font-semibold transition-all" type="button">
                Add to Cart
              </button>
</div>
</div>
</div>
</div>
</section>
</main>

{/* Footer (Shared Component) */}
<footer className="w-full bg-surface-container-lowest border-t border-outline-variant mt-space-xl">
<div className="w-full px-margin py-space-xl max-w-7xl mx-auto flex flex-col gap-8">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
<div>
<span className="text-headline-md font-headline-md font-bold text-primary">FastStore</span>
<p className="text-body-md font-body-md text-on-surface-variant mt-1">Frictionless digital shopping with verified quality and swift delivery.</p>
</div>

{/* Navigation Links Grid */}
<div className="flex flex-wrap gap-x-6 gap-y-2">
<a className="text-on-surface-variant text-body-md font-body-md hover:text-on-surface transition-colors" href="#">Electronics</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:text-on-surface transition-colors" href="#">Fashion</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:text-on-surface transition-colors" href="#">Home Goods</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:text-on-surface transition-colors" href="#">Accessories</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:text-on-surface transition-colors" href="#">Order Status</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:text-on-surface transition-colors" href="#">Shipping &amp; Returns</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:text-on-surface transition-colors" href="#">Help Center</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
<a className="text-on-surface-variant text-body-md font-body-md hover:text-on-surface transition-colors" href="#">Terms of Service</a>
</div>
</div>
<div className="pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between text-caption font-caption text-outline gap-4">
<p>© 2024 FastStore Inc. All rights reserved. Secure 256-bit SSL encrypted checkout.</p>
<div className="flex items-center gap-4">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]" aria-hidden="true">lock</span> 256-bit Encryption</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]" aria-hidden="true">credit_card</span> Stripe Verified</span>
</div>
</div>
</div>
</footer>


</div>
  )
}
