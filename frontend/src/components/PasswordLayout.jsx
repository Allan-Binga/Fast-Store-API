import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer'

export default function PasswordLayout({ title, children }) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} — FastStore`
    return () => { document.title = previous }
  }, [title])
  return <div className="flex min-h-screen flex-col bg-surface font-body-md text-on-surface">
    <header className="border-b border-outline-variant bg-white"><div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8"><Link to="/" className="font-headline-md text-headline-md font-extrabold text-primary">FastStore</Link><Link to="/" className="text-sm text-primary hover:underline">Continue browsing</Link></div></header>
    <main className="relative flex flex-1 items-center justify-center px-4 py-12"><div className="w-full max-w-md"><section className="space-y-5 rounded-md border border-outline-variant bg-white p-6  sm:p-8">{children}</section><p className="mt-5 text-center text-caption text-outline">Reset links expire after 30 minutes. Use the newest link.</p></div></main>
    <Footer />
  </div>
}
