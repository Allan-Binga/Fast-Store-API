import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import TopNavbar from "../components/TopNavbar";

export default function NotFound() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found | FastStore";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body-md text-on-surface">
      <TopNavbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-16 sm:px-8">
        <section className="w-full max-w-xl rounded-md border border-outline-variant bg-surface-container-lowest p-8 text-center  sm:p-12">
          <span aria-hidden="true" className="material-symbols-outlined text-[56px] text-primary">explore_off</span>
          <p className="mt-4 text-label-sm font-semibold uppercase tracking-widest text-primary">Error 404</p>
          <h1 className="mt-2 font-headline-lg text-headline-lg font-semibold">We could not find that page</h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-on-surface-variant">The address may be incorrect, or the page may have moved. You can return to the catalog or review your shopping cart.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/" className="rounded-sm bg-primary px-5 py-3 font-semibold text-white hover:bg-secondary">Browse products</Link>
            <Link to="/cart" className="rounded-sm border border-outline-variant px-5 py-3 font-semibold text-primary hover:bg-surface-container-low">View cart</Link>
            <Link to="/help" className="rounded-sm border border-outline-variant px-5 py-3 font-semibold hover:bg-surface-container-low">Help Center</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
