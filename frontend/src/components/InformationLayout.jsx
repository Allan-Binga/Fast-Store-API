import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import TopNavbar from "./TopNavbar";

export function InfoSection({ title, children }) {
  return (
    <section className="space-y-3 border-t border-outline-variant/60 pt-6 first:border-t-0 first:pt-0">
      <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
        {title}
      </h2>
      <div className="space-y-3 leading-7 text-on-surface-variant">
        {children}
      </div>
    </section>
  );
}

export function InfoList({ children }) {
  return <ul className="list-disc space-y-2 pl-6">{children}</ul>;
}

export function InfoCallout({ children }) {
  return (
    <div className="rounded-md border border-primary/20 bg-surface-container-low p-4 text-on-surface">
      {children}
    </div>
  );
}

export default function InformationLayout({ title, intro, children }) {
  useEffect(() => {
    const previous = document.title;
    document.title = title + " | FastStore";
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body-md text-on-surface">
      <TopNavbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-outline">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>

        <header className="mb-8 rounded-md border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-label-sm font-semibold uppercase tracking-wider text-primary">
            FastStore information
          </p>
          <h1 className="font-headline-lg text-headline-lg font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-body-lg leading-7 text-on-surface-variant">
            {intro}
          </p>
          <p className="mt-4 text-caption text-outline">Last updated: September 28, 2026</p>
        </header>

        <article className="space-y-7 rounded-md border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-8">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}
