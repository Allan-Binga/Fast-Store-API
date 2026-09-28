import { Link } from "react-router-dom";

const shopLinks = ["Electronics", "Fashion", "Home Goods", "Accessories"];

const customerCareLinks = [
  { label: "Order Status", to: "/orders" },
  { label: "Shipping & Returns", to: "/#shipping-returns" },
  { label: "Help Center", to: "/#help-center" },
  { label: "Warranty Info", to: "/#warranty" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/#privacy-policy" },
  { label: "Terms of Service", to: "/#terms-of-service" },
  { label: "Security Overview", to: "/#security" },
  { label: "Cookie Settings", to: "/#cookie-settings" },
];

const linkClass =
  "transition-colors hover:text-primary dark:hover:text-inverse-primary";

function FooterLinkGroup({ title, links }) {
  return (
    <div className="space-y-3">
      <p className="font-headline-sm text-headline-sm font-semibold text-on-surface dark:text-inverse-on-surface">
        {title}
      </p>
      <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant dark:text-outline-variant">
        {links.map((link) => (
          <li key={link.label}>
            <Link className={linkClass} to={link.to}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShopLinks() {
  return (
    <div className="space-y-3">
      <p className="font-headline-sm text-headline-sm font-semibold text-on-surface dark:text-inverse-on-surface">
        Shop
      </p>
      <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant dark:text-outline-variant">
        {shopLinks.map((category) => (
          <li key={category}>
            <Link
              className={linkClass}
              to={`/?${new URLSearchParams({ category })}#featured`}
            >
              {category}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrustIcons() {
  return (
    <div className="flex items-center gap-4 text-on-surface-variant dark:text-outline-variant">
      <span
        aria-label="Credit cards accepted"
        className="material-symbols-outlined text-[20px]"
        role="img"
        title="Credit Cards"
      >
        credit_card
      </span>
      <span
        aria-label="Account security"
        className="material-symbols-outlined text-[20px]"
        role="img"
        title="Account Security"
      >
        shield
      </span>
      <span
        aria-label="Express delivery"
        className="material-symbols-outlined text-[20px]"
        role="img"
        title="Express Delivery"
      >
        local_shipping
      </span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-outline-variant bg-surface-container-lowest dark:border-outline dark:bg-inverse-surface">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-margin py-space-xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="space-y-4 md:col-span-2">
            <Link
              className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary"
              to="/"
            >
              FastStore
            </Link>
            <p className="max-w-sm font-body-md text-body-md text-on-surface-variant dark:text-outline-variant">
              Fast, transparent, and frictionless retail. Quality gear backed by
              transparent customer service and rapid fulfillment.
            </p>
            <div className="flex items-center gap-3 pt-2 text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-low px-3 py-1 font-label-sm text-label-sm">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[16px] text-primary"
                >
                  lock
                </span>
                256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          <ShopLinks />
          <FooterLinkGroup title="Customer Care" links={customerCareLinks} />
          <FooterLinkGroup title="Legal" links={legalLinks} />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant/60 pt-8 sm:flex-row">
          <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-outline-variant">
            © {new Date().getFullYear()} FastStore Inc. All rights reserved.
            Secure 256-bit SSL encrypted checkout.
          </p>
          <TrustIcons />
        </div>
      </div>
    </footer>
  );
}
