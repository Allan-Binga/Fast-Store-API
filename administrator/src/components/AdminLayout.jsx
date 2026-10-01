import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAdmin } from "../store/AdminContext";

const navigation = [
  { label: "Overview", links: [["/", "dashboard", "Dashboard"]] },
  {
    label: "Sales",
    links: [
      ["/checkouts", "shopping_cart_checkout", "Checkouts"],
      ["/orders", "receipt_long", "Orders"],
    ],
  },
  {
    label: "Catalog",
    links: [
      ["/products", "inventory_2", "Products"],
      ["/categories", "category", "Categories"],
      ["/brands", "branding_watermark", "Brands"],
      ["/promotions", "campaign", "Promotions"],
    ],
  },
  {
    label: "Operations",
    links: [
      ["/deliveries", "local_shipping", "Deliveries"],
      ["/refunds", "currency_exchange", "Refunds"],
    ],
  },
];
const links = navigation.flatMap((section) => section.links);

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { admin, logout } = useAdmin();
  const location = useLocation();
  const currentLabel =
    [...links]
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) =>
        path === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(path),
      )?.[2] || "Administration";

  return (
    <div className="min-h-screen bg-surface lg:pl-64">
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-800 px-6">
          <span className="grid size-10 place-items-center rounded-sm bg-primary">
            <span className="material-symbols-outlined">storefront</span>
          </span>
          <div>
            <strong className="block text-lg">FastStore</strong>
            <span className="text-xs text-slate-400">Administration</span>
          </div>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto p-4">
          {navigation.map((section) => (
            <section key={section.label}>
              <p className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[.18em] text-slate-500">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.links.map(([to, icon, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-primary text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`
                    }
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {icon}
                    </span>
                    {label}
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
        </nav>
        <div className="shrink-0 border-t border-slate-800 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <span className="grid size-9 place-items-center rounded-sm bg-slate-800 text-sm font-bold">
              {admin?.firstName?.[0] || "A"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {admin?.firstName
                  ? `${admin.firstName} ${admin.lastName || ""}`
                  : "Administrator"}
              </p>
              <p className="truncate text-xs text-slate-400">{admin?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            Sign out
          </button>
        </div>
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-7">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 lg:hidden"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden text-sm text-muted sm:block">
          Store operations <span className="mx-2">/</span>
          <span className="font-semibold text-ink">{currentLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-sm bg-emerald-500" />
          <span className="text-xs font-bold text-muted">Live API</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-7">
        <Outlet />
      </main>
    </div>
  );
}
