import { Link } from "react-router-dom";
import TopNavbar from "../TopNavbar";
import Footer from "../Footer";
import SignInLink from "../SignInLink";
import { useStore } from "../../store/context";

export const panelClass =
  "rounded-md border border-outline-variant/60 bg-surface-container-lowest p-5 sm:p-6";
export const primaryClass =
  "inline-flex items-center justify-center rounded-sm bg-primary px-5 py-3 text-center font-semibold text-white hover:bg-secondary disabled:opacity-50";
export const secondaryClass =
  "inline-flex items-center justify-center rounded-sm border border-outline-variant px-5 py-3 text-center font-medium hover:bg-surface-container-low disabled:opacity-50";

export function AccountRequired({ children }) {
  const { session, checkSession } = useStore();

  if (session.status === "authenticated") {
    return children;
  }

  return (
    <section className={`${panelClass} mx-auto max-w-lg space-y-4 text-center`}>
      {session.status === "checking" ? (
        <p role="status">Checking your account…</p>
      ) : session.status === "error" ? (
        <>
          <h1 className="text-2xl font-semibold">
            Unable to check your account
          </h1>
          <button className={primaryClass} onClick={checkSession}>
            Try again
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Sign in to continue</h1>
          <p>Your checkout and payment details are linked to your account.</p>
          <SignInLink className={primaryClass}>
            Sign in
          </SignInLink>
        </>
      )}
    </section>
  );
}

export default function CheckoutLayout({ title, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <TopNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant"
        >
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/cart">Cart</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>
        {children}
      </main>
      <Footer />
    </div>
  );
}
