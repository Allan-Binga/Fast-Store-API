import { NavLink } from "react-router-dom";

const accountLinks = [
  { to: "/wallet", label: "Wallet", icon: "account_balance_wallet" },
  { to: "/orders", label: "Orders", icon: "receipt_long" },
  { to: "/deliveries", label: "Deliveries", icon: "local_shipping" },
  { to: "/refunds", label: "Refunds", icon: "currency_exchange" },
  { to: "/account/addresses", label: "Addresses", icon: "location_on" },
];

export default function CustomerAccountNav() {
  return (
    <nav
      aria-label="Customer account"
      className="mb-6 overflow-x-auto rounded-md border border-outline-variant/60 bg-surface-container-lowest p-2"
    >
      <div className="flex min-w-max gap-1">
        {accountLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `inline-flex min-h-11 items-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`
            }
          >
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[19px]"
            >
              {link.icon}
            </span>
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
