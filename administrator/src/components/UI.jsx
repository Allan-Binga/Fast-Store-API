/* eslint-disable react-refresh/only-export-components */
export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-md border-2 border-line bg-white ${className}`}
    >
      {children}
    </section>
  );
}
export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const styles =
    variant === "secondary"
      ? "border border-line bg-white text-ink hover:bg-slate-50"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700"
        : "bg-primary text-white hover:bg-primary-dark";
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <div className="mt-1.5">{children}</div>
      {hint && (
        <span className="mt-1 block text-xs font-normal text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}
export const inputClass =
  "min-h-11 w-full rounded-sm border border-line bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
export function Empty({ icon = "inbox", title, text }) {
  return (
    <div className="px-6 py-14 text-center">
      <span className="material-symbols-outlined text-4xl text-slate-300">
        {icon}
      </span>
      <h3 className="mt-2 font-bold">{title}</h3>
      {text && <p className="mt-1 text-sm text-muted">{text}</p>}
    </div>
  );
}
export function SkeletonRows({ rows = 5 }) {
  return (
    <div role="status" aria-label="Loading content" aria-busy="true" className="space-y-3 p-5">
      <span className="sr-only">Loading content…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-sm bg-slate-100"
        />
      ))}
    </div>
  );
}
export function StatusBadge({ value }) {
  const key = String(value || "unknown").toLowerCase();
  const color =
    key.includes("paid") ||
    key.includes("delivered") ||
    key.includes("approved") ||
    key.includes("active")
      ? "bg-emerald-50 text-emerald-700"
      : key.includes("requested") ||
          key.includes("pending") ||
          key.includes("processing") ||
          key.includes("transit")
        ? "bg-amber-50 text-amber-700"
        : key.includes("fail") ||
            key.includes("reject") ||
            key.includes("cancel") ||
            key.includes("out")
          ? "bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${color}`}
    >
      {String(value || "unknown").replaceAll("_", " ")}
    </span>
  );
}
export const money = (value, currency = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: String(currency || "USD").toUpperCase(),
  }).format(Number(value || 0));
export const shortDate = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
