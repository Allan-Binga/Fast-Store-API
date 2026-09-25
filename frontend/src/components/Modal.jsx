import { useEffect, useId, useRef } from 'react'

export default function Modal({ title, onClose, children }) {
  const dialog = useRef(null)
  const titleId = useId()
  useEffect(() => {
    const element = dialog.current
    const previous = document.activeElement
    element.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={onClose} className="m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[85dvh] overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 text-on-surface shadow-xl backdrop:bg-black/40">
    <div className="flex items-center justify-between gap-4 mb-6">
      <h2 id={titleId} className="font-headline-md text-headline-md">{title}</h2>
      <button type="button" aria-label="Close dialog" onClick={onClose} className="rounded-full p-2 hover:bg-surface-container"><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
    </div>
    {children}
  </dialog>
}
