export default function Modal({ title, children, onClose, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${wide ? "max-w-3xl" : "max-w-lg"}`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-slate-100"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}
