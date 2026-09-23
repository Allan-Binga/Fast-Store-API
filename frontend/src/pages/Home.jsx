// Static Stitch layout. Shopping behavior and API integration are deferred.
export default function Home() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">



      {/* Sticky Toast Notification (Simulated Added to Cart) */}
      <div className="fixed top-20 right-6 z-50 transition-all duration-300 transform translate-y-0 opacity-100 shadow-xl rounded-xl bg-surface-container-lowest border border-outline-variant p-4 flex items-start gap-3.5 max-w-sm hidden" id="cart-toast">
        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">check_circle</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">Added to Bag</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5 truncate">Aura Studio ANC Headphones - Silver</p>
          <div className="mt-2.5 flex items-center gap-3">
            <a className="text-primary font-label-md text-label-md hover:underline font-semibold" href="/cart">View Bag (3)</a>
            <span className="text-outline-variant">•</span>
            <button className="text-on-surface-variant text-label-md font-label-md hover:text-on-surface" type="button">Dismiss</button>
          </div>
        </div>
        <button aria-label="Close alert" className="text-outline hover:text-on-surface p-1" type="button">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
        </button>
      </div>

      {/* Wishlist Sign-In Prompt Popover (State Overlay Preview) */}
      <div className="fixed top-20 right-28 z-40 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant p-5 w-80" id="wishlist-popover">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm">
            <span className="material-symbols-outlined fill-icon text-[20px] stitch-style-1" aria-hidden="true">favorite</span>
            <span>Saved to Wishlist</span>
          </div>
          <button aria-label="Close popover" className="text-outline hover:text-on-surface" type="button">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
          </button>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Sign in to sync your 2 saved items across desktop and mobile devices.</p>
        <div className="mt-4 flex flex-col gap-2">
          <button className="w-full bg-primary hover:bg-secondary active:scale-95 transition-transform duration-150 text-on-primary py-2 px-3 rounded-lg font-label-md text-label-md text-center font-medium" type="button">Sign In / Register</button>
          <button className="w-full bg-surface-container-low hover:bg-surface-container-high text-on-surface py-2 px-3 rounded-lg font-label-md text-label-md text-center transition-colors" type="button">Continue Browsing</button>
        </div>
      </div>

      {/* Shared TopNavBar Component */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none transition-colors">
        <div className="flex items-center justify-between px-margin py-space-sm max-w-7xl mx-auto w-full gap-6">

          {/* Brand & Navigation Cluster */}
          <div className="flex items-center gap-8">
            <a className="text-headline-md font-headline-md font-extrabold text-primary dark:text-inverse-primary tracking-tight" href="/">
              FastStore
            </a>

            {/* Desktop Category Links */}
            <nav aria-label="Primary Categories" className="hidden md:flex items-center gap-6">
              <a className="text-primary dark:text-inverse-primary font-semibold border-b-2 border-primary dark:border-inverse-primary pb-1 font-label-md text-label-md" href="#electronics">Electronics</a>
              <a className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors font-label-md text-label-md" href="#fashion">Fashion</a>
              <a className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors font-label-md text-label-md" href="#home-goods">Home Goods</a>
              <a className="text-on-surface-variant dark:text-outline-variant font-medium hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors font-label-md text-label-md" href="#accessories">Accessories</a>
            </nav>
          </div>

          {/* Prominent Search Bar on Right */}
          <div className="flex-1 max-w-lg relative hidden sm:block">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none" aria-hidden="true">search</span>
              <input aria-label="Search all products" className="w-full pl-10 pr-24 py-2 text-body-md font-body-md rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search audio, minimal apparel, ergonomic chairs..." type="search" defaultValue="Studio" />
              <div className="absolute right-2 flex items-center gap-1">
                <span className="text-[11px] font-caption bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded border border-outline-variant/60 font-medium">⌘K</span>
              </div>
            </div>

            {/* Search Auto-Suggestions Flyout Preview */}
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-2 z-50">
              <div className="px-2.5 py-1 text-label-sm font-label-sm text-outline uppercase tracking-wider">Suggested Queries</div>
              <a className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-surface-container-low transition-colors group" href="#electronics">
                <span className="flex items-center gap-2.5 text-body-md font-body-md text-on-surface">
                  <span className="material-symbols-outlined text-outline text-[18px]" aria-hidden="true">search</span>
                  <span><strong className="text-primary font-medium">Studio</strong> Noise-Canceling Headphones</span>
                </span>
                <span className="text-caption font-caption text-outline group-hover:text-primary">in Electronics</span>
              </a>
              <a className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-surface-container-low transition-colors group" href="#accessories">
                <span className="flex items-center gap-2.5 text-body-md font-body-md text-on-surface">
                  <span className="material-symbols-outlined text-outline text-[18px]" aria-hidden="true">search</span>
                  <span><strong className="text-primary font-medium">Studio</strong> Monitor Ceramic Desk Lamp</span>
                </span>
                <span className="text-caption font-caption text-outline group-hover:text-primary">in Home Goods</span>
              </a>
            </div>
          </div>

          {/* Trailing Action Icons */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Wishlist */}
            <button aria-label="Wishlist 2 items" className="relative p-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low active:scale-95 transition-all" type="button">
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">favorite</span>
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-on-primary font-label-sm text-[10px] font-bold rounded-full flex items-center justify-center leading-none">2</span>
            </button>

            {/* Account Menu */}
            <button aria-label="User Account" className="flex items-center gap-2 p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low active:scale-95 transition-all" type="button">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">account_circle</span>
              <span className="hidden xl:inline text-label-md font-label-md font-medium text-on-surface">Alex M.</span>
            </button>

            {/* Cart Bag */}
            <a aria-label="Shopping Cart 3 items" className="relative flex items-center gap-2 py-2 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high active:scale-95 transition-all border border-outline-variant/60" href="/cart">
              <span className="material-symbols-outlined text-[22px] text-primary" aria-hidden="true">shopping_bag</span>
              <span className="font-label-md text-label-md font-semibold text-primary">Bag</span>
              <span className="w-5 h-5 bg-primary text-on-primary font-label-sm text-[11px] font-bold rounded-full flex items-center justify-center leading-none">3</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-margin py-space-lg space-y-12">

        {/* Promotional Hero Section */}
        <section aria-labelledby="hero-title" className="relative overflow-hidden rounded-2xl bg-surface-container-low border border-outline-variant/70 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px] items-center">

            {/* Hero Text */}
            <div className="lg:col-span-6 p-8 lg:p-14 z-10 flex flex-col justify-center space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant text-primary font-label-sm text-label-sm font-semibold w-fit">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">bolt</span>
                <span>New Season Release 2024</span>
              </div>
              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight" id="hero-title">
                Elevate your everyday essentials
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
                Thoughtfully curated electronics, tailored apparel, and serene home goods designed for effortless modern utility and timeless quality.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-primary hover:bg-secondary text-on-primary font-label-md text-label-md font-semibold shadow-sm hover:shadow active:scale-95 transition-all duration-150" href="#featured">
                  Shop now
                  <span className="material-symbols-outlined ml-2 text-[18px]" aria-hidden="true">arrow_forward</span>
                </a>
                <a className="inline-flex items-center justify-center px-5 py-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container font-label-md text-label-md font-medium active:scale-95 transition-all duration-150" href="#deals">
                  Explore Deals
                </a>
              </div>

              {/* Trust Badges Under Hero */}
              <div className="pt-4 flex items-center gap-6 text-label-sm font-label-sm text-on-surface-variant border-t border-outline-variant/60">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">local_shipping</span> Free 2-day delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">verified</span> 2-Year Warranty
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">refresh</span> 30-Day Returns
                </span>
              </div>
            </div>

            {/* Hero Image Container */}
            <div className="lg:col-span-6 h-72 lg:h-full relative overflow-hidden bg-surface-container">
              <img className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700" data-alt="A curated, ultra-minimalist lifestyle still life featuring high-end wireless matte silver headphones resting beside an architectural stone dish, a ceramic coffee cup, and a sleek brushed titanium wristwatch on a soft off-white surface. The composition is bathed in gentle, diffuse daylight from a large window with soft shadows. The overall aesthetic is modern, bright, premium, and uncluttered, matching a clean white and soft slate blue palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqa-ZsBjI25F0OD8YQxUK4F6FdGN4ujUPr-09-Eq8fW8uOFw4CiI4JOHxJ76joehrRnv0mxoMqqESpXm1sYKyZNn-8_lknHIVtT13d7KpiXXsJGkXPJR4vtrA-NNr0MxFXjPfRYXCtZOVIjo6AS53Li0zhO3H-f_Fy9ikV8liejYu5d760RYzjwKSyUxZRkVE_Y6gL-JDgyGRqzl3Kl8FbavkI2Ll-XybKAHJWbiXwyRzULCCrQU4HCQ" />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-surface-container-low via-transparent to-transparent opacity-80 pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* Compact Category Tiles */}
        <section aria-labelledby="categories-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface" id="categories-heading">Explore Departments</h2>
            <a className="font-label-md text-label-md text-primary hover:underline font-semibold flex items-center gap-1" href="#">
              All categories <span className="material-symbols-outlined text-[16px]" aria-hidden="true">chevron_right</span>
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Electronics */}
            <a className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant hover:border-primary hover:shadow-md transition-all duration-200" href="#electronics">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined text-[26px]" aria-hidden="true">devices</span>
              </div>
              <div>
                <h3 className="font-title-card text-title-card text-on-surface group-hover:text-primary transition-colors">Electronics</h3>
                <p className="font-label-sm text-label-sm text-outline mt-0.5">340+ items</p>
              </div>
            </a>

            {/* Fashion */}
            <a className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant hover:border-primary hover:shadow-md transition-all duration-200" href="#fashion">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined text-[26px]" aria-hidden="true">styler</span>
              </div>
              <div>
                <h3 className="font-title-card text-title-card text-on-surface group-hover:text-primary transition-colors">Fashion</h3>
                <p className="font-label-sm text-label-sm text-outline mt-0.5">520+ items</p>
              </div>
            </a>

            {/* Home Goods */}
            <a className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant hover:border-primary hover:shadow-md transition-all duration-200" href="#home-goods">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined text-[26px]" aria-hidden="true">chair</span>
              </div>
              <div>
                <h3 className="font-title-card text-title-card text-on-surface group-hover:text-primary transition-colors">Home Goods</h3>
                <p className="font-label-sm text-label-sm text-outline mt-0.5">280+ items</p>
              </div>
            </a>

            {/* Accessories */}
            <a className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant hover:border-primary hover:shadow-md transition-all duration-200" href="#accessories">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined text-[26px]" aria-hidden="true">watch</span>
              </div>
              <div>
                <h3 className="font-title-card text-title-card text-on-surface group-hover:text-primary transition-colors">Accessories</h3>
                <p className="font-label-sm text-label-sm text-outline mt-0.5">190+ items</p>
              </div>
            </a>
          </div>
        </section>

        {/* Limited Deals of the Week (Timer Badge & Promotion) */}
        <section aria-labelledby="deals-heading" className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm space-y-6" id="deals">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold uppercase">Limited Offer</span>
                <h2 className="font-headline-md text-headline-md text-on-surface" id="deals-heading">Deals of the Week</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Special weekly pricing on essential gear with guaranteed next-day dispatch.</p>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">timer</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Ends in:</span>
              <div className="flex items-center gap-1 font-headline-sm text-headline-sm font-bold text-on-surface">
                <span className="bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant">18</span>
                <span>:</span>
                <span className="bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant">42</span>
                <span>:</span>
                <span className="bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant">09</span>
              </div>
            </div>
          </div>

          {/* Deals 2-Column Spotlight Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Deal Item 1 */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-surface-bright border border-outline-variant/80 hover:shadow-md transition-all">
              <div className="w-full sm:w-44 h-44 rounded-lg bg-surface-container shrink-0 overflow-hidden relative">
                <img className="w-full h-full object-cover" data-alt="Close-up commercial photography of sleek wireless studio headphones with memory foam ear cushions in a refined matte charcoal finish. The product is angled symmetrically under crisp diffuse studio strobe lighting, placed against an airy clean gray-white backdrop. Modern Scandinavian aesthetic with sharp texture details and calm blue subtle highlights." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEyWtOSjtUAdyeTkjvm9orpconF5mjMOR4Prc2jeMDuryL-ev-Vq08hpkf2-AxDsPVp081Gxq7Tt5fcDBN63c_HYRUE41qGN4WZEnoQFUYUyrVGSIk7x9Y9d3HguR_0ZJ2O3MLcf98EuuttlsEvEivhJW8YgIedRrEMfiI7tMqzyuIJhfheQ9DH56CiAChUSUWJY7i-jaV_idzblCIlqUkDMeDfJ1Iskf0v5Yx7-Swd49ncKXMV6rCSg" />
                <span className="absolute top-2 left-2 bg-primary text-on-primary font-label-sm text-[11px] font-bold px-2 py-0.5 rounded">SAVE 30%</span>
              </div>
              <div className="flex-1 min-w-0 space-y-2.5 w-full">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Electronics</span>
                <h3 className="font-title-card text-title-card text-on-surface line-clamp-2"><a href="/products/demo">Aura Studio ANC Wireless Headphones with Spatial Audio</a></h3>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[16px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[16px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[16px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[16px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[16px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline-variant font-medium">4.9 (248)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-price-lg text-price-lg text-primary">$179.00</span>
                  <span className="font-body-md text-body-md text-outline line-through">$249.00</span>
                </div>
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-secondary text-on-primary font-label-md text-label-md font-semibold active:scale-95 transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">shopping_bag</span>
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>

            {/* Deal Item 2 */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-surface-bright border border-outline-variant/80 hover:shadow-md transition-all">
              <div className="w-full sm:w-44 h-44 rounded-lg bg-surface-container shrink-0 overflow-hidden relative">
                <img className="w-full h-full object-cover" data-alt="Product photograph of a minimalist matte black automatic coffee maker with stainless steel carafe and digital display interface. Placed in a serene contemporary kitchen nook with white subway tiles and natural wooden worktop, softly lit by morning window sunlight. Clean, functional, and uncluttered composition." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDET49RLXneS63CWFyPgfj1szihjS2Nq8Cj7NImW612g-CYw8NWyD5tUsEj9Qp5IHDO5snWB4hHx6iXYBUzDWOWGy4KouSPk3wIcakwhUs0-by860V7Z9X5WsYLLvhLZalH-vGQIUjK2xDp3s0T_cZfntPELTNe7Ju5j9-nA6cdB9GtfkfZjmg9QZQ8AfMOFoEH5Wdgs3LFS-k0U_HHiObYUXkbHJCwVyJckcs0HmsqpsVjxgstAzS_wA" />
                <span className="absolute top-2 left-2 bg-primary text-on-primary font-label-sm text-[11px] font-bold px-2 py-0.5 rounded">SAVE 25%</span>
              </div>
              <div className="flex-1 min-w-0 space-y-2.5 w-full">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Home Goods</span>
                <h3 className="font-title-card text-title-card text-on-surface line-clamp-2">Precision Thermal Brew Coffee Maker (12-Cup Capacity)</h3>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[16px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[16px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[16px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[16px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">star</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline-variant font-medium">4.7 (112)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-price-lg text-price-lg text-primary">$119.00</span>
                  <span className="font-body-md text-body-md text-outline line-through">$159.00</span>
                </div>
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-secondary text-on-primary font-label-md text-label-md font-semibold active:scale-95 transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">shopping_bag</span>
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Grid (4 Columns) */}
        <section aria-labelledby="featured-heading" className="space-y-6" id="featured">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface" id="featured-heading">Featured Products</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Selected by our editors for enduring durability and quiet elegance.</p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button className="px-3.5 py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold" type="button">All Items</button>
              <button className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md text-label-md font-medium transition-colors" type="button">Electronics</button>
              <button className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md text-label-md font-medium transition-colors" type="button">Fashion</button>
              <button className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md text-label-md font-medium transition-colors" type="button">Home Goods</button>
            </div>
          </div>

          {/* 4-Column Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: Electronics */}
            <div className="group bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden hover:shadow-md hover:border-outline transition-all flex flex-col justify-between">
              <div className="relative bg-surface-container-low aspect-[4/5] overflow-hidden flex items-center justify-center">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Editorial product shot of an ultra-slim aluminum portable mechanical keyboard with low-profile keycaps in neutral tones. Arranged symmetrically on an immaculate light-gray desk surface with soft balanced shadows and high-end tech aesthetic. Clean background without clutter." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0D2treeDKWryMKl-kWp0MyVDSL_gAfxI16x1aqEzSxI51_FJH_YQyM5kx_seZsh4a_w2oa2C0YAQ6irDUw8PvvkaFqwuD1j4jsuEj0FjnUorijpknO1Bq8GS1JPuBMECGqOKK6ZVS9JBo_yjaDDc96tv5lsX-nIp-0bMHGr9TQ2TW2MwWQYRe_IYrNC8HzACkhXR4Fgt0grmSRumFW4S73WSTtrqsqealdPkJn8lE3D_z31eF05oReA" />
                <span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/80 text-primary font-label-sm text-[11px] font-bold px-2 py-0.5 rounded">NEW</span>
                <button aria-label="Add to wishlist" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/80 flex items-center justify-center text-outline hover:text-primary hover:scale-110 transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">favorite</span>
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <p className="font-label-sm text-label-sm text-outline">Electronics</p>
                  <h3 className="font-title-card text-title-card text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    Nomad Slim Mechanical Bluetooth Keyboard
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline-variant">4.9 (88)</span>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <div>
                    <span className="font-price-md text-price-md text-on-surface">$129.00</span>
                  </div>
                  <button aria-label="Add to cart" className="p-2.5 rounded-lg bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary transition-colors active:scale-95" type="button">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Fashion */}
            <div className="group bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden hover:shadow-md hover:border-outline transition-all flex flex-col justify-between">
              <div className="relative bg-surface-container-low aspect-[4/5] overflow-hidden flex items-center justify-center">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Studio catalog photograph of a tailored unisex heavy organic cotton crewneck sweatshirt in heather dove gray. Hung delicately on a light natural wood hanger against a pristine off-white wall with soft morning illumination. Minimalist high-fashion retail presentation." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWtCf0zskW3-u5H-OULhRlTonkPRMMhukEDg0joxctSsxvyzchr8qsSjdcXKNQBGaRDArl_Kwnwq7O8h3WfhzKRoIMou78qgSGll2Q0uJ15KZOP-aOpureeMa6mRshzzWSUnB58a5tylmpLoxec4ACquhfYgi25ZypC4OHRz92vjcCDCzYvy1Pl9m2QAZzfT650A6gNnGeYBn888CpYDNB5J3RP1krdVIKLRPZ0Rq7l8vJM4dvEDHfNg" />
                <span className="absolute top-3 left-3 bg-primary text-on-primary font-label-sm text-[11px] font-bold px-2 py-0.5 rounded">-15%</span>
                <button aria-label="Add to wishlist" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/80 flex items-center justify-center text-primary hover:scale-110 transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px] fill-icon stitch-style-1" aria-hidden="true">favorite</span>
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <p className="font-label-sm text-label-sm text-outline">Fashion</p>
                  <h3 className="font-title-card text-title-card text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    Heavyweight French Terry Crewneck Sweatshirt
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">star</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline-variant">4.6 (142)</span>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-price-md text-price-md text-on-surface">$68.00</span>
                    <span className="font-body-md text-body-md text-outline line-through">$80.00</span>
                  </div>
                  <button aria-label="Add to cart" className="p-2.5 rounded-lg bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary transition-colors active:scale-95" type="button">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Home Goods (Simulated Out-of-Stock State) */}
            <div className="group bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden hover:shadow-md hover:border-outline transition-all flex flex-col justify-between relative">
              <div className="relative bg-surface-container-low aspect-[4/5] overflow-hidden flex items-center justify-center">
                <img className="w-full h-full object-cover grayscale opacity-75 group-hover:scale-105 transition-transform duration-500" data-alt="Commercial studio photo of an artisan stoneware ceramic desk lamp with a ribbed textured cream body and linen drum shade. Positioned neatly on a modern light oak tabletop against a smooth light taupe wall, with warm ambient illumination radiating from within the shade." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAerXkaOl8TyeWzraAb79-SEV_ct8uNLWHo5JdBngcQeenPLnYpJ8hKd1_rAxrmIFoMzSXugnawtTzT3nL53Lm7vEqo-1HFWI9y8Gq6tE3NKA6H9VUkVJ2Qd4Z2z7DbAwBhDDBkUtd0QX5M0kaPF4E4E9N09Gw6eyKgXoVuUveicy6VbOTOQNy9Tp4vaT_QzSS5Pj6S13Geg82NyI7dgCpqYeMp4jZr_D_fpR2Ll8XAzwwMADhD4kKQ_g" />

                {/* Out-of-Stock Tag */}
                <span className="absolute top-3 left-3 bg-inverse-surface text-inverse-on-surface font-label-sm text-[11px] font-semibold px-2.5 py-1 rounded">Out of Stock</span>
                <button aria-label="Add to wishlist" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/80 flex items-center justify-center text-outline hover:text-primary hover:scale-110 transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">favorite</span>
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <p className="font-label-sm text-label-sm text-outline">Home Goods</p>
                  <h3 className="font-title-card text-title-card text-on-surface line-clamp-2">
                    Nordic Ribbed Ceramic Table Lamp with Dimmer
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline-variant">4.9 (64)</span>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <div>
                    <span className="font-price-md text-price-md text-on-surface-variant">$85.00</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm cursor-not-allowed" disabled="" type="button">
                    Notify Me
                  </button>
                </div>
              </div>
            </div>

            {/* Card 4: Accessories */}
            <div className="group bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden hover:shadow-md hover:border-outline transition-all flex flex-col justify-between">
              <div className="relative bg-surface-container-low aspect-[4/5] overflow-hidden flex items-center justify-center">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Product photograph of a minimalist matte titanium chronograph wristwatch with a charcoal fluoroelastomer strap resting on a natural white limestone block. Crisp studio high-key lighting showcasing refined metallic chamfers, sapphire crystal glass reflection, and quiet luxury aesthetics." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6d2WglZyN9OynWgNtjDarRAwwqMoeD9fdJ9RU5iL4KjqyPt598Zx5KtAnvYMbT2oN9KNheG1gfZzdDwN-Ht9Jo86Vr41Sf0fOM0HAahKbKO-ry9P2bvJIV0qWBR9PrN2GSE_1eBXwBvy4sSYMOzJnrjYdBM8n241gPYeN3a4QqyOA4OiIiiG3Z8KRaL9zxrzVB5AcQmwTVPvJfIH9UjMjS4bm7ALLOghmm-mDOUR-IfTvq38H77TL2w" />
                <span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/80 text-primary font-label-sm text-[11px] font-bold px-2 py-0.5 rounded">POPULAR</span>
                <button aria-label="Add to wishlist" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/80 flex items-center justify-center text-outline hover:text-primary hover:scale-110 transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">favorite</span>
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <p className="font-label-sm text-label-sm text-outline">Accessories</p>
                  <h3 className="font-title-card text-title-card text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    Aero Titanium Chronograph 40mm Watch
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px] fill-icon stitch-style-1" aria-hidden="true">star</span>
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">star</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline-variant">4.8 (196)</span>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <div>
                    <span className="font-price-md text-price-md text-on-surface">$210.00</span>
                  </div>
                  <button aria-label="Add to cart" className="p-2.5 rounded-lg bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary transition-colors active:scale-95" type="button">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Skeleton Preview & Recently Viewed Shelf */}
        <section aria-labelledby="recently-viewed-heading" className="space-y-4 pt-4 border-t border-outline-variant/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface" id="recently-viewed-heading">Recently Viewed</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Pick up where you left off across your active session.</p>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Scroll left" className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors" type="button">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
              </button>
              <button aria-label="Scroll right" className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors" type="button">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Horizontal Shelf with 3 Actual Items + 1 Loading Skeleton Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Shelf Item 1 */}
            <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-xl flex gap-3.5 items-center hover:border-outline transition-colors">
              <div className="w-20 h-20 bg-surface-container rounded-lg overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" data-alt="Minimalist product photo of a sleek aluminum multi-port USB-C docking hub with braided dark cable on a bright desktop surface. Natural daylight and clear product texture." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDblJgwBgUJHL2aotHn-wKjmMPW_oy4JGkllkT_bHl0Hb_LC5CvG3BQq8rcm9tRcs-pr9N41_gTd_fRucUK2yJFNiOVzW-xnCxpeWzyxKQpgkjT8mfoP4TzB5aJbdruGhgeFOIn15GLEh5C6syyQX9gnnZvnNxzEJgh0O93I6YlHyQkUI8fREKdx3Lo165AGCp3z0j9BKf_mskTeIkVThgAFzTkUZVbJpRjbIKKL_0DQ-UeM1ULMkvA5A" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-title-card text-title-card text-on-surface truncate">HyperPort 7-in-1 Hub</p>
                <p className="font-price-md text-price-md text-primary mt-0.5">$54.00</p>
                <button className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary mt-1 underline" type="button">View Item</button>
              </div>
            </div>

            {/* Shelf Item 2 */}
            <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-xl flex gap-3.5 items-center hover:border-outline transition-colors">
              <div className="w-20 h-20 bg-surface-container rounded-lg overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" data-alt="Clean retail photo of an insulated matte white stainless steel travel water bottle sitting upright next to an open notebook on a sunny tabletop. Clean, high-key light mode style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAluT0rgQb5MBshVPNzWo_fCayxOxbhjcapJTxahZ_yMHHxho1pgjJhjaAqxx5W7Pie0-KeMXflMrDPVP88PlLL27ZJ7DQVmx0Fnh66fr8r5fT8FUOm0DWGm3ZwFqGQGMXv_-WLeo84aY_wb0lmhERJ6hMK1POkZRASQm8FXFEnSRyhwLs5kJGcv9IJ6XQOb34C4HAYTHq0lM38fwZGxRJ2oovmje8ZKXAzJaDeG9BnbmpSnTCdSv8tEg" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-title-card text-title-card text-on-surface truncate">Vacuum Flask 750ml</p>
                <p className="font-price-md text-price-md text-primary mt-0.5">$32.00</p>
                <button className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary mt-1 underline" type="button">View Item</button>
              </div>
            </div>

            {/* Shelf Item 3 */}
            <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-xl flex gap-3.5 items-center hover:border-outline transition-colors">
              <div className="w-20 h-20 bg-surface-container rounded-lg overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" data-alt="Crisp close-up shot of a full-grain vegetable tanned black leather minimalist cardholder wallet with three credit cards neatly slotted. High contrast, sharp stitching detail, pure white background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh1yefPU3MZFSulS53RPdew7_fokS7GpoefjriZbsuzjH4QjUK0ZXws3PejWm5ADrPyyKpqyY1A7EqyK_RkAHvd-trUU6s1TGPLmz46vZ8PyAVctx4GxFLKBDfVmj62B8YcKdSdSlWQ9b-K362B-muoJVzJFmBEQoDQu64i9nsKzHW4gt5GOso2K5v2BnTeC_jqbo-2qEeNK78UXHF7BKDSOqgHXTtFI9q43Ueu3Kuegsl-49Bk4VjSg" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-title-card text-title-card text-on-surface truncate">Slim Leather Cardholder</p>
                <p className="font-price-md text-price-md text-primary mt-0.5">$45.00</p>
                <button className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary mt-1 underline" type="button">View Item</button>
              </div>
            </div>

            {/* Interactive Skeleton Loader Demo Item */}
            <div aria-label="Loading placeholder" className="p-3 bg-surface-container-lowest border border-outline-variant/60 rounded-xl flex gap-3.5 items-center animate-pulse">
              <div className="w-20 h-20 bg-surface-container-high rounded-lg shrink-0"></div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 bg-surface-container-high rounded w-4/5"></div>
                <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
                <div className="h-3 bg-surface-container-highest rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Shared Footer Component */}
      <footer className="mt-16 bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline">
        <div className="w-full px-margin py-space-xl max-w-7xl mx-auto space-y-10">

          {/* Upper Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <a className="text-headline-md font-headline-md font-bold text-primary dark:text-inverse-primary" href="/">FastStore</a>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant max-w-sm">
                Fast, transparent, and frictionless retail. Quality gear backed by transparent customer service and rapid fulfillment.
              </p>
              <div className="flex items-center gap-3 pt-2 text-on-surface-variant">
                <span className="inline-flex items-center gap-1.5 text-label-sm font-label-sm bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/60">
                  <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">lock</span> 256-Bit SSL Encrypted
                </span>
              </div>
            </div>

            {/* Links Column 1: Departments */}
            <div className="space-y-3">
              <p className="font-headline-sm text-headline-sm font-semibold text-on-surface dark:text-inverse-on-surface">Shop</p>
              <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant dark:text-outline-variant">
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#electronics">Electronics</a></li>
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#fashion">Fashion</a></li>
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#home-goods">Home Goods</a></li>
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#accessories">Accessories</a></li>
              </ul>
            </div>

            {/* Links Column 2: Customer Care */}
            <div className="space-y-3">
              <p className="font-headline-sm text-headline-sm font-semibold text-on-surface dark:text-inverse-on-surface">Customer Care</p>
              <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant dark:text-outline-variant">
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#">Order Status</a></li>
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#">Shipping &amp; Returns</a></li>
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#">Help Center</a></li>
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#">Warranty Info</a></li>
              </ul>
            </div>

            {/* Links Column 3: Legal & Trust */}
            <div className="space-y-3">
              <p className="font-headline-sm text-headline-sm font-semibold text-on-surface dark:text-inverse-on-surface">Legal</p>
              <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant dark:text-outline-variant">
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#">Terms of Service</a></li>
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#">Security Overview</a></li>
                <li><a className="hover:text-primary dark:hover:text-inverse-primary transition-colors" href="#">Cookie Settings</a></li>
              </ul>
            </div>
          </div>

          {/* Lower Copyright Note */}
          <div className="pt-8 border-t border-outline-variant/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-outline-variant">
              © 2024 FastStore Inc. All rights reserved. Secure 256-bit SSL encrypted checkout.
            </p>
            <div className="flex items-center gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]" title="Credit Cards" aria-hidden="true">credit_card</span>
              <span className="material-symbols-outlined text-[20px]" title="Account Security" aria-hidden="true">shield</span>
              <span className="material-symbols-outlined text-[20px]" title="Express Delivery" aria-hidden="true">local_shipping</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
